const QA = [
  [
    "Do you take reservations?",
    "For tables of four or more, up to six o'clock. After that the room is walk-in only — the bar and the counter turn quickly.",
  ],
  [
    "How long is pickup?",
    "About fifteen minutes from the time we take the order. We do not start the patty until you call, which is why it is fifteen and not five.",
  ],
  [
    "Can I get a burger cooked well done?",
    "Yes, and we will cook it properly. The default is medium, because that is where a 45-day dry-aged patty tastes like itself.",
  ],
  [
    "Is there anything for vegetarians?",
    "The Garden Char — grilled maitake and black bean, cooked on a separate section of the grill.",
  ],
];

export function Faq() {
  return (
    <section className="bg-cream py-20 text-ink md:py-28">
      <div className="container grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Before you come
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
            The questions we
            <br />
            actually get asked
          </h2>
        </div>
        <dl className="flex flex-col">
          {QA.map(([q, a]) => (
            <div key={q} className="border-t border-line py-6 last:border-b">
              <dt className="font-display text-lg md:text-xl">{q}</dt>
              <dd className="mt-2 max-w-[60ch] leading-relaxed text-ink/65">
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
