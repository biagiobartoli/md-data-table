'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';
import { WORKS, WORKS_MOBILE, BACKGROUND, TITLE_LINES, KICKER } from './works';
import styles from './section-five.module.css';
import GalleryCursor from './GalleryCursor';

/* Deliberately not SALONE's machinery. That section runs a magnetic cursor
   field over the whole stage and scrubs its plates in as you scroll through
   it; this one has no field, and its spread is already hanging when you
   arrive. Related language, different mechanism.

   What the two DO share is the expansion, and share it exactly: a plate that
   opens on a click, fills 82% of the viewport, and returns precisely to where
   it was. Two galleries on one page that open a picture two different ways
   would read as two different sites. So the geometry below is SALONE's, down
   to which rect is measured for what — see the comment in open(). */
const EXPAND_FILL = 0.82; // share of the viewport an expanded plate targets

export default function SectionFive() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  /* Interaction state lives in refs as well as state: the pointer handlers run
     every frame and must never read a value React has not re-rendered yet. */
  const activeRef = useRef<number | null>(null);
  const expandedRef = useRef<number | null>(null);
  const api = useRef<{ open(i: number): void; close(): void } | null>(null);
  const paintRef = useRef<((a: number | null) => void) | null>(null);

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

      /* ---- expansion ------------------------------------------------
         Defined before the desktop-only branch below, because a plate opens on
         a touch device too — it is the pointer *tilt* that is desktop-only. */
      const open = (i: number) => {
        if (expandedRef.current !== null) return;
        const card = cards[i];
        const plate = card.closest(`.${styles.plate}`) as HTMLElement;
        /* Two different rects, for two different jobs — and getting this wrong
           is what put SALONE's first expansion at 75% of the viewport when it
           had been asked for 82%.
           The translation comes from the card's *live* rect, so the move starts
           exactly where the plate currently sits, hover scale and tilt and all.
           The scale comes from the plate's own untransformed box, because that
           is the only measurement not already multiplied by the hover transform
           and by translateZ's perspective magnification. */
        const r = card.getBoundingClientRect();
        const base = plate.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight;
        const grow = Math.min((vw * EXPAND_FILL) / base.width, (vh * EXPAND_FILL) / base.height);

        expandedRef.current = i;
        setExpanded(i);
        paint(i);          // everything else recedes behind the scrim
        lockScroll();
        plate.style.zIndex = '60';
        card.classList.add(styles.isExpanded);

        gsap.to(card, {
          x: `+=${vw / 2 - (r.left + r.width / 2)}`,
          y: `+=${vh / 2 - (r.top + r.height / 2)}`,
          scale: grow,
          rotate: 0, rotateX: 0, rotateY: 0, z: 0,
          duration: 1.05, ease: 'power3.inOut', overwrite: 'auto',
        });
      };

      const close = () => {
        const i = expandedRef.current;
        if (i === null) return;
        const card = cards[i];
        expandedRef.current = null;
        setExpanded(null);
        unlockScroll();
        card.classList.remove(styles.isExpanded);
        gsap.to(card, {
          x: 0, y: 0, scale: 1, rotate: rots[i], rotateX: 0, rotateY: 0, z: 0,
          duration: 0.95, ease: 'power3.inOut', overwrite: 'auto',
          onComplete: () => {
            (card.closest(`.${styles.plate}`) as HTMLElement).style.zIndex = '';
            paint(null);
          },
        });
      };

      api.current = { open, close };
      paintRef.current = paint;

      if (!fine) return;

      /* ---- the plate answers its own pointer -------------------------
         One listener per plate, and the only per-frame read is the plate's own
         rect, cached on enter. No page-level field, no ticker. */
      const quickX = cards.map((c) => gsap.quickTo(c, 'rotateY', { duration: 0.5, ease: 'power3' }));
      const quickY = cards.map((c) => gsap.quickTo(c, 'rotateX', { duration: 0.5, ease: 'power3' }));
      const cleanup: Array<() => void> = [];

      cards.forEach((card, i) => {
        let box: DOMRect | null = null;
        const enter = () => {
          if (expandedRef.current !== null) return;
          box = card.getBoundingClientRect();
          activeRef.current = i;
          paint(i);
        };
        const move = (e: PointerEvent) => {
          /* An expanded plate is under the pointer by definition — it fills the
             screen — and tilting it while it is open would fight the
             expansion's own transform. */
          if (!box || expandedRef.current !== null) return;
          const dx = (e.clientX - box.left) / box.width - 0.5;
          const dy = (e.clientY - box.top) / box.height - 0.5;
          /* Five degrees at the corner. Enough to catch the light. */
          quickX[i](dx * 5);
          quickY[i](-dy * 5);
        };
        const leave = () => {
          box = null;
          if (expandedRef.current !== null) return;
          activeRef.current = null;
          paint(null);
        };
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
          /* The expanded plate's transform belongs to open(); painting it here
             would drag it back out of the centre of the screen. Its neighbours
             still recede, which is what the scrim sits on top of. */
          if (i === expandedRef.current) {
            c.classList.toggle(styles.isOn, true);
            c.classList.toggle(styles.isOff, false);
            return;
          }
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

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') api.current?.close(); };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      /* Unmounting mid-expansion would otherwise leave the page unable to
         scroll, with nothing left on screen to explain why. */
      if (expandedRef.current !== null) unlockScroll();
      expandedRef.current = null;
      activeRef.current = null;
      api.current = null;
      paintRef.current = null;
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  /* One handler for both input models, and the same two-step SALONE uses. On a
     pointer device the plate is already active by the time it is clicked, so a
     click expands it. On touch there is no hover, so the first tap brings the
     plate forward and the second opens it — the same two beats, just made
     explicit because the device cannot imply the first one. */
  const onPlateClick = (i: number) => {
    if (expandedRef.current !== null) { api.current?.close(); return; }
    const coarse = window.matchMedia('(hover: none)').matches;
    if (coarse && activeRef.current !== i) {
      activeRef.current = i;
      paintRef.current?.(i);
      return;
    }
    api.current?.open(i);
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

      <div
        className={`${styles.scrim} ${expanded !== null ? styles.scrimOn : ''}`}
        aria-hidden="true"
        onClick={() => api.current?.close()}
      />

      <header className={styles.head}>
        <span className={styles.eyebrow}>05 — Lavori</span>
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

      {/* Lifted over the scrim while a plate is expanded — see .stageLifted. */}
      <div
        className={`${styles.stage} ${expanded !== null ? styles.stageLifted : ''}`}
        ref={stage}
      >
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
                  aria-expanded={expanded === i}
                  onClick={() => onPlateClick(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/ni/works/${w.src}.webp`} alt="" loading="lazy" decoding="async" />
                  <span className={styles.label}>{w.label}</span>
                </button>
              </div>
            </figure>
          );
        })}
        {/* D. These plates open now, so the ring carries the same word SALONE's
            does — the two galleries behave identically, so they should say the
            same thing. Unmounted while a plate is open, which hands the native
            cursor back: .scrim sets zoom-out there, which is what a click now
            does. */}
        {expanded === null && <GalleryCursor label="Apri" />}
      </div>
    </section>
  );
}
