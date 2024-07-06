// Importing necessary modules
import express from "express"; // Importing the Express library
import { createPaymentIntent } from "../controllers/payment.js"; // Importing the controller function for creating payment intents

// Creating a new Express Router instance
const app = express.Router();

// Defining a POST route to handle payment intent creation
// This route will use the `createPaymentIntent` controller function to process requests
app.post("/create", createPaymentIntent);

// Exporting the router instance to be used in other parts of the application
export default app;
