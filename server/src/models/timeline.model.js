import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: [true, "Auction reference is required"],
    },
    type: {
      type: String,
      required: [true, "Event type is required"],
      enum: [
        "AUCTION_CREATED",
        "AUCTION_STARTED",
        "BID_PLACED",
        "BID_REJECTED",
        "TIME_EXTENDED",
        "WINNER_DECLARED",
        "PAYMENT_PENDING",
        "PAYMENT_SUCCESSFUL",
        "PAYMENT_FAILED",
        "AUCTION_CLOSED",
        "SYSTEM_ALERT",
      ],
    },
    message: {
      type: String,
      required: [true, "Timeline message is required"],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Database index for fast timeline event retrieval sorted chronologically
timelineSchema.index({ auction: 1, createdAt: 1 });

const Timeline = mongoose.model("Timeline", timelineSchema);

export default Timeline;
