import { useEffect, useRef } from "react";

const PARTICLE_COLORS = ["255,201,77", "77,238,234", "255,107,61"];
const LINK_DISTANCE = 140;
const REPEL_DISTANCE = 110;

export default function AuroraBackground() {
  const canvasRef = useRef(null);
  const orbLayerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let particles = [];
    let rafId;
    const mouse = { x: -9999, y: -9999 };

    function spawnParticles() {
      const count = Math.min(
        60,
        Math.floor((window.innerWidth * window.innerHeight) / 26000),
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 1.2,
        color:
          PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      }));
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnParticles();
    }

    function handlePointerMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (orbLayerRef.current) {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        orbLayerRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    }

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_DISTANCE && dist > 0.01) {
          const force = (1 - dist / REPEL_DISTANCE) * 1.4;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / LINK_DISTANCE) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},0.9)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color},0.65)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!reduceMotion) rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    if (!reduceMotion)
      window.addEventListener("pointermove", handlePointerMove);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <>
      <div className="aurora-bg" />

      <div ref={orbLayerRef} className="orb-layer">
        <div className="orb orb-gold" />
        <div className="orb orb-cyan" />
        <div className="orb orb-magenta" />
        <div className="orb orb-small" />
      </div>

      <canvas ref={canvasRef} className="constellation-canvas" />
      <div className="aurora-grain" />
    </>
  );
}
