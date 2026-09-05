"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const BurgerStage = dynamic(
  () => import("@/components/three/burger-stage").then((m) => m.BurgerStage),
  { ssr: false, loading: () => null },
);

const LAYERS = [
  { name: "Toasted brioche crown", note: "Baked at 6am, toasted in beef fat" },
  { name: "Beefsteak tomato", note: "Cut to order, salted" },
  { name: "Little gem lettuce", note: "Iced, for the snap" },
  { name: "Aged cheddar", note: "Two slices, melted under a cloche" },
  { name: "The patty", note: "220g chuck and short rib, live fire" },
  { name: "Brioche heel", note: "Sauced, never soggy" },
];

export function Stack3D() {
  const section = useRef<HTMLElement>(null);
  const explode = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      // 0 at the moment the section pins, 1 when it releases
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      explode.current = p;
      const idx = Math.min(LAYERS.length - 1, Math.floor(p * LAYERS.length));
      setActive((prev) => (prev === idx ? prev : idx));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="stack"
      ref={section}
      className="relative h-[320vh] scroll-mt-20 bg-ink text-cream"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,120,40,0.18), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="container relative grid w-full items-center gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="order-2 md:order-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              The build
            </p>
            <h2 className="font-display text-3xl font-bold leading-[1.05] md:text-5xl">
              Six layers,
              <br />
              no shortcuts
            </h2>

            <ol className="mt-8 space-y-1">
              {LAYERS.map((l, i) => (
                <li
                  key={l.name}
                  className={`flex gap-4 rounded-lg px-3 py-2.5 transition-colors duration-300 ${
                    i === active ? "bg-cream/10" : ""
                  }`}
                >
                  <span
                    className={`mt-0.5 font-display text-sm tabular-nums transition-colors duration-300 ${
                      i === active ? "text-primary" : "text-cream/35"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span
                      className={`block text-sm font-semibold transition-colors duration-300 md:text-base ${
                        i === active ? "text-cream" : "text-cream/45"
                      }`}
                    >
                      {l.name}
                    </span>
                    <span
                      className={`block text-xs transition-opacity duration-300 md:text-sm ${
                        i === active ? "text-cream/60 opacity-100" : "opacity-0 md:opacity-40"
                      }`}
                    >
                      {l.note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-xs uppercase tracking-[0.18em] text-cream/40">
              Scroll to pull it apart · drag to turn
            </p>
          </div>

          <div className="order-1 md:order-2">
            <BurgerStage
              explodeRef={explode}
              className="h-[38vh] w-full md:h-[78vh]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
