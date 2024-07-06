// Importing necessary modules and middleware
import express from "express"; // Importing the Express library
import { adminOnly } from "../middlewares/auth.js"; // Importing middleware to restrict access to admin users
import {
  allCoupons,
  applyDiscount,
  deleteCoupon,
  getCoupon,
  newCoupon,
  updateCoupon,
} from "../controllers/coupon.js"; // Importing controller functions for handling coupon-related requests

// Creating a new Express Router instance
const app = express.Router();

// Route to apply a discount using a coupon code
// Endpoint: /api/v1/payment/coupon/discount
app.get("/discount", applyDiscount);

// Route to create a new coupon
// Endpoint: /api/v1/payment/coupon/new
// Admin access is required to create a new coupon
app.post("/coupon/new", adminOnly, newCoupon);

// Route to retrieve all coupons
// Endpoint: /api/v1/payment/coupon/all
// Admin access is required to view all coupons
app.get("/coupon/all", adminOnly, allCoupons);

// Routes to retrieve, update, and delete a specific coupon by its ID
// Endpoint: /api/v1/payment/coupon/:id
// Admin access is required for these operations
app
  .route("/coupon/:id")
  .get(adminOnly, getCoupon) // Retrieve a coupon by ID
  .put(adminOnly, updateCoupon) // Update a coupon by ID
  .delete(adminOnly, deleteCoupon); // Delete a coupon by ID

// Exporting the router instance to be used in other parts of the application
export default app;
