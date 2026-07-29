import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useProfileStats } from "../hooks/useProfileStats.js";
import Badge from "../../../shared/components/Badge.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import { formatCurrency } from "../../../shared/utils/formatTime.js";

const bidStatusStyles = {
  won: "text-bid-gold",
  active: "text-bid-cyan",
  outbid: "text-white/40",
};

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const { profile, isLoading } = useProfileStats();

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="glass reveal rounded-2xl p-7 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-bid-gold to-bid-orange flex items-center justify-center font-display text-xl">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">{user?.name ?? "Your profile"}</h1>
          <p className="text-white/55 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatCard value={profile.auctionsCreated} label="Auctions created" />
        <StatCard value={profile.auctionsWon} label="Auctions won" />
        <StatCard value={profile.totalBids} label="Total bids" />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="glass reveal rounded-2xl p-6" style={{ animationDelay: "0.08s" }}>
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wide mb-4">Bid history</h2>
          <ul className="flex flex-col gap-3">
            {profile.bidHistory.map((bid) => (
              <li key={bid.id} className="flex items-center justify-between text-sm">
                <span className="text-white/85">{bid.lotTitle}</span>
                <div className="text-right">
                  <div className="font-mono font-semibold tabular-nums">{formatCurrency(bid.amount)}</div>
                  <div className={`text-[11px] uppercase tracking-wide ${bidStatusStyles[bid.status]}`}>{bid.status}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass reveal rounded-2xl p-6" style={{ animationDelay: "0.14s" }}>
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wide mb-4">My auctions</h2>
          <ul className="flex flex-col gap-3">
            {profile.myAuctions.map((auction) => (
              <li key={auction.id}>
                <Link
                  to={`/auction/${auction.id}`}
                  className="flex items-center justify-between text-sm hover:text-bid-gold transition"
                >
                  <span>{auction.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums">{formatCurrency(auction.currentBid)}</span>
                    <Badge status={auction.status}>{auction.status}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="glass reveal rounded-2xl p-5 text-center">
      <div className="font-mono text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-white/50 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
