import Payment from "../../../models/payment.model.js";

/**
 * Create a new payment record in database
 * @param {Object} paymentData - Payment creation fields
 * @returns {Promise<Object>} Created Payment document
 */
export const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

/**
 * Find payment document by auction ID
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @returns {Promise<Object|null>} Payment document
 */
export const findPaymentByAuction = async (auctionId) => {
  return await Payment.findOne({ auction: auctionId })
    .populate("payer", "email")
    .populate("seller", "email")
    .exec();
};

/**
 * Find payment document by Razorpay order ID
 * @param {string} orderId - Razorpay Order ID string
 * @returns {Promise<Object|null>} Payment document
 */
export const findPaymentByOrderId = async (orderId) => {
  return await Payment.findOne({ orderId })
    .populate("payer", "email")
    .populate("seller", "email")
    .exec();
};

/**
 * Update payment record fields by ID
 * @param {string} paymentId - Payment Mongoose ObjectId
 * @param {Object} updateData - Data fields to update
 * @returns {Promise<Object|null>} Updated Payment document
 */
export const updatePaymentStatus = async (paymentId, updateData) => {
  return await Payment.findByIdAndUpdate(paymentId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("payer", "email")
    .populate("seller", "email")
    .exec();
};
