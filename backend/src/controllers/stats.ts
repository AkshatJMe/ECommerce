// Importing required modules and functions
import { redis, redisTTL } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../model/order.js";
import { Product } from "../model/product.js";
import { User } from "../model/user.js";
import {
  calculatePercentage,
  getChartData,
  getInventories,
} from "../utils/features.js";

// Define the getDashboardStats function wrapped with TryCatch middleware for error handling
export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats;

  // Define the cache key for storing dashboard statistics
  const key = "admin-stats";

  // Try to retrieve cached statistics from Redis
  stats = await redis.get(key);

  // If statistics are found in the cache, parse them; otherwise, compute new statistics
  if (stats) {
    stats = JSON.parse(stats);
  } else {
    // Define time periods for the current and previous months, and the last six months
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    // Define promises for fetching data for the current and last months
    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUsersPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const latestTransactionsPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    // Wait for all promises to resolve
    const [
      thisMonthProducts,
      thisMonthUsers,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      lastMonthOrders,
      productsCount,
      usersCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthUsersPromise,
      thisMonthOrdersPromise,
      lastMonthProductsPromise,
      lastMonthUsersPromise,
      lastMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    // Calculate revenue for the current and last months
    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    // Calculate percentage changes for revenue, products, users, and orders
    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    // Calculate total revenue and count for products, users, and orders
    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      product: productsCount,
      user: usersCount,
      order: allOrders.length,
    };

    // Initialize arrays to hold order counts and revenue for the last six months
    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthyRevenue = new Array(6).fill(0);

    // Populate order counts and revenue for each of the last six months
    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthyRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    // Get inventory data for categories
    const categoryCount = await getInventories({
      categories,
      productsCount,
    });

    // Calculate the ratio of male to female users
    const userRatio = {
      male: usersCount - femaleUsersCount,
      female: femaleUsersCount,
    };

    // Format the latest transactions for response
    const modifiedLatestTransaction = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    // Compile all statistics into the final object
    stats = {
      categoryCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthyRevenue,
      },
      userRatio,
      latestTransaction: modifiedLatestTransaction,
    };

    // Cache the computed statistics in Redis
    await redis.setex(key, redisTTL, JSON.stringify(stats));
  }

  // Send the statistics as a JSON response
  return res.status(200).json({
    success: true,
    stats,
  });
});

// Define the getPieCharts function wrapped with TryCatch middleware for error handling
export const getPieCharts = TryCatch(async (req, res, next) => {
  let charts;

  // Define the cache key for storing pie chart data
  const key = "admin-pie-charts";

  // Try to retrieve cached pie chart data from Redis
  charts = await redis.get(key);

  // If cached data is found, parse it; otherwise, compute new data
  if (charts) {
    charts = JSON.parse(charts);
  } else {
    // Define a promise to retrieve all orders with specific fields
    const allOrderPromise = Order.find({}).select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]);

    // Wait for all promises to resolve
    const [
      processingOrder, // Count of orders with status "Processing"
      shippedOrder, // Count of orders with status "Shipped"
      deliveredOrder, // Count of orders with status "Delivered"
      categories, // List of distinct product categories
      productsCount, // Total number of products
      outOfStock, // Number of products out of stock
      allOrders, // List of all orders
      allUsers, // List of all users with date of birth
      adminUsers, // Count of admin users
      customerUsers, // Count of customer users
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      allOrderPromise,
      User.find({}).select(["dob"]),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ]);

    // Prepare order fulfillment data
    const orderFullfillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    // Get inventory data for product categories
    const productCategories = await getInventories({
      categories,
      productsCount,
    });

    // Prepare stock availability data
    const stockAvailablity = {
      inStock: productsCount - outOfStock,
      outOfStock,
    };

    // Calculate financial metrics
    const grossIncome = allOrders.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );

    const discount = allOrders.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );

    const productionCost = allOrders.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (30 / 100)); // 30% of gross income

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    // Prepare revenue distribution data
    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    // Calculate user age groups
    const usersAgeGroup = {
      teen: allUsers.filter((i) => i.age < 20).length,
      adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
      old: allUsers.filter((i) => i.age >= 40).length,
    };

    // Prepare admin and customer user count data
    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    // Compile all pie chart data into the final object
    charts = {
      orderFullfillment,
      productCategories,
      stockAvailablity,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };

    // Cache the computed pie chart data in Redis
    await redis.setex(key, redisTTL, JSON.stringify(charts));
  }

  // Send the pie chart data as a JSON response
  return res.status(200).json({
    success: true,
    charts,
  });
});

// Define the getBarCharts function wrapped with TryCatch middleware for error handling
export const getBarCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-bar-charts";

  // Try to retrieve cached bar chart data from Redis
  charts = await redis.get(key);

  // If cached data is found, parse it; otherwise, compute new data
  if (charts) {
    charts = JSON.parse(charts);
  } else {
    const today = new Date();

    // Define date ranges for the past 6 months and 12 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Define promises to retrieve products, users, and orders data
    const sixMonthProductPromise = Product.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const sixMonthUsersPromise = User.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const twelveMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    // Wait for all promises to resolve
    const [products, users, orders] = await Promise.all([
      sixMonthProductPromise,
      sixMonthUsersPromise,
      twelveMonthOrdersPromise,
    ]);

    // Use getChartData to calculate the counts for products, users, and orders
    //@ts-ignore
    const productCounts = getChartData({ length: 6, today, docArr: products }); //@ts-ignore
    const usersCounts = getChartData({ length: 6, today, docArr: users }); //@ts-ignore
    const ordersCounts = getChartData({ length: 12, today, docArr: orders });

    // Compile all bar chart data into the final object
    charts = {
      users: usersCounts,
      products: productCounts,
      orders: ordersCounts,
    };

    // Cache the computed bar chart data in Redis
    await redis.setex(key, redisTTL, JSON.stringify(charts));
  }

  // Send the bar chart data as a JSON response
  return res.status(200).json({
    success: true,
    charts,
  });
});

// Define the getLineCharts function wrapped with TryCatch middleware for error handling
export const getLineCharts = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-line-charts";

  // Try to retrieve cached line chart data from Redis
  charts = await redis.get(key);

  // If cached data is found, parse it; otherwise, compute new data
  if (charts) {
    charts = JSON.parse(charts);
  } else {
    const today = new Date();

    // Define date range for the past 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Define base query for fetching data from the past 12 months
    const baseQuery = {
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    };

    // Define promises to retrieve products, users, and orders data
    const [products, users, orders] = await Promise.all([
      Product.find(baseQuery).select("createdAt"),
      User.find(baseQuery).select("createdAt"),
      Order.find(baseQuery).select(["createdAt", "discount", "total"]),
    ]);

    // Use getChartData to calculate counts and financial metrics
    //@ts-ignore
    const productCounts = getChartData({ length: 12, today, docArr: products }); //@ts-ignore
    const usersCounts = getChartData({ length: 12, today, docArr: users });
    const discount = getChartData({
      length: 12,
      today, //@ts-ignore
      docArr: orders,
      property: "discount",
    });
    const revenue = getChartData({
      length: 12,
      today, //@ts-ignore
      docArr: orders,
      property: "total",
    });

    // Compile all line chart data into the final object
    charts = {
      users: usersCounts,
      products: productCounts,
      discount,
      revenue,
    };

    // Cache the computed line chart data in Redis
    await redis.setex(key, redisTTL, JSON.stringify(charts));
  }

  // Send the line chart data as a JSON response
  return res.status(200).json({
    success: true,
    charts,
  });
});
