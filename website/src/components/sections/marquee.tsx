const ITEMS = [
  "45-day dry-aged chuck",
  "Charcoal fired",
  "Brioche baked at 6am",
  "House pickles",
  "Grass-fed short rib",
  "No freezer, no exceptions",
];

export function Marquee() {
  return (
    <section
      className="relative flex overflow-hidden border-y border-border/60 bg-ash py-4"
      aria-hidden="true"
    >
      <div className="flex min-w-full shrink-0 animate-marquee items-center gap-10 pr-10">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-10 whitespace-nowrap text-sm uppercase tracking-[0.18em] text-muted-foreground"
          >
            {item}
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </section>
  );
}
