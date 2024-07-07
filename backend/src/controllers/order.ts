import { Request } from "express"; // Importing Express Request type for TypeScript
import { redis, redisTTL } from "../app.js"; // Importing Redis client and TTL (Time-to-Live) for cache expiration
import { TryCatch } from "../middlewares/error.js"; // Importing a middleware function for error handling
import { Order } from "../model/order.js"; // Importing the Order model for interacting with the database
import { NewOrderRequestBody } from "../types/types.js"; // Importing TypeScript types for request body validation
import { invalidateCache, reduceStock } from "../utils/features.js"; // Importing utility functions for cache invalidation and stock reduction
import ErrorHandler from "../utils/utilityClass.js"; // Importing a custom error handler class

// Handler to get orders for a specific user with caching
export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query; // Extract user ID from query parameters

  const key = `my-orders-${user}`; // Cache key for user-specific orders

  let orders;

  // Try to get cached orders from Redis
  orders = await redis.get(key);

  if (orders) {
    // If cache hit, parse and return cached data
    orders = JSON.parse(orders);
  } else {
    // If cache miss, fetch orders from database and cache the result
    orders = await Order.find({ user });
    await redis.setex(key, redisTTL, JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    orders,
  });
});

// Handler to get all orders with caching
export const allOrders = TryCatch(async (req, res, next) => {
  const key = `all-orders`; // Cache key for all orders

  let orders;

  // Try to get cached orders from Redis
  orders = await redis.get(key);

  if (orders) {
    // If cache hit, parse and return cached data
    orders = JSON.parse(orders);
  } else {
    // If cache miss, fetch all orders from database, populate user details, and cache the result
    orders = await Order.find().populate("user", "name");
    await redis.setex(key, redisTTL, JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    orders,
  });
});

// Handler to get a single order by ID with caching
export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params; // Extract order ID from URL parameters
  const key = `order-${id}`; // Cache key for a specific order

  let order;
  // Try to get cached order from Redis
  order = await redis.get(key);

  if (order) {
    // If cache hit, parse and return cached data
    order = JSON.parse(order);
  } else {
    // If cache miss, fetch the order from database, populate user details, and cache the result
    order = await Order.findById(id).populate("user", "name");

    if (!order) return next(new ErrorHandler("Order Not Found", 404)); // Handle case where order is not found

    await redis.setex(key, redisTTL, JSON.stringify(order));
  }
  return res.status(200).json({
    success: true,
    order,
  });
});

// Handler to create a new order
export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    // Validate request body
    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new ErrorHandler("Please Enter All Fields", 400));

    // Create a new order in the database
    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    // Reduce stock for the items in the order
    await reduceStock(orderItems);

    // Invalidate cache for products, orders, and user-specific data
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);

// Handler to process an order, i.e., update its status
export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params; // Extract order ID from URL parameters

  // Find the order in the database
  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404)); // Handle case where order is not found

  // Update the status based on current status
  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save(); // Save the updated order status

  // Invalidate cache for orders, and related data
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Processed Successfully",
  });
});

// Handler to delete an order
export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params; // Extract order ID from URL parameters

  // Find and delete the order in the database
  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order Not Found", 404)); // Handle case where order is not found

  await order.deleteOne(); // Delete the order

  // Invalidate cache for orders and related data
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});
