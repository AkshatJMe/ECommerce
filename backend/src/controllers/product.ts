import { Request } from "express"; // Importing the Request type from Express
import { redis, redisTTL } from "../app.js"; // Importing Redis client and TTL (Time-To-Live) value from app configuration
import { TryCatch } from "../middlewares/error.js"; // Importing TryCatch middleware for error handling
import { Product } from "../model/product.js"; // Importing the Product model
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js"; // Importing TypeScript types (not used in the provided code but might be used elsewhere)
import {
  deleteFromCloudinary,
  findAverageRatings,
  invalidateCache,
  uploadToCloudinary,
} from "../utils/features.js"; // Importing utility functions (not used in the provided code but might be used elsewhere)
import ErrorHandler from "../utils/utilityClass.js"; // Importing the ErrorHandler class for custom error handling
import { User } from "../model/user.js"; // Importing the User model (not used in the provided code but might be used elsewhere)
import { Review } from "../model/review.js"; // Importing the Review model (not used in the provided code but might be used elsewhere)

// Controller to get the latest 5 products
// Uses Redis caching to avoid querying the database frequently
export const getlatestProducts = TryCatch(async (req, res, next) => {
  let products;

  // Try to get cached products from Redis
  products = await redis.get("latest-products");

  if (products) {
    // If cached, parse the JSON string into an object
    products = JSON.parse(products);
  } else {
    // If not cached, query the database for the latest 5 products
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    // Cache the result in Redis with a TTL (time-to-live)
    await redis.setex("latest-products", redisTTL, JSON.stringify(products));
  }

  // Return the products in the response
  return res.status(200).json({
    success: true,
    products,
  });
});

// Controller to get all unique product categories
// Uses Redis caching to avoid querying the database frequently
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  // Try to get cached categories from Redis
  categories = await redis.get("categories");

  if (categories) {
    // If cached, parse the JSON string into an object
    categories = JSON.parse(categories);
  } else {
    // If not cached, query the database for unique product categories
    categories = await Product.distinct("category");
    // Cache the result in Redis with a TTL
    await redis.setex("categories", redisTTL, JSON.stringify(categories));
  }

  // Return the categories in the response
  return res.status(200).json({
    success: true,
    categories,
  });
});

// Controller to get all products for admin purposes
// Uses Redis caching to avoid querying the database frequently
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;

  // Try to get cached products from Redis
  products = await redis.get("all-products");

  if (products) {
    // If cached, parse the JSON string into an object
    products = JSON.parse(products);
  } else {
    // If not cached, query the database for all products
    products = await Product.find({});
    // Cache the result in Redis with a TTL
    await redis.setex("all-products", redisTTL, JSON.stringify(products));
  }

  // Return the products in the response
  return res.status(200).json({
    success: true,
    products,
  });
});

// Controller to get a single product by ID
// Uses Redis caching to avoid querying the database frequently
export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id; // Extract product ID from request parameters
  const key = `product-${id}`; // Construct cache key for the specific product

  // Try to get cached product from Redis
  product = await redis.get(key);

  if (product) {
    // If cached, parse the JSON string into an object
    product = JSON.parse(product);
  } else {
    // If not cached, query the database for the product by ID
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404)); // Handle case where product is not found

    // Cache the result in Redis with a TTL
    await redis.setex(key, redisTTL, JSON.stringify(product));
  }

  // Return the product in the response
  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category, description } = req.body;
    const photos = req.files as Express.Multer.File[] | undefined; // Retrieve uploaded photos from request

    // Check if photos were uploaded
    if (!photos) return next(new ErrorHandler("Please add Photo", 400));
    if (photos.length < 1)
      return next(new ErrorHandler("Please add at least one Photo", 400));
    if (photos.length > 5)
      return next(new ErrorHandler("You can only upload 5 Photos", 400));

    // Check if all required fields are provided
    if (!name || !price || !stock || !category || !description)
      return next(new ErrorHandler("Please enter All Fields", 400));

    // Upload photos to Cloudinary
    const photosURL = await uploadToCloudinary(photos);

    // Create a new product entry in the database
    await Product.create({
      name,
      price,
      description,
      stock,
      category: category.toLowerCase(),
      photos: photosURL,
    });

    // Invalidate the cache for products to ensure new product appears
    await invalidateCache({ product: true, admin: true });

    // Respond with success message
    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params; // Get product ID from request parameters
  const { name, price, stock, category, description } = req.body;
  const photos = req.files as Express.Multer.File[] | undefined; // Retrieve uploaded photos from request

  // Find the product by ID
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  // If new photos are uploaded, handle the update
  if (photos && photos.length > 0) {
    // Upload new photos to Cloudinary
    const photosURL = await uploadToCloudinary(photos);

    // Delete old photos from Cloudinary
    const ids = product.photos.map((photo) => photo.public_id);
    await deleteFromCloudinary(ids);

    // Update product photos
    //@ts-ignore
    product.photos = photosURL;
  }

  // Update product details if provided
  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;

  // Save the updated product
  await product.save();

  // Invalidate the cache for the updated product and admin products
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  // Respond with success message
  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  // Find the product by ID
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  // Delete associated photos from Cloudinary
  const ids = product.photos.map((photo) => photo.public_id);
  await deleteFromCloudinary(ids);

  // Delete the product from the database
  await product.deleteOne();

  // Invalidate the cache for the deleted product and admin products
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  // Respond with success message
  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1; // Get the page number from query params (default to 1)

    const key = `products-${search}-${sort}-${category}-${price}-${page}`; // Cache key based on query parameters

    let products;
    let totalPage;

    // Try to get cached products from Redis
    const cachedData = await redis.get(key);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      totalPage = data.totalPage;
      products = data.products;
    } else {
      const limit = Number(process.env.PRODUCT_PER_PAGE) || 8; // Number of products per page (default to 8)
      const skip = (page - 1) * limit; // Number of products to skip based on page number

      const baseQuery: BaseQuery = {}; // Initialize query object

      // Build query based on filters
      if (search)
        baseQuery.name = {
          $regex: search,
          $options: "i", // Case-insensitive search
        };

      if (price)
        baseQuery.price = {
          $lte: Number(price), // Filter products with price less than or equal to specified value
        };

      if (category) baseQuery.category = category;

      // Fetch products with applied filters and pagination
      const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 }) // Sort products based on price
        .limit(limit)
        .skip(skip);

      // Fetch total number of products for pagination
      const [productsFetched, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
      ]);

      products = productsFetched;
      totalPage = Math.ceil(filteredOnlyProduct.length / limit); // Calculate total pages

      // Cache the result in Redis with a TTL of 30 seconds
      await redis.setex(key, 30, JSON.stringify({ products, totalPage }));
    }

    // Respond with products and total page count
    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

export const allReviewsOfProduct = TryCatch(async (req, res, next) => {
  let reviews;
  const key = `reviews-${req.params.id}`; // Cache key for reviews of a specific product

  // Try to get cached reviews from Redis
  reviews = await redis.get(key);

  if (reviews) {
    // If cached, parse the JSON string into an object
    reviews = JSON.parse(reviews);
  } else {
    // If not cached, fetch reviews from the database
    reviews = await Review.find({
      product: req.params.id, // Filter reviews by product ID
    })
      .populate("user", "name photo") // Populate user details (name and photo) in the review
      .sort({ updatedAt: -1 }); // Sort reviews by the most recent

    // Cache the fetched reviews in Redis with a TTL
    await redis.setex(key, redisTTL, JSON.stringify(reviews));
  }

  // Respond with the reviews
  return res.status(200).json({
    success: true,
    reviews,
  });
});

export const newReview = TryCatch(async (req, res, next) => {
  // Find the user by ID from the query parameters
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("Not Logged In", 404)); // Handle case where user is not found

  // Find the product by ID from the request parameters
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404)); // Handle case where product is not found

  const { comment, rating } = req.body; // Extract review details from request body

  // Check if the user has already reviewed this product
  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    // If already reviewed, update the existing review
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;
    await alreadyReviewed.save();
  } else {
    // If not reviewed, create a new review
    await Review.create({
      comment,
      rating,
      user: user._id,
      product: product._id,
    });
  }

  // Calculate new average ratings and number of reviews for the product
  //@ts-ignore
  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  // Update product with new ratings and review count
  product.ratings = ratings;
  product.numOfReviews = numOfReviews;
  await product.save();

  // Invalidate cache to ensure updated reviews and ratings are reflected
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  // Respond with success message
  return res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed ? "Review Updated" : "Review Added",
  });
});

export const deleteReview = TryCatch(async (req, res, next) => {
  // Find the user by ID from the query parameters
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("Not Logged In", 404)); // Handle case where user is not found

  // Find the review by ID from the request parameters
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review Not Found", 404)); // Handle case where review is not found

  // Check if the logged-in user is the author of the review
  const isAuthenticUser = review.user.toString() === user._id.toString();
  if (!isAuthenticUser) return next(new ErrorHandler("Not Authorized", 401)); // Handle case where user is not authorized

  // Delete the review from the database
  await review.deleteOne();

  // Find the associated product to update ratings and review count
  const product = await Product.findById(review.product);
  if (!product) return next(new ErrorHandler("Product Not Found", 404)); // Handle case where product is not found

  //@ts-ignore
  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  // Update product with new ratings and review count
  product.ratings = ratings;
  product.numOfReviews = numOfReviews;
  await product.save();

  // Invalidate cache to ensure updated reviews and ratings are reflected
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  // Respond with success message
  return res.status(200).json({
    success: true,
    message: "Review Deleted",
  });
});

// Functions to generate random products and add them to the database
export const generateRandomProducts = async () => {
  // Sample product data
  let data = [
    {
      id: 1,
      title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
      price: 109.95,
      description:
        "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
      category: "men's clothing",
      image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
      rating: { rate: 3.9, count: 120 },
    },
    {
      id: 2,
      title: "Mens Casual Premium Slim Fit T-Shirts ",
      price: 22.3,
      description:
        "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light",
      category: "men's clothing",
      image:
        "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
      rating: { rate: 4.1, count: 259 },
    },
    {
      id: 3,
      title: "Mens Cotton Jacket",
      price: 55.99,
      description:
        "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such",
      category: "men's clothing",
      image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
      rating: { rate: 4.7, count: 500 },
    },
    {
      id: 4,
      title: "Mens Casual Slim Fit",
      price: 15.99,
      description:
        "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore",
      category: "men's clothing",
      image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
      rating: { rate: 2.1, count: 430 },
    },
    {
      id: 5,
      title:
        "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
      price: 695,
      description: "From our Legends Collection, t",
      category: "jewelery",
      image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
      rating: { rate: 4.6, count: 400 },
    },
    {
      id: 6,
      title: "Solid Gold Petite Micropave ",
      price: 168,
      description:
        "Satisfaction Guaranteed. Return or exchange any order within 30 days.Designed and sold by Hafeez Center in the United States. Satisfaction Guaranteed. Return or exchange any order within 30 days.",
      category: "jewelery",
      image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
      rating: { rate: 3.9, count: 70 },
    },
    {
      id: 7,
      title: "White Gold Plated Princess",
      price: 9.99,
      description:
        "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her. Gifts to",
      category: "jewelery",
      image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
      rating: { rate: 3, count: 400 },
    },
    {
      id: 8,
      title: "Pierced Owl Rose Gold Plated Stainless  Steel Double",
      price: 10.99,
      description:
        "Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel",
      category: "jewelery",
      image: "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg",
      rating: { rate: 1.9, count: 100 },
    },
    {
      id: 9,
      title: "WD 2TB Elements Portable External Hard Drive - USB 3.0 ",
      price: 64,
      description:
        "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7; Reformatting may be required for other operating systems; Compatibility may vary depending on user’s hardware configuration and operating system",
      category: "electronics",
      image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
      rating: { rate: 3.3, count: 203 },
    },
    {
      id: 10,
      title: "SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s",
      price: 109,
      description:
        "Easy upgrade for faster boot up, shutdown, application load and response (As compared to 5400 RPM SATA 2.5” hard drive; Based on published specifications and internal benchmarking tests using PCMark vantage scores) Boosts burst write performance, making it ideal for typical PC workloads The perfect balance of performance and reliability ",
      category: "electronics",
      image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",
      rating: { rate: 2.9, count: 470 },
    },
    {
      id: 11,
      title:
        "Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5",
      price: 109,
      description:
        "3D NAND flash are applied to deliver high transfer speeds Remarkable transfer speeds that enable faster bootup and improved overall system performance. The advanced SLC Cache Technology ",
      category: "electronics",
      image: "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg",
      rating: { rate: 4.8, count: 319 },
    },
    {
      id: 12,
      title:
        "WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive",
      price: 114,
      description:
        "Expand your PS4 gaming experience, Play anywhere Fast and easy, setup Sleek design with high capacity, 3-year manufacturer's limited warranty",
      category: "electronics",
      image: "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",
      rating: { rate: 4.8, count: 400 },
    },
    {
      id: 13,
      title: "Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin",
      price: 599,
      description:
        "21. 5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon free Sync technology. No compatibility for VESA Mount Refresh Rate: 75Hz - Using HDMI port Zero-frame design | ultra-thin | 4ms response time | IPS panel Aspect ratio - 16: 9. Color Supported - 16. 7 million colors. Brightness - 250 nit Tilt angle -5 degree to 15 degree. Horizontal viewing angle-178 degree. Vertical viewing angle-178 degree 75 hertz",
      category: "electronics",
      image: "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg",
      rating: { rate: 2.9, count: 250 },
    },
    {
      id: 14,
      title:
        "Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor (LC49HG90DMNXZA) – Super Ultrawide Screen QLED ",
      price: 999.99,
      description:
        "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screen side by ",
      category: "electronics",
      image: "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg",
      rating: { rate: 2.2, count: 140 },
    },
    {
      id: 15,
      title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
      price: 56.99,
      description:
        "Note:The Jackets is US standard size, Please choose size as your usual wear Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece. Detachable Functional Liner: Skin Friendly, Lightweigt and Warm.Stand Collar Liner jacket, keep you warm in cold weather. Zippered Pockets: 2 Zippered Hand Pockets, 2 Zippered Pockets on Chest (enough to keep cards or keys)and 1 Hidden Pocket Inside.Zippered Hand Pockets and Hidden Pocket keep your things secure. Humanized Design: Adjustable and Detachable Hood and Adjustable cuff to prevent the wind and water,for a comfortable fit. 3 in 1 Detachable Design provide more convenience, you can separate ",
      category: "women's clothing",
      image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
      rating: { rate: 2.6, count: 235 },
    },
    {
      id: 16,
      title: "Lock and Love Women's Removable Hooded ",
      price: 29.95,
      description:
        "100% POLYURETHANE(shell) 100% POLYESTER(lining) 75% POLYESTER 25% COTTON (SWEATER), ",
      category: "women's clothing",
      image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
      rating: { rate: 2.9, count: 340 },
    },
    {
      id: 17,
      title: "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
      price: 39.99,
      description:
        "Lightweight perfet for trip or casual wear---Long sleeve with hooded, adjustable drawstring waist design. Button and zipper front closure raincoat, fully stripes Lined and The Raincoat has 2 side pockets are a good size to hold all kinds of things, it covers the hips, and the hood is generous but doesn't overdo it.Attached Cotton Lined Hood with Adjustable Drawstrings give it a real styled look.",
      category: "women's clothing",
      image: "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg",
      rating: { rate: 3.8, count: 679 },
    },
  ];

  // Function to generate a random integer between min and max (inclusive)
  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the sample data to match the Mongoose schema
  //@ts-ignore
  const convertedData = data.map((item) => ({
    name: item.title, // Map the title to 'name'
    photos: [
      {
        public_id: item.id.toString(), // Generate a dummy public_id; adjust as needed
        url: item.image, // Use the image URL
      },
    ],
    price: getRandomInt(10000, 100000), // Generate a random price between 10,000 and 100,000
    stock: getRandomInt(5, 100), // Generate random stock between 5 and 100
    category: item.category, // Use the provided category
    description: item.description, // Use the provided description
  }));

  // Create products in the database using Mongoose
  await Product.create(convertedData);
};

export const deleteRandomsProducts = async (count: number = 10) => {
  try {
    // Find products, skipping the first 2 to simulate some sort of pagination or offset
    const products = await Product.find({}).skip(2);

    // Ensure we only attempt to delete up to 'count' products
    const productsToDelete = products.slice(0, count);

    // Collect the IDs of products to delete
    const productIdsToDelete = productsToDelete.map((product) => product._id);

    // Perform deletion of the selected products
    const result = await Product.deleteMany({
      _id: { $in: productIdsToDelete },
    });

    // Log the result of deletion
    console.log({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error("Error deleting products:", error);
  }
};
