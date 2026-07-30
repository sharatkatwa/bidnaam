import { Link } from "react-router";
import AppBackground from "./AppBackground.jsx";
import Button from "./Button.jsx";
import SplitFlapText from "./SplitFlapText.jsx";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-ink px-6">
      <AppBackground />

      <div className="paper paper-tape reveal relative rounded-3xl p-10 text-center max-w-md">
        <SplitFlapText text="404" className="justify-center text-3xl mb-4" />
        <h1 className="font-display font-black text-2xl mb-3">This lot doesn't exist</h1>
        <p className="text-paper-ink-dim mb-8 leading-relaxed">
          The auction you're looking for was never listed, already closed, or the link's off.
        </p>
        <Link to="/">
          <Button variant="dark">Back to discovery →</Button>
        </Link>
      </div>
    </div>
  );
}
