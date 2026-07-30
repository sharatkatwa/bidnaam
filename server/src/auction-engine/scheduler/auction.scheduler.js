import { listAuctions, updateAuction } from "../../modules/auction/services/auction.service.js";
import { createTimelineEvent } from "../../modules/timeline/services/timeline.service.js";

/**
 * Auction Scheduler Service
 * Periodically checks for upcoming/scheduled auctions whose startTime has arrived,
 * transitions their DB status to "active", logs timeline events, and initializes
 * active in-memory rooms & server timers in AuctionEngine.
 */
class AuctionScheduler {
  /**
   * @param {AuctionEngine} engine - Active AuctionEngine instance
   * @param {number} intervalMs - Polling interval in milliseconds (default: 30,000ms = 30s)
   */
  constructor(engine, intervalMs = 30_000) {
    this.engine = engine;
    this.intervalMs = intervalMs;
    this.timer = null;
    this.running = false;
  }

  /**
   * Start the periodic background scheduler
   */
  start() {
    if (this.running) return;

    this.running = true;
    console.log(
      `[AuctionScheduler] Started background scheduler (polling every ${this.intervalMs / 1000}s).`
    );

    // Run immediate check on start
    this.checkScheduledAuctions().catch((err) => {
      console.error("[AuctionScheduler Error] Initial check failed:", err.message);
    });

    this.timer = setInterval(async () => {
      try {
        await this.checkScheduledAuctions();
      } catch (err) {
        console.error("[AuctionScheduler Error] Polling check failed:", err.message);
      }
    }, this.intervalMs);
  }

  /**
   * Stop the periodic background scheduler
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    console.log("[AuctionScheduler] Background scheduler stopped.");
  }

  /**
   * Check for scheduled/upcoming auctions that are due to start
   */
  async checkScheduledAuctions() {
    const now = new Date();

    // Query auctions with status 'upcoming' or 'scheduled' whose startTime <= now
    const upcomingAuctions = await listAuctions({
      status: { $in: ["upcoming", "scheduled"] },
      startTime: { $lte: now },
    });

    if (!upcomingAuctions || upcomingAuctions.length === 0) {
      return;
    }

    console.log(
      `[AuctionScheduler] Found ${upcomingAuctions.length} auction(s) due to start.`
    );

    for (const auction of upcomingAuctions) {
      try {
        // 1. Update status to 'active' in database
        const updatedAuction = await updateAuction(auction._id, {
          status: "active",
        });

        // 2. Log AUCTION_STARTED timeline event
        await createTimelineEvent({
          auctionId: auction._id,
          type: "AUCTION_STARTED",
          title: auction.title,
        });

        // 3. Initialize in-memory room & start server-authoritative timer in AuctionEngine
        await this.engine.startAuction(updatedAuction || auction);

        console.log(
          `[AuctionScheduler] Successfully started scheduled auction ID ${auction._id} ("${auction.title}").`
        );
      } catch (error) {
        console.error(
          `[AuctionScheduler Error] Failed to start scheduled auction ID ${auction._id}:`,
          error.message
        );
      }
    }
  }
}

export default AuctionScheduler;
