import { listAuctions } from "../../modules/auction/services/auction.service.js";

/**
 * Server Restart Recovery Service (Scenario S-15 & FR-22)
 * Re-hydrates in-memory AuctionRooms and restores server-authoritative timers
 * for all active auctions on backend server boot.
 *
 * @param {AuctionEngine} engine - Active AuctionEngine instance
 * @returns {Promise<number>} Total number of successfully recovered room instances
 */
export async function recoverActiveAuctions(engine) {
  if (!engine) {
    throw new Error("AuctionEngine instance is required for server recovery.");
  }

  // 1. Fetch all currently ACTIVE auctions from database
  const activeAuctions = await listAuctions({ status: "active" });

  let recoveredCount = 0;

  // 2. Start in-memory room & server timer for each active auction listing
  for (const auction of activeAuctions) {
    try {
      await engine.startAuction(auction);
      recoveredCount++;
    } catch (error) {
      console.error(
        `[AuctionEngine Recovery Error] Failed to recover auction room ID ${auction._id}:`,
        error.message
      );
    }
  }

  console.log(
    `[AuctionEngine Recovery] Successfully re-hydrated ${recoveredCount} active auction room(s) & timer(s).`
  );

  return recoveredCount;
}
