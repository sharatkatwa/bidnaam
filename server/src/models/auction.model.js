import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    startPrice: {
      type: Number,
      required: [true, "Start price is required"],
      min: [0, "Start price cannot be negative"],
    },
    minimumIncrement: {
      type: Number,
      default: 1,
      min: [0.01, "Minimum increment must be positive"],
    },
    currentHighestBid: {
      amount: {
        type: Number,
        default: function () {
          return this.startPrice || 0;
        },
      },
      bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
        default: null,
      },
      timestamp: {
        type: Date,
        default: null,
      },
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "cancelled"],
      default: "upcoming",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed", "none"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for optimized discovery queries and fast status checks
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
