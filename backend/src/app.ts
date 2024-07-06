import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { connectDB } from "./config/database.js";
import { connectRedis } from "./config/redis.js";
import morgan from "morgan";
import Stripe from "stripe";
import { errorMiddleware } from "./middlewares/error.js";
import { cloudinaryConnect } from "./config/cloudinary.js";

import userRoute from "./routes/user.js";
import paymentRoute from "./routes/payment.js";
import couponRoute from "./routes/coupon.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
const redisURI = process.env.REDIS_URI || "";
const cloud_name = process.env.CLOUD_NAME || "";
const key = process.env.API_KEY || "";
const secret = process.env.API_SECRET || "";
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4;

connectDB(mongoURI);
connectRedis(redisURI);
cloudinaryConnect(cloud_name, key, secret);

export const stripe = new Stripe(stripeKey);

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/payment", couponRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
