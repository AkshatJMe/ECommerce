// Import necessary modules and functions
import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/stats.js";

// Create an instance of the express Router
const app = express.Router();

// Define the route for retrieving dashboard statistics
// Endpoint: /api/v1/dashboard/stats
// Middleware: adminOnly (ensures that only admin users can access this route)
app.get("/stats", adminOnly, getDashboardStats);

// Define the route for retrieving pie chart data
// Endpoint: /api/v1/dashboard/pie
// Middleware: adminOnly (ensures that only admin users can access this route)
app.get("/pie", adminOnly, getPieCharts);

// Define the route for retrieving bar chart data
// Endpoint: /api/v1/dashboard/bar
// Middleware: adminOnly (ensures that only admin users can access this route)
app.get("/bar", adminOnly, getBarCharts);

// Define the route for retrieving line chart data
// Endpoint: /api/v1/dashboard/line
// Middleware: adminOnly (ensures that only admin users can access this route)
app.get("/line", adminOnly, getLineCharts);

// Export the router instance for use in other parts of the application
export default app;
