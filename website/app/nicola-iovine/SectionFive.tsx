'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import { WORKS, WORKS_MOBILE, BACKGROUND, TITLE_LINES, KICKER } from './works';
import styles from './section-five.module.css';

/* Deliberately not SALONE's machinery. That section runs a cursor field over
   the whole stage and expands a plate to the viewport; this one has no field
   and no expansion — the plate answers its own pointer and the rest of the
   spread quietens. Related language, different mechanism. */

export default function SectionFive() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const fine = window.matchMedia('(min-width: 861px) and (hover: hover)').matches;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`);
      const plates = gsap.utils.toArray<HTMLElement>(`.${styles.plate}`);
      const chars = gsap.utils.toArray<HTMLElement>(`.${styles.ch}`);
      const rots = plates.map((p) => +p.dataset.rot!);
      const depths = plates.map((p) => +p.dataset.depth!);

      cards.forEach((c, i) => gsap.set(c, { rotate: rots[i], transformPerspective: 1000 }));

      /* ---- start states ---------------------------------------------- */
      gsap.set(chars, { yPercent: 116 });
      gsap.set([`.${styles.kicker}`, `.${styles.rule}`], { opacity: 0, y: 10 });
      const entries = gsap.utils.toArray<HTMLElement>(`.${styles.entry}`);
      entries.forEach((el, i) => {
        gsap.set(el, { opacity: 0, y: 40 + depths[i] * 46, scale: 0.93 + depths[i] * 0.03 });
      });

      if (reduced) {
        gsap.set(chars, { yPercent: 0 });
        gsap.set([`.${styles.kicker}`, `.${styles.rule}`], { opacity: 1, y: 0 });
        gsap.set(entries, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      /* ---- entrance, once -------------------------------------------
         A one-shot timeline rather than a scrub. SALONE assembles as you
         scroll through it; this is a spread that is already hanging when you
         arrive at it, and it should settle rather than track the wheel. */
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 74%',
        once: true,
        onEnter: () => {
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(chars, { yPercent: 0, duration: 1.15, stagger: 0.04 }, 0)
            .to(`.${styles.rule}`, { opacity: 1, y: 0, duration: 0.9 }, 0.5)
            .to(`.${styles.kicker}`, { opacity: 1, y: 0, duration: 0.85 }, 0.62)
            /* Deepest plates land first and travel furthest, so the spread
               builds back to front and reads as depth rather than as a list. */
            .to(entries, {
              opacity: 1, y: 0, scale: 1,
              duration: 1.25, ease: 'power3.out',
              stagger: { each: 0.085, from: 'start' },
              clearProps: 'transform',
            }, 0.42);
        },
      });

      if (!fine) return;

      /* ---- the plate answers its own pointer -------------------------
         One listener per plate, and the only per-frame read is the plate's own
         rect, cached on enter. No page-level field, no ticker. */
      const quickX = cards.map((c) => gsap.quickTo(c, 'rotateY', { duration: 0.5, ease: 'power3' }));
      const quickY = cards.map((c) => gsap.quickTo(c, 'rotateX', { duration: 0.5, ease: 'power3' }));
      const cleanup: Array<() => void> = [];

      cards.forEach((card, i) => {
        let box: DOMRect | null = null;
        const enter = () => { box = card.getBoundingClientRect(); paint(i); };
        const move = (e: PointerEvent) => {
          if (!box) return;
          const dx = (e.clientX - box.left) / box.width - 0.5;
          const dy = (e.clientY - box.top) / box.height - 0.5;
          /* Five degrees at the corner. Enough to catch the light. */
          quickX[i](dx * 5);
          quickY[i](-dy * 5);
        };
        const leave = () => { box = null; paint(null); };
        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', leave);
        cleanup.push(() => {
          card.removeEventListener('pointerenter', enter);
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', leave);
        });
      });

      return () => cleanup.forEach((fn) => fn());

      function paint(a: number | null) {
        cards.forEach((c, i) => {
          const on = i === a;
          gsap.to(c, {
            scale: on ? 1.055 : a === null ? 1 : 0.972,
            rotate: on ? 0 : rots[i],
            z: on ? 60 : a === null ? 0 : -30,
            rotateX: on ? undefined : 0,
            rotateY: on ? undefined : 0,
            duration: 0.7, ease: 'power3.out', overwrite: 'auto',
          });
          c.classList.toggle(styles.isOn, on);
          c.classList.toggle(styles.isOff, a !== null && !on);
          (c.closest(`.${styles.plate}`) as HTMLElement).style.zIndex = on ? '40' : '';
        });
      }
    }, root);

    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  /* Touch: one plate active at a time, and tapping the active one lets go. */
  const onTap = (i: number, el: HTMLElement) => {
    if (window.matchMedia('(hover: hover)').matches) return;
    const all = Array.from(
      el.closest(`.${styles.stage}`)!.querySelectorAll<HTMLElement>(`.${styles.card}`),
    );
    const already = el.classList.contains(styles.isOn);
    all.forEach((c) => {
      c.classList.remove(styles.isOn, styles.isOff);
      (c.closest(`.${styles.plate}`) as HTMLElement).style.zIndex = '';
    });
    if (already) return;
    all.forEach((c) => c !== el && c.classList.add(styles.isOff));
    el.classList.add(styles.isOn);
    (el.closest(`.${styles.plate}`) as HTMLElement).style.zIndex = '40';
  };

  return (
    <section className={styles.five} id="lavori" ref={root} aria-label="I nostri lavori">
      {/* The craft, behind the results: the salon's own tools as the ground the
          portfolio is laid on. Graded down in the bake so the scrim above it
          can stay light — a heavy black layer would have cost the warm wood
          and the metal, which is the whole reason the photograph is here. */}
      <div className={styles.bg} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/ni/works/${BACKGROUND.src}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ '--bgPos': BACKGROUND.pos, '--bgPosM': BACKGROUND.posMobile } as React.CSSProperties}
        />
      </div>
      <div className={styles.atmos} aria-hidden="true" />

      <header className={styles.head}>
        <h2 className={styles.title} aria-label={TITLE_LINES.join(' ')}>
          {TITLE_LINES.map((line, li) => (
            <span className={li === 1 ? `${styles.line} ${styles.lineTwo}` : styles.line} key={li}>
              {line.split('').map((c, i) => (
                <span className={styles.mask} key={i} aria-hidden="true">
                  <span className={styles.ch}>{c === ' ' ? ' ' : c}</span>
                </span>
              ))}
            </span>
          ))}
        </h2>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.kicker}>{KICKER}</p>
      </header>

      <div className={styles.stage} ref={stage}>
        {WORKS.map((w, i) => {
          const m = WORKS_MOBILE[i];
          return (
            <figure
              className={styles.plate}
              key={w.src}
              data-rot={w.rot}
              data-depth={w.depth}
              style={{
                '--x': `${w.x}%`, '--y': `${w.y}%`, '--w': `${w.w}%`, '--ratio': w.ratio,
                '--mx': `${m.x}%`, '--my': `${m.y}%`, '--mw': `${m.w}%`, '--mratio': m.ratio,
                zIndex: 10 + Math.round(w.depth * 10),
              } as React.CSSProperties}
            >
              <div className={styles.entry}>
                <button
                  type="button"
                  className={styles.card}
                  aria-label={w.alt}
                  onClick={(e) => onTap(i, e.currentTarget)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/ni/works/${w.src}.webp`} alt="" loading="lazy" decoding="async" />
                  <span className={styles.label}>{w.label}</span>
                </button>
              </div>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
