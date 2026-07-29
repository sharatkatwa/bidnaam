export function formatCountdown(seconds) {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}
