import { useCallback, useRef, useState } from "react";

export function usePointerTilt(max = 7) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onPointerMove = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 2, y: py * 2 });
  }, []);

  const onPointerLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  const style = {
    transform: `perspective(1400px) rotateX(${(-tilt.y * max).toFixed(2)}deg) rotateY(${(tilt.x * max).toFixed(2)}deg)`,
  };

  return { ref, style, onPointerMove, onPointerLeave };
}
