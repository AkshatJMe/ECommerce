// Import the User model from the user module for database operations
import { User } from "../model/user.js";
// Import the ErrorHandler class for custom error handling
import ErrorHandler from "../utils/utilityClass.js";
// Import the TryCatch utility to handle async errors
import { TryCatch } from "./error.js";

// Middleware function to ensure that the user has admin privileges
export const adminOnly = TryCatch(async (req, res, next) => {
  // Extract the 'id' from query parameters
  const { id } = req.query;

  // Check if 'id' is provided in the query parameters
  if (!id) {
    // If 'id' is missing, pass a 401 Unauthorized error to the error handler
    return next(new ErrorHandler("User not login", 401));
  }

  // Find the user by ID in the database
  const user = await User.findById(id);

  // Check if a user with the provided ID exists
  if (!user) {
    // If no user is found, pass a 401 Unauthorized error to the error handler
    return next(new ErrorHandler("ID not exists", 401));
  }

  // Check if the user's role is 'admin'
  if (user.role !== "admin") {
    // If the user is not an admin, pass a 403 Forbidden error to the error handler
    return next(new ErrorHandler("Only for Admin", 403));
  }

  // If all checks pass, proceed to the next middleware function
  next();
});
