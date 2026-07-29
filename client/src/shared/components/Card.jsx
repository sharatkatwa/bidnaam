export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}
