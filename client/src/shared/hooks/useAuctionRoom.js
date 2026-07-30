import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getSocket } from "../../api/socket.js";
import { SOCKET_EVENTS } from "../data/socketEvents.js";
import { getAuctionById } from "../../features/auction-discovery/service/auctionService.js";
import { mockRoom } from "../data/mockRoom.js";
import { formatCurrency } from "../utils/formatTime.js";

export function useAuctionRoom(auctionId) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const query = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => getAuctionById(auctionId),
    enabled: Boolean(auctionId),
    retry: false,
  });

  const real = query.data;
  const room = real ?? mockRoom;

  const [currentBid, setCurrentBid] = useState(room.currentBid);
  const [currentBidder, setCurrentBidder] = useState(room.currentBidder);
  const [bidCount, setBidCount] = useState(room.bidCount);
  const [remaining, setRemaining] = useState(room.endsInSec);
  const [heat, setHeat] = useState(40);
  const [activeBidders, setActiveBidders] = useState(room.activeBidders ?? 0);
  const [spectators, setSpectators] = useState(room.spectators ?? 0);
  const [timeline, setTimeline] = useState([
    { id: 1, label: `${room.currentBidder} bid ${formatCurrency(room.currentBid)}` },
  ]);

  const addTimelineEvent = useCallback((label) => {
    setTimeline((prev) => [{ id: Date.now(), label }, ...prev].slice(0, 8));
  }, []);

  // Sync local state whenever a fresh real auction fetch lands
  useEffect(() => {
    if (!real) return;
    setCurrentBid(real.currentBid);
    setCurrentBidder(real.currentBidder);
    setBidCount(real.bidCount);
    setRemaining(real.endsInSec);
    setTimeline([
      { id: 1, label: real.bidCount > 0 ? `${real.currentBidder} bid ${formatCurrency(real.currentBid)}` : "Auction opened for bidding" },
    ]);
  }, [real]);

  // Real-time: join the auction room over Socket.io once we have a real auction
  useEffect(() => {
    if (!auctionId || !real) return;

    const socket = getSocket();
    socket.connect();
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      auctionId,
      role: isAuthenticated ? "participant" : "spectator",
    });

    function onRoomState(state) {
      if (typeof state.highestBid === "number") setCurrentBid(state.highestBid);
      if (state.highestBidder) setCurrentBidder(state.highestBidder);
      if (typeof state.timeRemaining === "number") setRemaining(Math.round(state.timeRemaining / 1000));
      setActiveBidders(state.participantsCount ?? 0);
      setSpectators(state.spectatorsCount ?? 0);
    }

    function onBidUpdated(payload) {
      setCurrentBid(payload.highestBid);
      setCurrentBidder(payload.highestBidder ?? "bidder");
      setBidCount((prev) => prev + 1);
      setHeat((prev) => Math.min(100, prev + 15));
      addTimelineEvent(`${payload.highestBidder ?? "Someone"} bid ${formatCurrency(payload.highestBid)}`);
    }

    function onTimerTick(payload) {
      if (typeof payload.remaining === "number") setRemaining(Math.round(payload.remaining / 1000));
    }

    function onAuctionEnded() {
      setRemaining(0);
    }

    function onUserJoined(payload) {
      setActiveBidders(payload.participantsCount ?? 0);
      setSpectators(payload.spectatorsCount ?? 0);
    }

    socket.on(SOCKET_EVENTS.ROOM_STATE, onRoomState);
    socket.on(SOCKET_EVENTS.BID_UPDATED, onBidUpdated);
    socket.on(SOCKET_EVENTS.TIMER_TICK, onTimerTick);
    socket.on(SOCKET_EVENTS.AUCTION_ENDED, onAuctionEnded);
    socket.on(SOCKET_EVENTS.USER_JOINED, onUserJoined);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { auctionId });
      socket.off(SOCKET_EVENTS.ROOM_STATE, onRoomState);
      socket.off(SOCKET_EVENTS.BID_UPDATED, onBidUpdated);
      socket.off(SOCKET_EVENTS.TIMER_TICK, onTimerTick);
      socket.off(SOCKET_EVENTS.AUCTION_ENDED, onAuctionEnded);
      socket.off(SOCKET_EVENTS.USER_JOINED, onUserJoined);
    };
  }, [auctionId, real, isAuthenticated, addTimelineEvent]);

  // Mock-mode local countdown — real rooms get their countdown from timer_tick instead
  useEffect(() => {
    if (real) return;
    const timer = setInterval(() => setRemaining((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [real]);

  function placeBid(amount) {
    if (!amount || amount <= currentBid) {
      return { ok: false, error: "Bid must be higher than the current bid." };
    }

    if (real) {
      getSocket().emit(SOCKET_EVENTS.SUBMIT_BID, { auctionId, amount });
      return { ok: true };
    }

    setCurrentBid(amount);
    setCurrentBidder("You");
    setBidCount((prev) => prev + 1);
    setHeat((prev) => Math.min(100, prev + 15));
    addTimelineEvent(`You bid ${formatCurrency(amount)}`);
    return { ok: true };
  }

  return {
    room: { ...room, activeBidders, spectators },
    currentBid,
    currentBidder,
    bidCount,
    remaining,
    heat,
    timeline,
    placeBid,
  };
}
