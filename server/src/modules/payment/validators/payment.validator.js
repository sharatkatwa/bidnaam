import { param, body } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware.js";

/**
 * Validator for creating Razorpay payment order
 */
export const createOrderValidator = [
  param("auctionId")
    .isMongoId()
    .withMessage("Invalid auction ID format"),
  validate,
];

/**
 * Validator for verifying Razorpay payment signature
 */
export const verifyPaymentValidator = [
  body("auctionId")
    .isMongoId()
    .withMessage("Invalid auction ID format"),
  body("orderId")
    .notEmpty()
    .withMessage("Razorpay orderId is required"),
  body("paymentId")
    .notEmpty()
    .withMessage("Razorpay paymentId is required"),
  body("signature")
    .notEmpty()
    .withMessage("Razorpay signature is required"),
  validate,
];

/**
 * Validator for auction ID parameter lookups
 */
export const paymentAuctionIdValidator = [
  param("auctionId")
    .isMongoId()
    .withMessage("Invalid auction ID format"),
  validate,
];
