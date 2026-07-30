import { body, param } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware.js";

/**
 * Validation rules for creating an auction
 */
export const createAuctionValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description").optional().isString().trim(),
  body("startPrice")
    .notEmpty()
    .withMessage("Start price is required")
    .isFloat({ min: 0 })
    .withMessage("Start price must be a non-negative number"),
  body("minimumIncrement")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Minimum increment must be at least 0.01"),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .isISO8601()
    .withMessage("End time must be a valid ISO Date string"),
  validate,
];

/**
 * Validation rules for auction ID parameter
 */
export const auctionIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid auction ID format"),
  validate,
];
