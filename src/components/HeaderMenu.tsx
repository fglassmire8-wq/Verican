"use client";

import { useEffect, useRef, useState } from "react";

export function HeaderMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-panel-2"
      >
        <span className="block h-[2px] w-6 rounded bg-[#1b6e2c]" />
        <span className="block h-[2px] w-6 rounded bg-[#1b6e2c]" />
        <span className="block h-[2px] w-6 rounded bg-[#1b6e2c]" />
      </button>
      {open ? (
        <nav
          id="site-menu"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a,button")) setOpen(false);
          }}
          className="absolute left-0 mt-2 w-60 rounded-xl border border-line bg-panel p-4 flex flex-col items-start gap-3 text-sm shadow-lg"
        >
          {children}
        </nav>
      ) : null}
    </div>
  );
}
