"use client";

import { motion } from "framer-motion";
import { Beef, Flame, Wheat } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";

const STEPS = [
  {
    icon: Beef,
    step: "01",
    title: "Ground at 7am",
    body: "Chuck and short rib, dry-aged 45 days, coarse-ground the morning it is served. Never the day before.",
  },
  {
    icon: Flame,
    step: "02",
    title: "Charcoal, 1,200°F",
    body: "Binchotan and oak. The patty goes on cold and comes off with a crust you can hear. No flat-tops.",
  },
  {
    icon: Wheat,
    step: "03",
    title: "Buns from downstairs",
    body: "Brioche proofed overnight, baked at 6am, toasted in beef fat to order. Enriched enough to hold, soft enough to give.",
  },
];

export function Craft() {
  return (
    <section
      id="craft"
      className="grain relative scroll-mt-20 overflow-hidden border-y border-border/60 bg-ash py-20 md:py-28"
    >
      <Spotlight className="-top-20 left-1/4" size={400} />
      <div className="container relative z-10">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            The craft
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight text-balance md:text-5xl">
            Three things we refuse to rush
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background">
                <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <span className="font-display text-sm text-muted-foreground">
                {s.step}
              </span>
              <h3 className="mt-1 font-display text-2xl font-semibold">
                {s.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
