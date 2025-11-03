"use client";

import { useEffect, useRef } from "react";

export default function CursorTrail() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function createDot(x: number, y: number) {
      if (!container) return;
      const dot = document.createElement("div");
      dot.className =
        "w-2 h-2 bg-purple-500 rounded-full absolute pointer-events-none transition-opacity duration-500";
      dot.style.left = `${x - 4}px`;
      dot.style.top = `${y - 4}px`;
      container.appendChild(dot);

      // Fade out and remove after delay
      requestAnimationFrame(() => {
        dot.style.opacity = "0";
      });

      setTimeout(() => {
        if (container) {
          container.removeChild(dot);
        }
      }, 500);
    }

    function handleMouseMove(e: MouseEvent) {
      createDot(e.clientX, e.clientY);
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 pointer-events-none" />
  );
}
