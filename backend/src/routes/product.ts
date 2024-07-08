import express from "express";
import {
  allReviewsOfProduct,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getSingleProduct,
  getlatestProducts,
  newProduct,
  newReview,
  updateProduct,
  generateRandomProducts,
  deleteRandomsProducts,
} from "../controllers/product.js"; // Importing functions from product controller
import { adminOnly } from "../middlewares/auth.js"; // Importing middleware for admin authentication
import { mutliUpload } from "../middlewares/multer.js"; // Importing middleware for handling file uploads

const app = express.Router(); // Creating a new router object

// Route to create a new product
// Method: POST
// Endpoint: /api/v1/product/new
// Middleware: adminOnly (ensures only admins can create new products), mutliUpload (handles file uploads)
app.post("/new", adminOnly, mutliUpload, newProduct);

// Route to get all products with optional filters
// Method: GET
// Endpoint: /api/v1/product/all
app.get("/all", getAllProducts);

// Route to get the latest 10 products
// Method: GET
// Endpoint: /api/v1/product/latest
app.get("/latest", getlatestProducts);

// Route to get all unique product categories
// Method: GET
// Endpoint: /api/v1/product/categories
app.get("/categories", getAllCategories);

// Route to get all products for admin purposes
// Method: GET
// Endpoint: /api/v1/product/admin-products
// Middleware: adminOnly (ensures only admins can access this route)
app.get("/admin-products", adminOnly, getAdminProducts);

// Routes to get, update, or delete a specific product by ID
// Method: GET - to fetch product details
// Method: PUT - to update product details (middleware: adminOnly, mutliUpload)
// Method: DELETE - to remove a product (middleware: adminOnly)
// Endpoint: /api/v1/product/:id
app
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, mutliUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

// Route to get all reviews for a specific product by product ID
// Method: GET
// Endpoint: /api/v1/product/reviews/:id
app.get("/reviews/:id", allReviewsOfProduct);

// Route to create a new review for a specific product by product ID
// Method: POST
// Endpoint: /api/v1/product/review/new/:id
app.post("/review/new/:id", newReview);

// Route to delete a specific review by review ID
// Method: DELETE
// Endpoint: /api/v1/product/review/:id
app.delete("/review/:id", deleteReview);

// Route to generate random products (for testing or seeding)
// Method: POST
// Endpoint: /api/v1/product/generateRandomProduct
// Middleware: adminOnly (ensures only admins can generate random products)
app.post("/generateRandomProduct", adminOnly, generateRandomProducts);

// Route to delete random products (for cleanup or testing)
// Method: DELETE
// Endpoint: /api/v1/product/dalateRandomProduct
// Middleware: adminOnly (ensures only admins can delete random products)
app.delete("/dalateRandomProduct", adminOnly, deleteRandomsProducts);

export default app; // Exporting the router to be used in the main app
