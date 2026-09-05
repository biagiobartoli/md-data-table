const QUOTES = [
  {
    source: "Eater NY",
    line: "The crust on that patty is the best argument for charcoal in the borough.",
  },
  {
    source: "The Infatuation",
    line: "Six burgers, no filler. The restraint is the point.",
  },
  {
    source: "Bon Appétit",
    line: "A bun worth the trip on its own.",
  },
];

export function Press() {
  return (
    <section className="border-y border-line bg-cream py-16 text-ink md:py-20">
      <div className="container grid gap-10 md:grid-cols-3 md:gap-8">
        {QUOTES.map((q) => (
          <figure key={q.source} className="flex flex-col gap-4">
            <blockquote className="font-display text-lg leading-snug md:text-xl">
              &ldquo;{q.line}&rdquo;
            </blockquote>
            <figcaption className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
              {q.source}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
