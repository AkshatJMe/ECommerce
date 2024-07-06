// Importing necessary modules and classes
import { TryCatch } from "../middlewares/error.js"; // Importing a middleware function for error handling
import { Coupon } from "../model/coupon.js"; // Importing the Coupon model for interacting with the database
import ErrorHandler from "../utils/utilityClass.js"; // Importing a custom error handler class

// Handler to create a new coupon
export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;

  // Check if both code and amount are provided
  if (!code || !amount)
    return next(new ErrorHandler("Please enter both coupon and amount", 400));

  // Create a new coupon in the database
  await Coupon.create({ code, amount });

  // Send a success response
  return res.status(201).json({
    success: true,
    message: `Coupon ${code} Created Successfully`,
  });
});

// Handler to apply a discount using a coupon code
export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  // Find the coupon in the database by its code
  const discount = await Coupon.findOne({ code: coupon });

  // If no coupon is found, respond with an error
  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

  // Send a success response with the discount amount
  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

// Handler to retrieve all coupons
export const allCoupons = TryCatch(async (req, res, next) => {
  // Find all coupons in the database
  const coupons = await Coupon.find({});

  // Send a success response with the list of coupons
  return res.status(200).json({
    success: true,
    coupons,
  });
});

// Handler to retrieve a specific coupon by its ID
export const getCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  // Find the coupon in the database by its ID
  const coupon = await Coupon.findById(id);

  // If no coupon is found, respond with an error
  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

  // Send a success response with the coupon details
  return res.status(200).json({
    success: true,
    coupon,
  });
});

// Handler to update an existing coupon
export const updateCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount } = req.body;

  // Find the coupon in the database by its ID
  const coupon = await Coupon.findById(id);

  // If no coupon is found, respond with an error
  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

  // Update the coupon details if provided
  if (code) coupon.code = code;
  if (amount) coupon.amount = amount;

  // Save the updated coupon
  await coupon.save();

  // Send a success response
  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} Updated Successfully`,
  });
});

// Handler to delete a coupon by its ID
export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  // Find and delete the coupon in the database by its ID
  const coupon = await Coupon.findByIdAndDelete(id);

  // If no coupon is found, respond with an error
  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

  // Send a success response
  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} Deleted Successfully`,
  });
});
