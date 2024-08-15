// Import necessary modules and types from Express, middleware, model, and utility files
import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js"; // Middleware to handle errors in async functions
import { User } from "../model/user.js"; // User model for database operations
import ErrorHandler from "../utils/utilityClass.js"; // Custom error handler utility
import { NewUserRequestBody } from "../types/types.js"; // Type for new user request body

// Controller to create a new user or welcome an existing user
export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    // Destructure user data from the request body
    const { name, email, photo, gender, _id, dob } = req.body;
    console.log(name, email, photo, gender, _id, dob);

    // Check if all required fields are provided
    if (!_id || !name || !email || !photo || !gender || !dob) {
      // If not, pass an error to the error-handling middleware
      return next(new ErrorHandler("Please add all fields", 400));
    }

    // Try to find the user by ID
    let user = await User.findById(_id);

    // If user exists, respond with a welcome message
    if (user) {
      return res.status(200).json({
        suces: true, // Note: Should be "success" for correct spelling
        message: `Welcome, ${user.name}`,
      });
    }

    // If user does not exist, create a new user
    user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob), // Convert dob to a Date object
    });

    // Respond with a welcome message for the newly created user
    return res.status(200).json({
      suces: true, // Note: Should be "success" for correct spelling
      mesage: `Welcome, ${user?.name}`, // Note: Should be "message" for correct spelling
    });
  }
);

// Controller to get all users
export const getAllUsers = TryCatch(async (req, res, next) => {
  // Retrieve all users from the database
  const users = await User.find({});

  // Respond with the list of users
  return res.status(200).json({
    suces: true, // Note: Should be "success" for correct spelling
    users,
  });
});

// Controller to get a specific user by ID
export const getUser = TryCatch(async (req, res, next) => {
  // Extract user ID from request parameters
  const id = req.params.id;
  // Find the user by ID
  const user = await User.findById(id);

  // If user not found, pass an error to the error-handling middleware
  if (!user) {
    return next(new ErrorHandler("Invalid Id", 400));
  }

  // Respond with the found user data
  return res.status(200).json({
    success: true,
    user,
  });
});

// Controller to delete a specific user by ID
export const deleteUser = TryCatch(async (req, res, next) => {
  // Extract user ID from request parameters
  const id = req.params.id;
  // Find the user by ID
  const user = await User.findById(id);

  // If user not found, pass an error to the error-handling middleware
  if (!user) {
    return next(new ErrorHandler("Invalid Id", 400));
  }

  // Delete the found user
  await user.deleteOne();

  // Respond with a success message
  return res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
