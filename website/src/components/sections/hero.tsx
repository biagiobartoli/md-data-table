"use client";

import { ArrowRight, Star } from "lucide-react";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Card } from "@/components/ui/card";
import { BurgerArt } from "@/components/ui/burger-art";

/**
 * Swap this for your own Spline scene from https://app.spline.design.
 * The default is Spline's public demo scene — replace it before launch.
 */
const SPLINE_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export function Hero() {
  return (
    <section id="top" className="relative px-4 pt-24 md:pt-28">
      <Card className="grain relative mx-auto w-full max-w-7xl overflow-hidden border-border/60 bg-black/[0.96] md:h-[620px]">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          size={520}
        />

        <div className="flex h-full flex-col md:flex-row">
          {/* Left content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center p-8 md:p-14">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-400">
                4.9 · 2,180 reviews
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl">
              <span className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
                Grilled over
              </span>
              <br />
              <span className="bg-gradient-to-b from-primary via-ember to-accent bg-clip-text text-transparent">
                live fire.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-300 md:text-lg">
              Dry-aged chuck and short rib, ground each morning, seared on
              charcoal until the edges go lacy and dark. Brioche baked
              downstairs. Nothing frozen, ever.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#menu"
                className="group inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90"
              >
                See the menu
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <a
                href="#visit"
                className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border border-neutral-700 px-7 text-sm font-semibold text-neutral-200 transition-colors duration-200 hover:border-neutral-500 hover:bg-white/5"
              >
                Book a table
              </a>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-neutral-800 pt-6">
              {[
                ["45 days", "Dry-aged"],
                ["1,200°F", "Charcoal sear"],
                ["6am", "Buns baked"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="sr-only">{k}</dt>
                  <dd className="font-display text-xl text-neutral-100 md:text-2xl">
                    {v}
                  </dd>
                  <dd className="mt-0.5 text-xs uppercase tracking-wider text-neutral-500">
                    {k}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right content — interactive 3D scene, vector art underneath as
              the guaranteed-visible layer while the scene streams in. */}
          <div className="relative h-[300px] shrink-0 md:h-auto md:flex-1">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 opacity-90">
              <BurgerArt className="max-h-[240px] animate-flicker md:max-h-[420px]" />
            </div>
            <SplineScene scene={SPLINE_SCENE} className="h-full w-full" fallback={null} />
          </div>
        </div>
      </Card>
    </section>
  );
}
