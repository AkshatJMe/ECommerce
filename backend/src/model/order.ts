import mongoose, { Document, Schema } from "mongoose";

// Define the IOrder interface extending Mongoose's Document
interface IOrder extends Document {
  shippingInfo: {
    address: string; // Address for shipping
    city: string; // City for shipping
    state: string; // State for shipping
    country: string; // Country for shipping
    pinCode: number; // Postal code for shipping
  };
  user: string; // Reference to the User model
  subtotal: number; // Subtotal amount for the order
  tax: number; // Tax amount for the order
  shippingCharges: number; // Shipping charges for the order
  discount: number; // Discount applied to the order
  total: number; // Total amount for the order
  status: "Processing" | "Shipped" | "Delivered"; // Order status
  orderItems: Array<{
    name?: string; // Name of the order item (optional)
    photo?: string; // Photo URL of the order item (optional)
    price?: number; // Price of the order item (optional)
    quantity?: number; // Quantity of the order item (optional)
    productId: Schema.Types.ObjectId; // Reference to the Product model
  }>; // Array of items in the order
  createdAt: Date; // Timestamp when the document was created
  updatedAt: Date; // Timestamp when the document was last updated
}

// Define a Mongoose schema for the Order model
const schema = new mongoose.Schema<IOrder>(
  {
    // Shipping information for the order
    shippingInfo: {
      address: {
        type: String, // Specifies that 'address' is of type String
        required: true, // Ensures 'address' is required
      },
      city: {
        type: String, // Specifies that 'city' is of type String
        required: true, // Ensures 'city' is required
      },
      state: {
        type: String, // Specifies that 'state' is of type String
        required: true, // Ensures 'state' is required
      },
      country: {
        type: String, // Specifies that 'country' is of type String
        required: true, // Ensures 'country' is required
      },
      pinCode: {
        type: Number, // Specifies that 'pinCode' is of type Number
        required: true, // Ensures 'pinCode' is required
      },
    },

    // Reference to the user who placed the order
    user: {
      type: String, // Specifies that 'user' is of type String
      ref: "User", // Indicates that 'user' is a reference to a User model
      required: true, // Ensures 'user' is required
    },

    // Details of the order pricing
    subtotal: {
      type: Number, // Specifies that 'subtotal' is of type Number
      required: true, // Ensures 'subtotal' is required
    },
    tax: {
      type: Number, // Specifies that 'tax' is of type Number
      required: true, // Ensures 'tax' is required
    },
    shippingCharges: {
      type: Number, // Specifies that 'shippingCharges' is of type Number
      required: true, // Ensures 'shippingCharges' is required
    },
    discount: {
      type: Number, // Specifies that 'discount' is of type Number
      required: true, // Ensures 'discount' is required
    },
    total: {
      type: Number, // Specifies that 'total' is of type Number
      required: true, // Ensures 'total' is required
    },

    // Order status with predefined values
    status: {
      type: String, // Specifies that 'status' is of type String
      enum: ["Processing", "Shipped", "Delivered"], // Restricts 'status' to these values
      default: "Processing", // Sets default value for 'status'
    },

    // Array of items in the order
    orderItems: [
      {
        name: {
          type: String, // Specifies that 'name' is of type String
        },
        photo: {
          type: String, // Specifies that 'photo' is of type String
        },
        price: {
          type: Number, // Specifies that 'price' is of type Number
        },
        quantity: {
          type: Number, // Specifies that 'quantity' is of type Number
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId, // Specifies that 'productId' is of type ObjectId
          ref: "Product", // Indicates that 'productId' is a reference to a Product model
        },
      },
    ],
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' fields to the schema
  }
);

// Create and export a Mongoose model named 'Order' using the defined schema and IOrder interface
export const Order = mongoose.model<IOrder>("Order", schema);
