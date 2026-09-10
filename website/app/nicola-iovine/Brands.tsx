'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import { BRANDS, TITLE_LINES, type Brand } from './brands';
import styles from './brands.module.css';

/* Named for what it is rather than for its position. The sections either side
   are called SectionFive and SectionSix because they were built in that order;
   inserting a SectionSevenThatComesBeforeSix would have been worse than
   breaking the run. Its index label — 06 — is in the markup, where the other
   five are. */

export default function Brands() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>(`.${styles.ch}`);
      const halves = gsap.utils.toArray<HTMLElement>(`.${styles.half}`);
      const marks = gsap.utils.toArray<HTMLElement>(`.${styles.markIn}`);

      /* ---- start states ---------------------------------------------- */
      gsap.set(chars, { yPercent: 116 });
      gsap.set(`.${styles.rule}`, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(halves, { opacity: 0, y: 26 });
      /* The marks start slightly small as well as low. Not a bounce and not a
         zoom — 0.96 to 1 over a second reads as settling into focus, which is
         the one thing a logo is allowed to do. */
      gsap.set(marks, { opacity: 0, y: 16, scale: 0.96 });

      if (reduced) {
        gsap.set(chars, { yPercent: 0 });
        gsap.set(`.${styles.rule}`, { scaleX: 1 });
        gsap.set(halves, { opacity: 1, y: 0 });
        gsap.set(marks, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      /* ---- entrance, once --------------------------------------------
         Three beats in the order the brief asked for: the title, then the
         halves and the line that divides them, then the marks. They overlap
         rather than queue — each starts while the one before is still easing
         out, which is what keeps a three-part entrance from feeling like a
         list being read aloud. */
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 76%',
        once: true,
        onEnter: () => {
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(chars, { yPercent: 0, duration: 1.2, stagger: 0.035 }, 0)
            .to(`.${styles.rule}`, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 0.55)
            /* Drawn from the centre out, so the two halves are divided rather
               than arriving already separate. */
            .to(`.${styles.divider}`, {
              scaleY: 1, scaleX: 1, duration: 1.1, ease: 'power2.inOut',
            }, 0.72)
            .to(halves, {
              opacity: 1, y: 0, duration: 1.1, stagger: 0.12,
              /* Hand the transform back to CSS: an inline transform left by
                 GSAP beats the :hover rule, which is how section four's panel
                 lift silently stopped working. */
              clearProps: 'transform',
            }, 0.78)
            .to(marks, {
              opacity: 1, y: 0, scale: 1, duration: 1.25, stagger: 0.14,
              clearProps: 'transform',
            }, 1.05);
        },
      });
    }, root);

    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <section
      className={styles.brands}
      id="prodotti"
      ref={root}
      aria-label="I prodotti con cui lavoriamo"
    >
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>06 — Prodotti</span>
          <h2 className={styles.title} aria-label={TITLE_LINES.join(' ')}>
            {TITLE_LINES.map((line, li) => (
              <span
                className={li === 1 ? `${styles.line} ${styles.lineTwo}` : styles.line}
                key={line}
              >
                {line.split('').map((c, i) => (
                  <span className={styles.mask} key={i} aria-hidden="true">
                    <span className={styles.ch}>{c === ' ' ? ' ' : c}</span>
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <span className={styles.rule} aria-hidden="true" />
        </header>

        {/* A list, because that is what it is: the houses this salon works
            with. The hairline between them is a grid track and not a border,
            so it belongs to neither half and cannot move with one. */}
        <ul className={styles.split}>
          <li className={styles.half}><Mark brand={BRANDS[0]} /></li>
          <li className={styles.divider} aria-hidden="true" />
          <li className={styles.half}><Mark brand={BRANDS[1]} /></li>
        </ul>
      </div>
    </section>
  );
}

function Mark({ brand }: { brand: Brand }) {
  /* Falls back to the name if the file is missing or fails to decode. That is
     not only for today, while the marks have not been supplied: a 404 on a
     third-party logo would otherwise leave an empty half with a broken-image
     glyph in the middle of it, which is the worst thing this section could
     show. Same guard the hero puts on the NI lockup. */
  const [broken, setBroken] = useState(false);
  const showImage = !!brand.logo && !broken;

  return (
    <span
      className={styles.mark}
      style={{ '--markW': brand.width } as React.CSSProperties}
    >
      <span className={styles.markIn}>
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={brand.logo!}
            alt={brand.alt}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className={styles.wordmark}>{brand.name}</span>
        )}
      </span>
    </span>
  );
}
