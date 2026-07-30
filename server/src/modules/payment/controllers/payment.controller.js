import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { successResponse } from "../../../shared/utils/successResponse.js";
import {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
  getPaymentDetailsService,
} from "../services/payment.service.js";

/**
 * Controller to initiate a Razorpay order for the winning bidder (FR-20)
 * POST /payments/create-order/:auctionId
 */
export const createOrderController = asyncHandler(async (req, res) => {
  const { auctionId } = req.params;
  const userId = req.user._id || req.user.id;

  const result = await createRazorpayOrderService(auctionId, userId);

  return successResponse(
    res,
    "Razorpay payment order created successfully",
    StatusCodes.CREATED,
    result
  );
});

/**
 * Controller to verify Razorpay HMAC signature and finalize payment completion
 * POST /payments/verify
 */
export const verifyPaymentController = asyncHandler(async (req, res) => {
  const { auctionId, orderId, paymentId, signature } = req.body;
  const userId = req.user._id || req.user.id;

  // Retrieve Socket.io instance from Express app if attached
  const io = req.app.get("io") || null;

  const result = await verifyRazorpayPaymentService(
    { auctionId, orderId, paymentId, signature },
    userId,
    io
  );

  return successResponse(
    res,
    result.message || "Payment verified successfully",
    StatusCodes.OK,
    result
  );
});

/**
 * Controller to retrieve payment details for an auction
 * GET /payments/:auctionId
 */
export const getPaymentDetailsController = asyncHandler(async (req, res) => {
  const { auctionId } = req.params;
  const userId = req.user._id || req.user.id;

  const payment = await getPaymentDetailsService(auctionId, userId);

  return successResponse(
    res,
    "Payment details retrieved successfully",
    StatusCodes.OK,
    { payment }
  );
});
