// Importing necessary modules and classes
import { stripe } from "../app.js"; // Importing the configured Stripe instance
import { TryCatch } from "../middlewares/error.js"; // Importing a middleware for handling errors
import ErrorHandler from "../utils/utilityClass.js"; // Importing a custom error handler class

// Creating an Express route handler for creating a payment intent
export const createPaymentIntent = TryCatch(async (req, res, next) => {
  // Extracting the amount from the request body
  const { amount } = req.body;

  // Check if the amount is provided in the request
  if (!amount) {
    // If not, pass a new ErrorHandler instance to the next middleware
    // This will respond with a 400 status code and an error message
    return next(new ErrorHandler("Please enter amount", 400));
  }

  try {
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100, // Convert amount to the smallest currency unit (e.g., cents for INR)
      currency: "inr", // Specify the currency
    });

    // Send a successful response with the client secret
    // The client secret is used for confirming the payment on the client side
    return res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    // If there's an error during payment intent creation, pass it to the error handler middleware
    return next(error);
  }
});
