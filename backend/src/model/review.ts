import mongoose, { Document } from "mongoose";

// Define the IReview interface extending Mongoose's Document
interface IReview extends Document {
  comment?: string; // Optional string for the review comment
  rating: number; // Numeric rating, required
  user: string; // Reference to the User model, required
  product: mongoose.Schema.Types.ObjectId; // Reference to the Product model, required
  createdAt: Date; // Timestamp for creation
  updatedAt: Date; // Timestamp for last update
}

// Define a Mongoose schema for the Review model
const schema = new mongoose.Schema(
  {
    // Comment provided in the review
    comment: {
      type: String, // Specifies that 'comment' is of type String
      maxlength: [200, "Comment must not be more than 200 characters"], // Limits 'comment' to 200 characters with a custom error message
    },

    // Rating given in the review
    rating: {
      type: Number, // Specifies that 'rating' is of type Number
      required: [true, "Please give Rating"], // Ensures 'rating' is required with a custom error message
      min: [1, "Rating must be at least 1"], // Sets minimum value for 'rating' to 1 with a custom error message
      max: [5, "Rating must not be more than 5"], // Sets maximum value for 'rating' to 5 with a custom error message
    },

    // Reference to the user who wrote the review
    user: {
      type: String, // Specifies that 'user' is of type String
      ref: "User", // Indicates that 'user' is a reference to a User model
      required: true, // Ensures 'user' is required
    },

    // Reference to the product being reviewed
    product: {
      type: mongoose.Schema.Types.ObjectId, // Specifies that 'product' is of type ObjectId
      ref: "Product", // Indicates that 'product' is a reference to a Product model
      required: true, // Ensures 'product' is required
    },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt' fields to the schema
);

// Create and export a Mongoose model named 'Review' using the defined schema and IReview interface
export const Review = mongoose.model<IReview>("Review", schema);
