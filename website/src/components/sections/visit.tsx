import { Clock, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";

const HOURS = [
  ["Mon – Thu", "11:30am – 10pm"],
  ["Fri – Sat", "11:30am – 12am"],
  ["Sunday", "12pm – 9pm"],
];

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-20 py-20 md:py-28">
      <div className="container">
        <Card className="grain relative overflow-hidden border-border/60 bg-card p-8 md:p-14">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
            aria-hidden="true"
          />
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Visit
              </p>
              <h2 className="font-display text-3xl font-bold leading-tight text-balance md:text-5xl">
                Come hungry.
                <br />
                Walk-ins after six.
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                Walk-ins for the bar and counter. Tables of four or more can
                book ahead. Pickup orders are ready in about fifteen minutes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:+17185550142"
                  className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call to order
                </a>
                <a
                  href="#menu"
                  className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border border-border px-7 text-sm font-semibold transition-colors duration-200 hover:bg-white/5"
                >
                  View menu
                </a>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <MapPin
                  className="mt-1 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold">Find us</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    214 Wythe Avenue
                    <br />
                    Williamsburg, Brooklyn, NY 11249
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock
                  className="mt-1 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div className="w-full">
                  <h3 className="font-semibold">Hours</h3>
                  <dl className="mt-2 space-y-1.5">
                    {HOURS.map(([d, h]) => (
                      <div
                        key={d}
                        className="flex justify-between gap-6 border-b border-border/50 pb-1.5 text-sm"
                      >
                        <dt className="text-muted-foreground">{d}</dt>
                        <dd className="tabular-nums">{h}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
