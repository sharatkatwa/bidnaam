import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import {
  createOrderController,
  verifyPaymentController,
  getPaymentDetailsController,
} from "../controllers/payment.controller.js";
import {
  createOrderValidator,
  verifyPaymentValidator,
  paymentAuctionIdValidator,
} from "../validators/payment.validator.js";

const router = Router();

// All payment routes require JWT authentication
router.use(authenticate);

// Initiate Razorpay Order (Winning Bidder only)
router.post(
  "/create-order/:auctionId",
  createOrderValidator,
  createOrderController
);

// Verify Razorpay HMAC Signature
router.post("/verify", verifyPaymentValidator, verifyPaymentController);

// Get Payment Details for an Auction
router.get(
  "/:auctionId",
  paymentAuctionIdValidator,
  getPaymentDetailsController
);

export default router;
