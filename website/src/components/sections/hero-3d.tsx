"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

// The Canvas touches window/WebGL on mount, so it must not render on the server.
const BurgerStage = dynamic(
  () => import("@/components/three/burger-stage").then((m) => m.BurgerStage),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <span className="loader" />
      </div>
    ),
  },
);

export function Hero3D() {
  const ref = useRef<HTMLElement>(null);
  const [spin, setSpin] = useState(0);

  // gentle idle rotation, paused for reduced-motion users
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      setSpin(((performance.now() - t0) / 1000) * 0.16);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate overflow-hidden bg-cream text-ink"
    >
      <div className="container relative pb-10 pt-24 md:pb-16 md:pt-32">
        {/* oversized wordmark behind the product */}
        <h1
          aria-label="Ember and Ash — flame grilled burgers"
          className="pointer-events-none select-none text-center font-display font-bold leading-[0.82] tracking-[-0.02em] text-ink/[0.07]"
          style={{ fontSize: "clamp(4.5rem, 17vw, 15rem)" }}
        >
          EMBER
        </h1>

        <div className="relative -mt-[14vw] md:-mt-[11vw]">
          <BurgerStage
            spin={spin}
            className="mx-auto h-[46vh] min-h-[300px] w-full max-w-3xl md:h-[58vh]"
          />
        </div>

        {/* spec flanks, in the manner of a product page */}
        <div className="relative z-10 -mt-6 grid grid-cols-2 gap-8 md:-mt-14 md:grid-cols-4 md:gap-6">
          <Spec label="Dry-aged" value="45 days" />
          <Spec label="Charcoal sear" value="1,200°F" />
          <Spec label="Patty weight" value="220 g" />
          <Spec label="Buns baked" value="6:00 am" />
        </div>
      </div>

      <div className="container flex flex-col items-start justify-between gap-6 border-t border-ink/10 py-8 md:flex-row md:items-center">
        <p className="max-w-md text-base leading-relaxed text-ink/70">
          Chuck and short rib, ground each morning and seared over live
          charcoal. Brioche baked downstairs at six. Nothing frozen, ever.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#stack"
            className="group inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-ink/85"
          >
            See it built
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
          <a
            href="#menu"
            className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border border-ink/20 px-7 text-sm font-semibold transition-colors duration-200 hover:bg-ink/5"
          >
            Menu
          </a>
        </div>
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold md:text-3xl">{value}</p>
    </div>
  );
}
