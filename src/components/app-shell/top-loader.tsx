"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete loading when pathname changes
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Global listener for link clicks to provide 0ms visual feedback
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        target.getAttribute("target") !== "_blank" &&
        href !== pathname
      ) {
        setLoading(true);
        setProgress(35);
        setTimeout(() => {
          setProgress((prev) => (prev >= 35 && prev < 85 ? 85 : prev));
        }, 150);
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-[#329CF5] via-[#563BFA] to-violet-500 shadow-[0_0_8px_#563BFA] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 150ms ease-out, opacity 200ms 100ms ease-in" : "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}
