import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../../../config/env.js";
import { getAuctionById, updateAuction } from "../../auction/dao/auction.dao.js";
import { createTimelineEvent } from "../../timeline/services/timeline.service.js";
import {
  createPayment,
  findPaymentByAuction,
  findPaymentByOrderId,
  updatePaymentStatus,
} from "../dao/payment.dao.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../../shared/errors/custom-error.js";

// Initialize Razorpay SDK instance
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Initiate Razorpay payment order for auction winner (FR-20)
 *
 * @param {string} auctionId - Target auction Mongoose ObjectId
 * @param {string} userId - Requesting user ID (must be the winning bidder)
 * @returns {Promise<Object>} Object containing Razorpay order payload and DB payment document
 */
export async function createRazorpayOrderService(auctionId, userId) {
  // 1. Fetch auction document from database
  const auction = await getAuctionById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  // 2. Business Rules Validation
  if (auction.status !== "completed") {
    throw new ValidationError("Payment can only be initiated for completed auctions.");
  }

  if (!auction.winner) {
    throw new ValidationError("No winning bidder exists for this auction.");
  }

  const winnerId = (auction.winner._id || auction.winner).toString();
  if (winnerId !== userId.toString()) {
    throw new ForbiddenError("Only the auction winner is authorized to initiate payment.");
  }

  if (auction.paymentStatus === "paid") {
    throw new ValidationError("Payment has already been completed for this auction.");
  }

  // Check for existing DB payment record
  let existingPayment = await findPaymentByAuction(auctionId);
  if (existingPayment && existingPayment.status === "SUCCESS") {
    throw new ValidationError("Payment has already succeeded for this auction.");
  }

  // 3. Always calculate amount from auction document (never trust frontend input)
  const amount = auction.currentHighestBid?.amount || auction.startPrice;
  if (!amount || amount <= 0) {
    throw new ValidationError("Invalid auction winning bid amount.");
  }

  const sellerId = (auction.seller._id || auction.seller).toString();

  // 4. Create Order in Razorpay (amount converted to paise for INR)
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `receipt_auc_${auctionId.toString().slice(-8)}_${Date.now()}`,
    notes: {
      auctionId: auctionId.toString(),
      winnerId: winnerId,
      sellerId: sellerId,
    },
  };

  const razorpayOrder = await razorpay.orders.create(options);

  // 5. Persist or update PENDING payment record in database
  let paymentDoc;
  if (existingPayment) {
    paymentDoc = await updatePaymentStatus(existingPayment._id, {
      orderId: razorpayOrder.id,
      status: "PENDING",
      amount,
      provider: "RAZORPAY",
    });
  } else {
    paymentDoc = await createPayment({
      auction: auctionId,
      payer: winnerId,
      seller: sellerId,
      amount,
      provider: "RAZORPAY",
      orderId: razorpayOrder.id,
      status: "PENDING",
    });
  }

  return {
    order: razorpayOrder,
    payment: paymentDoc,
    keyId: env.RAZORPAY_KEY_ID,
  };
}

/**
 * Verify Razorpay payment signature and finalize payment completion
 *
 * @param {Object} verifyData - ({ auctionId, orderId, paymentId, signature })
 * @param {string} userId - Requesting user ID
 * @param {Object|null} io - Socket.io server instance for room broadcast
 * @returns {Promise<Object>} Verified payment result
 */
export async function verifyRazorpayPaymentService(
  { auctionId, orderId, paymentId, signature },
  userId,
  io = null
) {
  const auction = await getAuctionById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  let payment = await findPaymentByOrderId(orderId);
  if (!payment) {
    payment = await findPaymentByAuction(auctionId);
  }

  if (!payment) {
    throw new NotFoundError("Payment record not found for this order");
  }

  if (payment.status === "SUCCESS" && auction.paymentStatus === "paid") {
    return {
      success: true,
      message: "Payment already verified successfully.",
      payment,
    };
  }

  // 1. Verify Razorpay HMAC SHA256 Signature
  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isSignatureValid = generatedSignature === signature;

  if (!isSignatureValid) {
    // Mark payment status as FAILED on signature mismatch
    await updatePaymentStatus(payment._id, { status: "FAILED" });

    // Log Timeline event for payment failure
    await createTimelineEvent({
      auctionId,
      type: "PAYMENT_FAILED",
      message: "Payment verification failed: Invalid signature",
    });

    throw new ValidationError("Payment verification failed: Invalid signature.");
  }

  // 2. Update Payment.status = SUCCESS, store paymentId & signature
  const updatedPayment = await updatePaymentStatus(payment._id, {
    status: "SUCCESS",
    paymentId,
    signature,
  });

  // 3. Update Auction.paymentStatus = "paid"
  await updateAuction(auctionId, {
    paymentStatus: "paid",
  });

  // 4. Log Timeline event for successful payment
  const timelineEvent = await createTimelineEvent({
    auctionId,
    type: "PAYMENT_SUCCESS",
    message: `Winner completed payment of $${payment.amount}`,
    metadata: {
      winner: userId,
      amount: payment.amount,
      paymentId,
    },
  });

  // 5. Broadcast real-time Socket.io payment_success event to auction room
  if (io) {
    io.to(auctionId.toString()).emit("payment_success", {
      auctionId,
      paymentStatus: "SUCCESS",
      amount: payment.amount,
      paymentId,
    });

    io.to(auctionId.toString()).emit("timeline_updated", timelineEvent);
  }

  return {
    success: true,
    message: "Payment verified successfully.",
    payment: updatedPayment,
  };
}

/**
 * Retrieve payment details for an auction listing
 *
 * @param {string} auctionId - Target auction ID
 * @param {string} userId - Requesting user ID
 * @returns {Promise<Object>} Payment document
 */
export async function getPaymentDetailsService(auctionId, userId) {
  const auction = await getAuctionById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  const payment = await findPaymentByAuction(auctionId);
  if (!payment) {
    throw new NotFoundError("No payment record found for this auction.");
  }

  return payment;
}
