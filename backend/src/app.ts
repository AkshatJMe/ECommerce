import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "./config/database.js";
import { connectRedis } from "./config/redis.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || "";
const redisURI = process.env.REDIS_URI || "";
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4;

connectDB(mongoURI);
connectRedis(redisURI);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();
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

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
