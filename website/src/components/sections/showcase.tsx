"use client";

import dynamic from "next/dynamic";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const BurgerStage = dynamic(
  () => import("@/components/three/burger-stage").then((m) => m.BurgerStage),
  { ssr: false, loading: () => null },
);

/**
 * The supplied ContainerScroll component, holding the live 3D burger rather
 * than a flat screenshot — the card tilts back on scroll while the model
 * inside it keeps turning.
 */
export function Showcase() {
  return (
    <section className="flex flex-col overflow-hidden bg-cream">
      <ContainerScroll
        titleComponent={
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              The signature
            </p>
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
              Seventeen dollars,
              <br />
              <span className="mt-1 block text-4xl font-bold leading-none md:text-[6rem]">
                The Ember Stack
              </span>
            </h2>
          </>
        }
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-black">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% 105%, rgba(255,120,40,0.28), transparent 70%)",
            }}
            aria-hidden="true"
          />
          <BurgerStage className="h-full w-full" spin={0.4} />
          <p className="pointer-events-none absolute bottom-3 right-4 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Drag to turn
          </p>
        </div>
      </ContainerScroll>
    </section>
  );
}
