'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import styles from './chrome.module.css';

/**
 * D. The cursor for the two galleries, and only for them.
 *
 * Not a global custom cursor: the rest of the page is type and links, where the
 * system arrow and I-beam carry real information and replacing them makes the
 * page worse. Inside a gallery the arrow carries nothing — every plate does the
 * same thing — so a small ring saying what will happen is strictly more useful
 * than what it replaces.
 *
 * Scoped by construction: the ring is a child of the gallery it belongs to, it
 * only becomes visible once the pointer is inside that element, and the native
 * cursor is hidden by a rule on the same element. Leave the section and both
 * halves of that revert together.
 *
 * The scope is taken from the ring's own parentElement rather than from a ref
 * passed in. That is not a shortcut — it is the only thing that works here.
 * React attaches a host element's ref during the commit pass that runs its
 * children's layout effects first, so a ref on the gallery <div> is still null
 * while this component, one of its children, is setting itself up. Passing the
 * stage ref in looked correct, built cleanly, and did nothing at all: no
 * listeners, no hidden native cursor, a ring frozen at opacity 1 in the corner.
 *
 * @param label  what a click will do, e.g. "Apri". Omitted where a click does
 *               nothing — a ring with a verb in it is a promise, and only one
 *               of the two galleries opens anything.
 */
export default function GalleryCursor({ label }: { label?: string }) {
  const dot = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ring = dot.current;
    const el = ring?.parentElement;
    if (!el || !ring) return;

    /* Touch and coarse pointers get nothing at all: there is no cursor to
       replace, and a ring that appears where a finger last was is a smudge.
       Under reduced motion the ring would have to snap from point to point,
       which is worse than the arrow it replaced — so, also nothing. */
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (prefersReducedMotion()) return;

    el.classList.add(styles.hideNative);   // see chrome.module.css

    const ctx = gsap.context(() => {
      gsap.set(ring, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
      /* Fast enough to feel attached to the hand, slow enough to trail — if it
         tracked exactly it would just be a differently shaped arrow. */
      const toX = gsap.quickTo(ring, 'x', { duration: 0.18, ease: 'power3' });
      const toY = gsap.quickTo(ring, 'y', { duration: 0.18, ease: 'power3' });

      let shown = false;
      const show = (e: PointerEvent) => {
        if (shown) return;
        shown = true;
        // Place it before it appears, or it fades in at the last position.
        const r = el.getBoundingClientRect();
        gsap.set(ring, { x: e.clientX - r.left, y: e.clientY - r.top });
        /* overwrite, on both of these. A click that arrives in the same gesture
           that revealed the ring starts a 0.32s fade-in and then, from the
           expansion, a 0.25s fade-out — and with GSAP's default they both run,
           so the fade-IN finishes last and the ring is left fully visible over
           the scrim. The later call has to kill the earlier one. */
        gsap.to(ring, {
          autoAlpha: 1, scale: 1, duration: 0.32, ease: 'power2.out', overwrite: 'auto',
        });
      };
      const hide = () => {
        shown = false;
        gsap.to(ring, {
          autoAlpha: 0, scale: 0.6, duration: 0.25, ease: 'power2.in', overwrite: 'auto',
        });
      };
      const onMove = (e: PointerEvent) => {
        /* A move reveals the ring as well as steering it, and pointerenter is
           only an optimisation on top of that. It has to work this way: both
           galleries unmount this component while a plate is expanded, so it
           remounts with the pointer already inside the stage — and
           pointerenter cannot fire for a pointer that never left. Revealing on
           enter alone left the ring invisible after every close, until you
           moved the mouse out of the gallery and back in. */
        show(e);
        const r = el.getBoundingClientRect();
        toX(e.clientX - r.left);
        toY(e.clientY - r.top);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerenter', show);
      el.addEventListener('pointerleave', hide);
      /* A plate that opens full-screen puts the ring behind a scrim while the
         pointer is still technically inside the section. Hiding on blur and on
         the window losing the pointer covers both that and tab-away. */
      window.addEventListener('blur', hide);

      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerenter', show);
        el.removeEventListener('pointerleave', hide);
        window.removeEventListener('blur', hide);
        el.classList.remove(styles.hideNative);
      };
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div
      className={label ? styles.cursor : `${styles.cursor} ${styles.cursorBare}`}
      ref={dot}
      aria-hidden="true"
    >
      {label && <span className={styles.cursorLabel}>{label}</span>}
    </div>
  );
}
