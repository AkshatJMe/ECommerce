import mongoose from "mongoose";

// Define the schema for the Product model
const schema = new mongoose.Schema(
  {
    // Name of the product, must be a string and is required
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },

    // Array of photos associated with the product
    photos: [
      {
        // Public ID of the photo, must be a string and is required
        public_id: {
          type: String,
          required: [true, "Please enter Public ID"],
        },
        // URL of the photo, must be a string and is required
        url: {
          type: String,
          required: [true, "Please enter URL"],
        },
      },
    ],

    // Price of the product, must be a number and is required
    price: {
      type: Number,
      required: [true, "Please enter Price"],
    },

    // Stock quantity of the product, must be a number and is required
    stock: {
      type: Number,
      required: [true, "Please enter Stock"],
    },

    // Category of the product, must be a string, is required, and is trimmed of whitespace
    category: {
      type: String,
      required: [true, "Please enter Category"],
      trim: true,
    },

    // Description of the product, must be a string and is required
    description: {
      type: String,
      required: [true, "Please enter Description"],
    },

    // Ratings for the product, defaults to 0
    ratings: {
      type: Number,
      default: 0,
    },

    // Number of reviews for the product, defaults to 0
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    // Automatically create `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

// Create and export the Product model based on the schema
export const Product = mongoose.model("Product", schema);
