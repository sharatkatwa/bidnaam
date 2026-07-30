import { Link } from "react-router";
import { useDashboardStats } from "../hooks/useDashboardStats.js";
import Badge from "../../../shared/components/Badge.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import { formatCurrency } from "../../../shared/utils/formatTime.js";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const { dashboard, isLoading } = useDashboardStats();

  if (isLoading) return <Loader />;

  const maxBids = Math.max(...dashboard.weeklyBids);

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="panel reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-ink-dim mb-2">
        Seller dashboard
      </div>
      <h1 className="reveal font-display font-black text-[clamp(30px,4vw,44px)]" style={{ animationDelay: "0.06s" }}>
        Your <span className="text-brand">performance.</span>
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard label="Total revenue" value={formatCurrency(dashboard.totalRevenue)} delay="0.1s" />
        <StatCard label="Total views" value={dashboard.totalViews.toLocaleString("en-IN")} delay="0.14s" />
        <StatCard label="Listings" value={dashboard.totalListings} delay="0.18s" />
        <StatCard label="Avg bids / auction" value={dashboard.avgBidsPerAuction} delay="0.22s" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-5 mt-6">
        <div className="panel reveal rounded-2xl p-6 min-w-0" style={{ animationDelay: "0.26s" }}>
          <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wide mb-5">Bids this week</h3>

          <div className="flex items-end gap-2 h-32">
            {dashboard.weeklyBids.map((count, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg bg-brand transition-all duration-500"
                style={{ height: `${(count / maxBids) * 100}%` }}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            {days.map((d) => (
              <span key={d} className="flex-1 text-center text-[10px] text-ink-dim uppercase">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="panel reveal rounded-2xl p-6 min-w-0" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wide mb-4">My listings</h3>
          <ul className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {dashboard.auctions.map((auction) => (
              <li key={auction.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <Link
                  to={auction.status === "live" ? `/auction/${auction.id}/room` : `/auction/${auction.id}`}
                  className="flex items-center justify-between gap-3 hover:text-brand transition"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{auction.title}</div>
                    <div className="text-ink-dim text-xs mt-0.5">
                      {auction.views} views · {auction.bids} bids
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm tabular-nums">{formatCurrency(auction.currentBid)}</span>
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

function StatCard({ label, value, delay }) {
  return (
    <div className="panel reveal rounded-2xl p-5 text-center" style={{ animationDelay: delay }}>
      <div className="font-mono text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-ink-dim uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
