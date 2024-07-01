import mongoose, { Document } from "mongoose";

// Define the IProduct interface extending Mongoose's Document
interface IProduct extends Document {
  name: string; // Name of the product
  photos: Array<{
    public_id: string; // Public ID of the photo
    url: string; // URL of the photo
  }>; // Array of photos
  price: number; // Price of the product
  stock: number; // Stock quantity of the product
  category: string; // Category of the product
  description: string; // Description of the product
  ratings: number; // Rating of the product
  numOfReviews: number; // Number of reviews for the product
  createdAt: Date; // Timestamp when the document was created
  updatedAt: Date; // Timestamp when the document was last updated
}

// Define a Mongoose schema for the Product model
const schema = new mongoose.Schema<IProduct>(
  {
    // Name of the product
    name: {
      type: String, // Specifies that 'name' is of type String
      required: [true, "Please enter Name"], // Ensures 'name' is required with a custom error message
    },

    // Array of photos associated with the product
    photos: [
      {
        public_id: {
          type: String, // Specifies that 'public_id' is of type String
          required: [true, "Please enter Public ID"], // Ensures 'public_id' is required with a custom error message
        },
        url: {
          type: String, // Specifies that 'url' is of type String
          required: [true, "Please enter URL"], // Ensures 'url' is required with a custom error message
        },
      },
    ],

    // Price of the product
    price: {
      type: Number, // Specifies that 'price' is of type Number
      required: [true, "Please enter Price"], // Ensures 'price' is required with a custom error message
    },

    // Stock quantity of the product
    stock: {
      type: Number, // Specifies that 'stock' is of type Number
      required: [true, "Please enter Stock"], // Ensures 'stock' is required with a custom error message
    },

    // Category of the product
    category: {
      type: String, // Specifies that 'category' is of type String
      required: [true, "Please enter Category"], // Ensures 'category' is required with a custom error message
      trim: true, // Removes whitespace from the beginning and end of the category string
    },

    // Description of the product
    description: {
      type: String, // Specifies that 'description' is of type String
      required: [true, "Please enter Description"], // Ensures 'description' is required with a custom error message
    },

    // Rating of the product
    ratings: {
      type: Number, // Specifies that 'ratings' is of type Number
      default: 0, // Sets default value of 'ratings' to 0
    },

    // Number of reviews for the product
    numOfReviews: {
      type: Number, // Specifies that 'numOfReviews' is of type Number
      default: 0, // Sets default value of 'numOfReviews' to 0
    },
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' fields to the schema
  }
);

// Create and export a Mongoose model named 'Product' using the defined schema and IProduct interface
export const Product = mongoose.model<IProduct>("Product", schema);
