import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { redis } from "../app.js"; // Importing the Redis client instance from app.js
import { Product } from "../model/product.js"; // Importing the Product model for database operations
import { InvalidateCacheProps, OrderItemType } from "../types/types.js"; // Importing TypeScript types
import mongoose from "mongoose";
import { Review } from "../model/review.js";

export const findAverageRatings = async (
  productId: mongoose.Types.ObjectId
) => {
  let totalRating = 0;

  const reviews = await Review.find({ product: productId });
  reviews.forEach((review) => {
    totalRating += review.rating;
  });

  const averateRating = Math.floor(totalRating / reviews.length) || 0;

  return {
    numOfReviews: reviews.length,
    ratings: averateRating,
  };
};

const getBase64 = (file: Express.Multer.File) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
  const promises = files.map(async (file) => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(getBase64(file), (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      });
    });
  });

  const result = await Promise.all(promises);

  return result.map((i) => ({
    public_id: i.public_id,
    url: i.secure_url,
  }));
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  const promises = publicIds.map((id) => {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  });

  await Promise.all(promises);
};

export const invalidateCache = async ({
  product,
  order,
  admin,
  review,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  // Invalidate review cache if the review flag is true
  if (review) {
    await redis.del([`reviews-${productId}`]); // Deletes the specific review cache from Redis
  }

  // Invalidate product-related caches if the product flag is true
  if (product) {
    // Define a list of general product-related cache keys
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    // Add specific product cache keys based on productId type
    if (typeof productId === "string") {
      productKeys.push(`product-${productId}`); // Add cache for a single product
    }

    if (typeof productId === "object") {
      productId.forEach((i) => productKeys.push(`product-${i}`)); // Add cache for multiple products
    }

    await redis.del(productKeys); // Deletes the specified product-related caches from Redis
  }

  // Invalidate order-related caches if the order flag is true
  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`, // Cache for the user's orders
      `order-${orderId}`, // Cache for a specific order
    ];

    await redis.del(ordersKeys); // Deletes the specified order-related caches from Redis
  }

  // Invalidate admin-related caches if the admin flag is true
  if (admin) {
    await redis.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]); // Deletes the specified admin-related caches from Redis
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId); // Retrieve product from the database

    if (!product) throw new Error("Product Not Found"); // Throw error if product does not exist

    product.stock -= order.quantity; // Decrease product stock by the order quantity
    await product.save(); // Save the updated product stock in the database
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

export const getInventories = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    });
  });

  return categoryCount;
};

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type FuncProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: FuncProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });

  return data;
};
