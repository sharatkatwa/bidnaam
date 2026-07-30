import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: [true, "Auction reference is required"],
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Bidder reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: [0.01, "Bid amount must be positive"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Database indexes for fast timeline retrieval and user bid history lookup
bidSchema.index({ auction: 1, createdAt: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });

const Bid = mongoose.model("Bid", bidSchema);

export default Bid;
