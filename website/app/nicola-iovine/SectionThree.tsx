'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';
import { PLATES, PLATES_MOBILE, TITLE, type Plate } from './gallery';
import styles from './section-three.module.css';

/* Each plate is four nested boxes rather than one, because four different
   things want to move it and they must not fight over one transform:

     .plate   layout only — left/top/width. Never transformed, so it stays a
              reliable origin to measure the expansion against.
     .entry   the scroll entrance (scrub).
     .magnet  the magnetic drift toward the cursor.
     .card    hover state, cursor tilt, and the expansion.

   All four are composited transforms, so the cost is the same as one. */

/* The cursor can only reach a plate's centre by being on top of it, so the
   field has to be pitched well above the drift you actually want: 16 at the
   centre lands at ~8px by the time the cursor is at the plate's edge, which is
   where the effect is actually read. Clamped so being over the plate cannot
   push it past the 10px ceiling. */
const MAX_PULL = 16;
const PULL_CAP = 10;
const TITLE_DRIFT = 16;  // px SALONE counter-moves, to open depth behind the plates
const EXPAND_FILL = 0.82; // share of the viewport an expanded plate targets

type Cache = { cx: number; cy: number; r: number };

export default function SectionThree() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  /* Interaction state lives in refs, not state: hover and cursor updates run
     every frame and must never queue a React render. */
  const active = useRef<number | null>(null);
  const expandedRef = useRef<number | null>(null);
  const api = useRef<{ open(i: number): void; close(): void } | null>(null);
  const paintRef = useRef<((a: number | null) => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const desktop = window.matchMedia('(min-width: 861px) and (hover: hover)').matches;
    const stageEl = stage.current!;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`);
      const magnets = gsap.utils.toArray<HTMLElement>(`.${styles.magnet}`);
      const entries = gsap.utils.toArray<HTMLElement>(`.${styles.entry}`);
      const plates = gsap.utils.toArray<HTMLElement>(`.${styles.plate}`);
      const chars = gsap.utils.toArray<HTMLElement>(`.${styles.ch}`);
      const rots = plates.map((p) => +p.dataset.rot!);
      const depths = plates.map((p) => +p.dataset.depth!);

      /* ---------- resting state -------------------------------------- */
      cards.forEach((c, i) => gsap.set(c, { rotate: rots[i], transformPerspective: 900 }));

      /* ================================================================
         1. SALONE — letters converge
         Each letter starts pushed out from the word's centre with its own
         depth and tilt, and scrubs into a single composed word. The spacing
         is animated as x per letter rather than letter-spacing so it stays a
         transform, and so each letter can carry its own z and rotation.
         ================================================================ */
      const mid = (chars.length - 1) / 2;
      chars.forEach((ch, i) => {
        const d = i - mid;                      // -2.5 .. 2.5 for SALONE
        gsap.set(ch, {
          x: d * (desktop ? 92 : 34),
          y: (i % 2 ? 1 : -1) * (desktop ? 26 : 12) * (1 - Math.abs(d) / (mid + 1)),
          z: -140 + (i % 3) * 70,
          rotateY: d * -5,
          rotateZ: d * 1.1,
          opacity: 0.15 + 0.12 * (1 - Math.abs(d) / (mid + 1)),
        });
      });

      if (reduced) {
        /* No scrub, no cursor: the composition simply exists. */
        gsap.set(chars, { x: 0, y: 0, z: 0, rotateY: 0, rotateZ: 0, opacity: 0.4 });
        gsap.set(entries, { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top 82%',
          end: 'top 2%',
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      });

      chars.forEach((ch, i) => {
        const d = i - mid;
        tl.to(ch, {
          x: 0, y: 0, z: 0, rotateY: 0, rotateZ: 0, opacity: 0.4,
          duration: 60, ease: 'power2.inOut',
          /* outer letters travel furthest, so they start first and all land
             together — the word closes rather than snapping shut */
        }, 8 - Math.abs(d) * 1.6);
      });

      /* ================================================================
         2. Plates — suspended prints settling into the composition
         ================================================================ */
      entries.forEach((el, i) => {
        const p = plates[i];
        const from = p.dataset.from as Plate['from'];
        const dz = 0.6 + depths[i] * 0.7;
        const start =
          from === 'lower-left'  ? { x: -150 * dz, y: 190 * dz, scale: 0.9,  rotate:  6 * dz }
          : from === 'upper-right' ? { x:  165 * dz, y: -140 * dz, scale: 0.92, rotate: -5 * dz }
          : /* distance */          { x:  0,        y:   40 * dz, scale: 0.66, rotate:  2 * dz };
        gsap.set(el, { ...start, opacity: 0 });

        /* Two moves, not one: the plate arrives and hangs slightly past its
           mark, then settles back into it. That hesitation is what reads as
           a physical print being placed rather than an element animating in. */
        tl.to(el, { opacity: 1, duration: 22, ease: 'power1.out' }, 30 + i * 5)
          .to(el, {
            x: 0, y: 0, scale: 1.018, rotate: 0,
            duration: 62, ease: 'power3.out',
          }, 30 + i * 5)
          .to(el, { scale: 1, duration: 30, ease: 'power2.inOut' }, 92 + i * 5);
      });

      if (!desktop) return;

      /* ================================================================
         3. Cursor field — magnetism, tilt, and the recede
         One pointermove listener writes coordinates; one ticker callback does
         the work, so the cost is fixed per frame instead of per event. Plate
         centres are cached and only recomputed on resize or refresh — the
         only per-frame layout read is the stage's own rect.
         ================================================================ */
      let cache: Cache[] = [];
      const measure = () => {
        const s = stageEl.getBoundingClientRect();
        cache = plates.map((p) => {
          const r = p.getBoundingClientRect();
          return {
            cx: r.left - s.left + r.width / 2,
            cy: r.top - s.top + r.height / 2,
            r: Math.hypot(r.width, r.height) / 2 + 110,
          };
        });
      };
      measure();
      ScrollTrigger.addEventListener('refreshInit', measure);
      window.addEventListener('resize', measure);

      const toX = magnets.map((m) => gsap.quickTo(m, 'x', { duration: 0.7, ease: 'power3' }));
      const toY = magnets.map((m) => gsap.quickTo(m, 'y', { duration: 0.7, ease: 'power3' }));
      const tiltX = cards.map((c) => gsap.quickTo(c, 'rotateX', { duration: 0.6, ease: 'power3' }));
      const tiltY = cards.map((c) => gsap.quickTo(c, 'rotateY', { duration: 0.6, ease: 'power3' }));
      const titleX = gsap.quickTo(title.current!, 'x', { duration: 1.1, ease: 'power3' });
      const titleY = gsap.quickTo(title.current!, 'y', { duration: 1.1, ease: 'power3' });

      let px = 0, py = 0, inside = false, dirty = false;
      const onMove = (e: PointerEvent) => {
        const s = stageEl.getBoundingClientRect();
        px = e.clientX - s.left; py = e.clientY - s.top;
        inside = true; dirty = true;
      };
      const onLeave = () => { inside = false; dirty = true; };

      const frame = () => {
        if (!dirty) return;
        dirty = inside;                 // keep updating while the cursor moves
        if (expandedRef.current !== null) return;

        for (let i = 0; i < cache.length; i++) {
          const c = cache[i];
          if (!inside) { toX[i](0); toY[i](0); continue; }
          const dx = px - c.cx, dy = py - c.cy;
          const d = Math.hypot(dx, dy);
          /* Falls off to nothing at the edge of the field, so plates never
             twitch when the cursor is nowhere near them. */
          const pull = d > c.r
            ? 0
            : Math.min(PULL_CAP, (1 - d / c.r) * MAX_PULL * (0.55 + 0.45 * depths[i]));
          toX[i]((dx / (d || 1)) * pull);
          toY[i]((dy / (d || 1)) * pull);
        }

        const a = active.current;
        if (a !== null && inside) {
          /* Tilt is read from the cursor's offset within the active plate,
             and deliberately tiny — enough to catch the light, not to swivel. */
          const c = cache[a];
          tiltY[a](gsap.utils.clamp(-6, 6, ((px - c.cx) / c.r) * 9));
          tiltX[a](gsap.utils.clamp(-6, 6, ((c.cy - py) / c.r) * 9));
        }

        /* SALONE counter-moves: the type slides against the cursor while the
           plates slide with it, which is what opens the space between them. */
        const s = stageEl.getBoundingClientRect();
        titleX(inside ? -((px / s.width) - 0.5) * 2 * TITLE_DRIFT : 0);
        titleY(inside ? -((py / s.height) - 0.5) * 2 * (TITLE_DRIFT * 0.45) : 0);
      };

      stageEl.addEventListener('pointermove', onMove);
      stageEl.addEventListener('pointerleave', onLeave);
      gsap.ticker.add(frame);

      return () => {
        gsap.ticker.remove(frame);
        stageEl.removeEventListener('pointermove', onMove);
        stageEl.removeEventListener('pointerleave', onLeave);
        ScrollTrigger.removeEventListener('refreshInit', measure);
        window.removeEventListener('resize', measure);
      };
    }, root);

    /* ==================================================================
       4. Hover / activation and the expansion, wired through a ref so the
       JSX handlers stay plain and nothing re-renders on pointer motion.
       ================================================================== */
    const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, root.current!);
    const platesEl = gsap.utils.toArray<HTMLElement>(`.${styles.plate}`, root.current!);
    const rots = platesEl.map((p) => +p.dataset.rot!);

    const paint = (a: number | null) => {
      active.current = a;
      cards.forEach((c, i) => {
        const on = i === a;
        const q = expandedRef.current === i;
        if (q) return;
        gsap.to(c, {
          /* 1.06 scale plus 70px of z reads as ~1.15 on screen: at this
             perspective, translateZ magnifies by 900/(900-70). Setting 1.12
             here as well put the plate at 1.22, past what the brief asked for. */
          scale: on ? 1.06 : a === null ? 1 : 0.968,
          rotate: on ? 0 : rots[i],
          z: on ? 70 : a === null ? 0 : -40,
          rotateX: on ? undefined : 0,
          rotateY: on ? undefined : 0,
          duration: 0.72,
          ease: 'power3.out',
          overwrite: 'auto',
        });
        c.classList.toggle(styles.isActive, on);
        c.classList.toggle(styles.isRecessed, a !== null && !on);
        /* Stacking has to be an immediate write: an animated z-index would
           let the rising plate pass *behind* its neighbours on the way up. */
        (c.closest(`.${styles.plate}`) as HTMLElement).style.zIndex = on ? '40' : '';
      });
    };

    const open = (i: number) => {
      if (expandedRef.current !== null) return;
      const card = cards[i];
      const plate = card.closest(`.${styles.plate}`) as HTMLElement;
      /* Two different rects, for two different jobs.
         The translation comes from the card's *live* rect, so the move starts
         exactly where the plate currently sits — hover scale, magnetic drift
         and all — which is what makes it feel physically connected.
         The scale comes from the plate's own untransformed box, because that
         is the only measurement that is not already multiplied by the hover
         transform and by translateZ's perspective magnification. Deriving it
         from the live rect landed the plate at 75% of the viewport when it
         had been asked for 82%. */
      const r = card.getBoundingClientRect();
      const base = plate.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const grow = Math.min((vw * EXPAND_FILL) / base.width, (vh * EXPAND_FILL) / base.height);

      expandedRef.current = i;
      setExpanded(i);
      paint(i);          // everything else recedes behind the scrim
      lockScroll();
      plate.style.zIndex = '60';

      gsap.to(card, {
        x: `+=${vw / 2 - (r.left + r.width / 2)}`,
        y: `+=${vh / 2 - (r.top + r.height / 2)}`,
        scale: grow,
        rotate: 0, rotateX: 0, rotateY: 0, z: 0,
        duration: prefersReducedMotion() ? 0.2 : 1.05,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
    };

    const close = () => {
      const i = expandedRef.current;
      if (i === null) return;
      const card = cards[i];
      expandedRef.current = null;
      setExpanded(null);
      unlockScroll();
      gsap.to(card, {
        x: 0, y: 0, scale: 1, rotate: rots[i], rotateX: 0, rotateY: 0, z: 0,
        duration: prefersReducedMotion() ? 0.2 : 0.95,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onComplete: () => {
          (card.closest(`.${styles.plate}`) as HTMLElement).style.zIndex = '';
          paint(null);
        },
      });
    };

    api.current = { open, close };
    paintRef.current = paint;

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      if (expandedRef.current !== null) unlockScroll();
      expandedRef.current = null;
      api.current = null;
      paintRef.current = null;
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const paintFor = (i: number | null) => paintRef.current?.(i);

  /* One handler for both input models. On a pointer device the plate is
     already active by the time it is clicked, so a click expands. On touch
     there is no hover, so the first tap activates and the second expands —
     the same two-step, just made explicit. */
  const onPlateClick = (i: number) => {
    if (expandedRef.current !== null) { api.current?.close(); return; }
    const coarse = window.matchMedia('(hover: none)').matches;
    if (coarse && active.current !== i) { paintFor(i); return; }
    api.current?.open(i);
  };

  return (
    <section className={styles.three} ref={root} aria-label="Salone — galleria">
      <div
        className={`${styles.scrim} ${expanded !== null ? styles.scrimOn : ''}`}
        aria-hidden="true"
        onClick={() => api.current?.close()}
      />

      {/* The stage is lifted over the scrim while a plate is expanded. It has
          to be the stage and not the plate: .stage carries `perspective`, which
          makes it a stacking context, so a z-index on a plate inside it can
          never climb past a sibling of .stage however high it is set. */}
      <div
        className={`${styles.stage} ${expanded !== null ? styles.stageLifted : ''}`}
        ref={stage}
      >
        <h2 className={styles.title} ref={title} aria-label={TITLE}>
          {TITLE.split('').map((c, i) => (
            <span className={styles.ch} key={i} aria-hidden="true">{c}</span>
          ))}
        </h2>

        <Plates onActivate={paintFor} onClick={onPlateClick} expanded={expanded} />
      </div>
    </section>
  );
}

function Plates({
  onActivate, onClick, expanded,
}: {
  onActivate: (i: number | null) => void;
  onClick: (i: number) => void;
  expanded: number | null;
}) {
  return (
    <>
      {PLATES.map((p, i) => {
        const m = PLATES_MOBILE[i];
        return (
          <figure
            key={p.src}
            className={styles.plate}
            data-rot={p.rot}
            data-depth={p.depth}
            data-from={p.from}
            style={{
              '--x': `${p.x}%`, '--y': `${p.y}%`, '--w': `${p.w}%`, '--ratio': p.ratio,
              '--mx': `${m.x}%`, '--my': `${m.y}%`, '--mw': `${m.w}%`, '--mratio': m.ratio,
            } as React.CSSProperties}
          >
            <div className={styles.entry}>
              <div className={styles.magnet}>
                <button
                  type="button"
                  className={styles.card}
                  onPointerEnter={(e) => { if (e.pointerType === 'mouse') onActivate(i); }}
                  onPointerLeave={(e) => { if (e.pointerType === 'mouse') onActivate(null); }}
                  /* Keyboard focus activates; a tap must not. A tap focuses
                     the button too, and treating that as activation collapsed
                     the mobile two-step — the first tap expanded straight
                     away because the plate was already "active" by the time
                     the click handler ran. */
                  onFocus={(e) => { if (e.target.matches(':focus-visible')) onActivate(i); }}
                  onBlur={() => onActivate(null)}
                  onClick={() => onClick(i)}
                  aria-expanded={expanded === i}
                  aria-label={p.alt}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/ni/gallery/${p.src}.webp`} alt="" loading="lazy" decoding="async" />
                </button>
              </div>
            </div>
          </figure>
        );
      })}
    </>
  );
}
