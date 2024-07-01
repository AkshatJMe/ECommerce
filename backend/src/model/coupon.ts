import mongoose, { Document } from "mongoose";

// Define the ICoupon interface extending Mongoose's Document
interface ICoupon extends Document {
  code: string; // The coupon code
  amount: number; // The discount amount
  createdAt: Date; // Timestamp when the document was created
  updatedAt: Date; // Timestamp when the document was last updated
}

// Define a Mongoose schema for the Coupon model
const schema = new mongoose.Schema<ICoupon>(
  {
    // The 'code' field will store the coupon code as a string
    code: {
      type: String, // Specifies that 'code' is of type String
      required: [true, "Please enter the Coupon code"], // Ensures 'code' is required with a custom error message
      unique: true, // Ensures 'code' values are unique across the collection
    },
    // The 'amount' field will store the discount amount as a number
    amount: {
      type: Number, // Specifies that 'amount' is of type Number
      required: [true, "Please enter the Discount Amount"], // Ensures 'amount' is required with a custom error message
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields to the schema
  }
);

// Create and export a Mongoose model named 'Coupon' using the defined schema and ICoupon interface
export const Coupon = mongoose.model<ICoupon>("Coupon", schema);
