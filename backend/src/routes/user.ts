import express from "express";
// Import controller functions for user management
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/user.js";

// Import middleware to restrict access to admin users
import { adminOnly } from "../middlewares/auth.js";

// Create a new instance of an Express Router
const app = express.Router();

// Route to create a new user
// Uses the 'newUser' controller function to handle POST requests to '/new'
app.post("/new", newUser);

// Route to get all users
// Requires admin access (via 'adminOnly' middleware) and uses 'getAllUsers' controller
app.get("/all", adminOnly, getAllUsers);

// Route to get or delete a user by ID
// The ':id' parameter in the URL is used to identify the user
// Uses 'getUser' controller for GET requests and 'deleteUser' controller for DELETE requests
// DELETE request requires admin access (via 'adminOnly' middleware)
app
  .route("/:id")
  .get(getUser) // Handles GET request to retrieve a specific user by ID
  .delete(adminOnly, deleteUser); // Handles DELETE request to remove a specific user by ID, requires admin access

// Export the configured router to be used in other parts of the application
export default app;
