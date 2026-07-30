export default function Card({ children, className = "" }) {
  return (
    <div className={`panel rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}
