import { validationResult } from "express-validator";
import { ValidationError } from "../shared/errors/custom-error.js";

/**
 * Middleware to check validation results from express-validator chains.
 * Throws a formatted ValidationError if validation fails.
 */
export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
    throw new ValidationError(errorMessages, errors.array());
  }
  next();
};
