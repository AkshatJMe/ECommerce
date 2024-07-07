import { redis } from "../app.js"; // Importing the Redis client instance from app.js
import { Product } from "../model/product.js"; // Importing the Product model for database operations
import { InvalidateCacheProps, OrderItemType } from "../types/types.js"; // Importing TypeScript types

export const invalidateCache = async ({
  product,
  order,
  admin,
  review,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  // Invalidate review cache if the review flag is true
  if (review) {
    await redis.del([`reviews-${productId}`]); // Deletes the specific review cache from Redis
  }

  // Invalidate product-related caches if the product flag is true
  if (product) {
    // Define a list of general product-related cache keys
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    // Add specific product cache keys based on productId type
    if (typeof productId === "string") {
      productKeys.push(`product-${productId}`); // Add cache for a single product
    }

    if (typeof productId === "object") {
      productId.forEach((i) => productKeys.push(`product-${i}`)); // Add cache for multiple products
    }

    await redis.del(productKeys); // Deletes the specified product-related caches from Redis
  }

  // Invalidate order-related caches if the order flag is true
  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`, // Cache for the user's orders
      `order-${orderId}`, // Cache for a specific order
    ];

    await redis.del(ordersKeys); // Deletes the specified order-related caches from Redis
  }

  // Invalidate admin-related caches if the admin flag is true
  if (admin) {
    await redis.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]); // Deletes the specified admin-related caches from Redis
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId); // Retrieve product from the database

    if (!product) throw new Error("Product Not Found"); // Throw error if product does not exist

    product.stock -= order.quantity; // Decrease product stock by the order quantity
    await product.save(); // Save the updated product stock in the database
  }
};
