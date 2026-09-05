"use client";

import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { BurgerArt } from "@/components/ui/burger-art";

const LAYERS = [
  "Toasted brioche crown",
  "Aged cheddar, twice",
  "Two 3oz smash patties",
  "Ember onions",
  "House pickles",
  "Ash sauce",
];

export function HeroScroll() {
  return (
    <section className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              The signature
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Six layers, no shortcuts <br />
              <span className="mt-1 block text-4xl font-bold leading-none md:text-[6rem]">
                The Ember Stack
              </span>
            </h2>
          </>
        }
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-black">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 120%, rgba(255,106,26,0.45), transparent 60%)",
            }}
            aria-hidden="true"
          />
          <BurgerArt className="relative max-h-[70%] drop-shadow-2xl" seed={1} />

          <ul className="absolute left-4 top-4 hidden space-y-1.5 md:block">
            {LAYERS.map((l) => (
              <li
                key={l}
                className="flex items-center gap-2 text-xs text-zinc-400"
              >
                <span
                  className="h-1 w-1 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {l}
              </li>
            ))}
          </ul>

          <div className="absolute bottom-4 right-4 text-right">
            <p className="font-display text-3xl text-white">$17</p>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Add bacon $3
            </p>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}
