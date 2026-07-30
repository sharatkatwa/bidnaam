import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: [true, "Auction reference is required"],
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Payer reference is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    provider: {
      type: String,
      enum: ["RAZORPAY", "STRIPE"],
      default: "RAZORPAY",
    },
    orderId: {
      type: String,
      default: "",
    },
    paymentId: {
      type: String,
      default: "",
    },
    signature: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for order lookup, verification, and user billing queries
paymentSchema.index({ auction: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ payer: 1 });
paymentSchema.index({ seller: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
