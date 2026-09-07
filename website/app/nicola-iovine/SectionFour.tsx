'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import { MoveRight } from 'lucide-react';
import { PANELS, COLUMNS, SERVICES, ROW_MEDIA, TITLE, LIST_TITLE } from './treatments';
import styles from './section-four.module.css';

/* One composition, one screen. The photographs are a backdrop that changes on
   its own clock, not on the scroll position; scroll only brings the section's
   content in, once. */

const HOLD = 4.5;   // seconds a photograph is held
const FADE = 1.15;  // seconds of crossfade between them

export default function SectionFour() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>(`.${styles.layer}`);
      const imgs = gsap.utils.toArray<HTMLElement>(`.${styles.layer} img`);
      const chars = gsap.utils.toArray<HTMLElement>(`.${styles.ch}`);

      /* ---- entrance ------------------------------------------------- */
      gsap.set(chars, { yPercent: 118, x: 14 });
      gsap.set([`.${styles.eyebrow}`, `.${styles.listLabel}`], { opacity: 0, y: 10 });
      gsap.set(`.${styles.row}`, { opacity: 0, y: 12 });
      gsap.set(`.${styles.rule}`, { scaleX: 0 });

      const show = () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(`.${styles.eyebrow}`, { opacity: 1, y: 0, duration: 0.9 }, 0)
          .to(chars, {
            yPercent: 0, x: 0, duration: 1.25, stagger: 0.045,
          }, 0.15)
          .to(`.${styles.rule}`, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.75)
          .to(`.${styles.listLabel}`, { opacity: 1, y: 0, duration: 0.8 }, 0.95)
          /* The list arrives as one quiet block, not fourteen separate events —
             it is the section's footnote, not its headline. */
          .to(`.${styles.row}`, {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.028,
            /* Hand the transform back to CSS when the row lands. GSAP leaves
               an inline translate behind, and an inline transform beats the
               :hover rule — the panel's 1px lift silently did nothing until
               this was added. */
            clearProps: 'transform',
          }, 1.1);
        return tl;
      };

      if (reduced) {
        gsap.set(chars, { yPercent: 0, x: 0 });
        gsap.set([`.${styles.eyebrow}`, `.${styles.listLabel}`, `.${styles.row}`],
          { opacity: 1, y: 0 });
        gsap.set(`.${styles.rule}`, { scaleX: 1 });
        /* One stable photograph, no cycle. */
        gsap.set(layers[0], { opacity: 1 });
        gsap.set(layers.slice(1), { opacity: 0 });
        return;
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 78%',
        once: true,
        onEnter: show,
      });

      /* ---- the backdrop cycle ---------------------------------------
         Stacked with ascending z-index, so a layer is revealed by the one
         above it fading out and covered by the one above it fading in. That
         is what makes 3 -> 1 a crossfade like every other handover instead of
         a reset: layer 2 sits on top, layer 1 is hidden underneath it, and
         fading layer 2 out uncovers layer 0 exactly where it started. */
      const CYCLE = HOLD + FADE;
      gsap.set(layers[0], { opacity: 1 });
      gsap.set([layers[1], layers[2]], { opacity: 0 });

      const cycle = gsap.timeline({ repeat: -1, paused: true });
      cycle
        .to(layers[1], { opacity: 1, duration: FADE, ease: 'power1.inOut' }, HOLD)
        .to(layers[2], { opacity: 1, duration: FADE, ease: 'power1.inOut' }, HOLD + CYCLE)
        /* hidden under the fully opaque layer 2, so this is invisible */
        .set(layers[1], { opacity: 0 }, HOLD + CYCLE + FADE)
        .to(layers[2], { opacity: 0, duration: FADE, ease: 'power1.inOut' }, HOLD + 2 * CYCLE);

      /* Each photograph breathes only while it is the one being looked at,
         and is reset while it is covered. */
      imgs.forEach((img, i) => {
        const from = i * CYCLE;
        cycle.fromTo(img,
          { scale: 1, xPercent: 0 },
          { scale: 1.03, xPercent: i % 2 ? -0.8 : 0.8,
            duration: CYCLE + FADE, ease: 'none' }, from)
          .set(img, { scale: 1, xPercent: 0 }, from + CYCLE + FADE);
      });

      /* Only run while the section is actually on screen. */
      const io = new IntersectionObserver(
        ([e]) => (e.isIntersecting ? cycle.play() : cycle.pause()),
        { rootMargin: '10% 0px' },
      );
      io.observe(root.current!);

      return () => { io.disconnect(); cycle.kill(); };
    }, root);

    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <section className={styles.four} ref={root} aria-label="Trattamenti">
      <div className={styles.bg} aria-hidden="true">
        {PANELS.map((p, i) => (
          <div className={styles.layer} key={p.src} style={{ zIndex: i + 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/ni/campaign/${p.src}.webp`}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              style={{ '--pos': p.pos, '--posM': p.posMobile } as React.CSSProperties}
            />
          </div>
        ))}
      </div>

      {/* Not one flat scrim. A vignette to seat the photograph in the page, a
          bottom ramp to carry the list, and a left ramp to carry the title —
          so the type is legible over all three photographs without any of them
          being dimmed into monochrome. */}
      <div className={styles.veil} aria-hidden="true" />

      <div className={styles.content}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>03 — Campagna</span>
          <h2 className={styles.title} aria-label={TITLE}>
            {TITLE.split('').map((c, i) => (
              <span className={styles.mask} key={i} aria-hidden="true">
                <span className={styles.ch}>{c}</span>
              </span>
            ))}
          </h2>
          <span className={styles.rule} aria-hidden="true" />
        </header>

        <div className={styles.listBlock}>
          <h3 className={styles.listLabel}>{LIST_TITLE}</h3>
          <div className={styles.cols}>
            {COLUMNS.map((col, ci) => (
              <ul className={styles.col} key={ci}>
                {col.map((s) => {
                  const media = ROW_MEDIA[SERVICES.indexOf(s)];
                  return (
                  <li className={styles.row} key={s.name}>
                    {/* The cinematic reveal, kept inside the panel's own bounds:
                        the photograph fades up behind the type and un-zooms,
                        under a gradient that holds the left edge dark enough to
                        read. No height change, so nothing below it reflows. */}
                    <span className={styles.rowMedia} aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/ni/campaign/${media.src}.webp`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: media.pos }}
                      />
                      <span className={styles.rowVeil} />
                    </span>
                    <span className={styles.name}>{s.name}</span>
                    <span className={styles.price}>
                      {s.note && <em className={styles.note}>{s.note} </em>}
                      {s.price === 'info in salone' ? (
                        <em className={styles.note}>{s.price}</em>
                      ) : (
                        <>
                          <span className={styles.cur}>€</span>
                          {s.price}
                        </>
                      )}
                    </span>
                    <span className={styles.arrow} aria-hidden="true">
                      <MoveRight />
                    </span>
                  </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
