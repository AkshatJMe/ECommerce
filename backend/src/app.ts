// Import necessary modules and functions
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { connectDB } from "./config/database.js";
import { connectRedis } from "./config/redis.js";
import morgan from "morgan";
import Stripe from "stripe";
import { errorMiddleware } from "./middlewares/error.js";
import { cloudinaryConnect } from "./config/cloudinary.js";

// Import route modules
import userRoute from "./routes/user.js";
import orderRoute from "./routes/order.js";
import productRoute from "./routes/product.js";
import paymentRoute from "./routes/payment.js";
import couponRoute from "./routes/coupon.js";
import dashboardRoute from "./routes/stats.js";

// Load environment variables from .env file
config({
  path: "./.env",
});

// Extract configuration variables from environment
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
const redisURI = process.env.REDIS_URI || "";
const cloud_name = process.env.CLOUD_NAME || "";
const key = process.env.API_KEY || "";
const secret = process.env.API_SECRET || "";
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4; // Redis TTL in seconds

// Connect to MongoDB database
connectDB(mongoURI);

// Connect to Redis database
export const redis = connectRedis(redisURI);

// Connect to Cloudinary for media storage
cloudinaryConnect(cloud_name, key, secret);

// Initialize Stripe with API key
export const stripe = new Stripe(stripeKey);

// Create an instance of the Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware for logging HTTP requests
app.use(morgan("dev"));

// Middleware for handling Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    credentials: true, // Allow credentials to be included in requests
  })
);

// Define a root route that responds with a message
app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});

// Define routes for various parts of the application
app.use("/api/v1/user", userRoute); // Routes for user-related operations
app.use("/api/v1/order", orderRoute); // Routes for order-related operations
app.use("/api/v1/product", productRoute); // Routes for product-related operations
app.use("/api/v1/payment", paymentRoute); // Routes for payment-related operations
app.use("/api/v1/coupon", couponRoute); // Routes for coupon-related operations
app.use("/api/v1/dashboard", dashboardRoute); // Routes for dashboard statistics

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));

// Middleware for handling errors
app.use(errorMiddleware);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
