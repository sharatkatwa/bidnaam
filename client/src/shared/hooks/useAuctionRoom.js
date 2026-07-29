import { useState, useEffect, useCallback } from "react";
import { mockRoom } from "../data/mockRoom.js";
import { formatCurrency } from "../utils/formatTime.js";

export function useAuctionRoom() {
  const [currentBid, setCurrentBid] = useState(mockRoom.currentBid);
  const [currentBidder, setCurrentBidder] = useState(mockRoom.currentBidder);
  const [bidCount, setBidCount] = useState(mockRoom.bidCount);
  const [remaining, setRemaining] = useState(mockRoom.endsInSec);
  const [heat, setHeat] = useState(40);
  const [timeline, setTimeline] = useState([
    { id: 1, label: `${mockRoom.currentBidder} bid ${formatCurrency(mockRoom.currentBid)}` },
  ]);

  const addTimelineEvent = useCallback((label) => {
    setTimeline((prev) => [{ id: Date.now(), label }, ...prev].slice(0, 8));
  }, []);

  // Server-authoritative countdown — this will tick down from whatever endsAt Domain B's API returns
  useEffect(() => {
    const timer = setInterval(() => setRemaining((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  function placeBid(amount) {
    if (!amount || amount <= currentBid) {
      return { ok: false, error: "Bid must be higher than the current bid." };
    }
    setCurrentBid(amount);
    setCurrentBidder("You");
    setBidCount((prev) => prev + 1);
    setHeat((prev) => Math.min(100, prev + 15));
    addTimelineEvent(`You bid ${formatCurrency(amount)}`);
    return { ok: true };
  }

  return {
    room: mockRoom,
    currentBid,
    currentBidder,
    bidCount,
    remaining,
    heat,
    timeline,
    placeBid,
  };
}
