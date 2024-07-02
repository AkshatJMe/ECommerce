import { v2 as cloudinary } from "cloudinary";

// Function to connect to Cloudinary using provided credentials
export const cloudinaryConnect = (
  name: string, // Cloudinary cloud name
  key: string, // API key
  secret: string // API secret
) => {
  try {
    // Configure Cloudinary with provided credentials
    cloudinary.config({
      cloud_name: name,
      api_key: key,
      api_secret: secret,
    });
    console.log("Cloudinary connected successfully");
  } catch (error) {
    // Handle any errors that occur during configuration
    console.log("Cloudinary connection failed");
  }
};
