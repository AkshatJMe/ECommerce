import { NextFunction, Request, Response } from "express";
// Import the ErrorHandler class for custom error handling
import ErrorHandler from "../utils/utilityClass.js";
// Import the ControllerType type for type-checking controller functions
import { ControllerType } from "../types/types.js";

// Middleware function to handle errors
export const errorMiddleware = (
  err: ErrorHandler, // Error object (custom type)
  req: Request, // Express request object
  res: Response, // Express response object
  next: NextFunction // Express next function
) => {
  // Default error message if not provided
  err.message ||= "Internal Server Error";
  // Default HTTP status code if not provided
  err.statusCode ||= 500;

  // Handle specific error name 'CastError' for invalid IDs
  if (err.name === "CastError") err.message = "Invalid ID";

  // Respond with the error status code and message
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

// Higher-order function to wrap async controller functions with error handling
export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Wrap the function call in a promise and catch any errors
    return Promise.resolve(func(req, res, next)).catch(next);
  };
