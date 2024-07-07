import express from "express"; // Importing the Express library
import { adminOnly } from "../middlewares/auth.js"; // Importing middleware to restrict access to admin users
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order.js"; // Importing controller functions for handling order-related requests

// Creating a new Express Router instance
const app = express.Router();

// Route to create a new order
// Endpoint: /api/v1/order/new
app.post("/new", newOrder);

// Route to get orders for the currently authenticated user
// Endpoint: /api/v1/order/my
app.get("/my", myOrders);

// Route to get all orders (admin access required)
// Endpoint: /api/v1/order/all
// Admin access is restricted via `adminOnly` middleware
app.get("/all", adminOnly, allOrders);

// Route to handle operations for a specific order by ID
// Endpoint: /api/v1/order/:id
// This route allows for getting, updating, and deleting an order by ID
// Admin access is required for updating and deleting the order
app
  .route("/:id")
  .get(getSingleOrder) // Get a specific order by ID
  .put(adminOnly, processOrder) // Update order status (admin only)
  .delete(adminOnly, deleteOrder); // Delete a specific order (admin only)

// Exporting the router instance to be used in other parts of the application
export default app;
