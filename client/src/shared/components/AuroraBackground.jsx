import { useEffect, useRef } from "react";

export default function AuroraBackground() {
  const layerRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e) {
      if (!layerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      layerRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <>
      <div className="aurora-bg" />
      <div className="aurora-blob aurora-blob-a" />
      <div className="aurora-blob aurora-blob-b" />
      <div className="aurora-blob aurora-blob-c" />
      <div ref={layerRef} className="orb-layer">
        <div className="orb orb-gold" />
        <div className="orb orb-cyan" />
        <div className="orb orb-magenta" />
        <div className="orb orb-small" />
      </div>
      <div className="aurora-grain" />
    </>
  );
}
