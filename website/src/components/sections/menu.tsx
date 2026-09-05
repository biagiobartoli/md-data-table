"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { BurgerArt } from "@/components/ui/burger-art";

const BURGERS = [
  {
    name: "The Ember Stack",
    price: "$17",
    tag: "Signature",
    desc: "Two smash patties, aged cheddar twice over, ember onions, house pickles, ash sauce.",
  },
  {
    name: "Ash & Bone",
    price: "$19",
    tag: "Dry-aged",
    desc: "Single 7oz dry-aged patty, bone-marrow butter, charred shallot, watercress.",
  },
  {
    name: "The Smoulder",
    price: "$16",
    tag: "Hot",
    desc: "Chipotle-braised brisket, pepper jack, pickled fresno, smoked aioli.",
  },
  {
    name: "Garden Char",
    price: "$15",
    tag: "Vegetarian",
    desc: "Grilled maitake and black bean patty, roasted garlic, tomato jam.",
  },
  {
    name: "Sunday Double",
    price: "$18",
    tag: "Weekends",
    desc: "Two patties, fried egg, black pepper bacon, sharp cheddar, maple butter.",
  },
  {
    name: "The Plain Truth",
    price: "$13",
    tag: "Classic",
    desc: "One patty, one slice of cheese, salt. Proof the beef is the point.",
  },
];

export function MenuSection() {
  return (
    <section id="menu" className="scroll-mt-20 py-20 md:py-28">
      <div className="container">
        <div className="mb-12 max-w-2xl md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            The menu
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight text-balance md:text-5xl">
            Six burgers. That&apos;s the whole list.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            We would rather do six things properly than thirty things
            adequately. Everything is ground, baked, and pickled in this
            building.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BURGERS.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.45,
                delay: (i % 3) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Card className="group grain h-full overflow-hidden border-border/60 bg-card transition-colors duration-300 hover:border-primary/50">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-b from-ash to-background">
                  <div
                    className="absolute inset-x-0 bottom-0 h-24 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 100%, rgba(255,106,26,0.5), transparent 70%)",
                    }}
                    aria-hidden="true"
                  />
                  <BurgerArt
                    seed={i + 2}
                    className="relative max-h-[78%] transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                    {b.tag}
                  </span>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <CardTitle className="font-display text-xl">
                      {b.name}
                    </CardTitle>
                    <span className="font-display text-lg text-primary">
                      {b.price}
                    </span>
                  </div>
                  <CardDescription className="mt-2 leading-relaxed">
                    {b.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
