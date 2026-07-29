import { Link } from "react-router";
import AuroraBackground from "./AuroraBackground.jsx";
import Button from "./Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-white px-6">
      <AuroraBackground />

      <div className="glass-strong reveal rounded-3xl p-10 text-center max-w-md">
        <div className="font-display text-7xl shine-text mb-2">404</div>
        <h1 className="text-2xl font-extrabold mb-3">This lot doesn't exist</h1>
        <p className="text-white/70 mb-8 leading-relaxed">
          The auction you're looking for was never listed, already closed, or the link's off.
        </p>
        <Link to="/">
          <Button variant="primary">Back to discovery →</Button>
        </Link>
      </div>
    </div>
  );
}
