'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import styles from './chrome.module.css';

/**
 * The three page-wide polish layers, in one component because they share one
 * rAF and one set of listeners.
 *
 *  - film grain (static, no JS)
 *  - the scroll rail at the right edge
 *  - the pointer field: --ni-px / --ni-py on <html>, normalised to -1..1
 *
 * The pointer field is published as CSS custom properties rather than applied
 * to elements here, so a section opts into parallax by reading the variables in
 * its own stylesheet and choosing its own depth. Nothing is coupled: if this
 * component never mounts, every consumer falls back to the 0 defaults declared
 * alongside it and simply does not move.
 */
export default function PageChrome() {
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const reduced = prefersReducedMotion();
    const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    const ctx = gsap.context(() => {
      /* ---------- F. scroll rail ---------- */
      const railEl = rail.current, thumbEl = thumb.current;
      let stop = () => {};
      if (railEl && thumbEl) {
        // Smoothed rather than bound directly to scrollTop: Lenis already eases
        // the page, and a thumb that tracks raw scroll reads as faster than the
        // content it is reporting on.
        const toY = reduced
          ? (v: number) => gsap.set(thumbEl, { y: v })
          : gsap.quickTo(thumbEl, 'y', { duration: 0.32, ease: 'power2.out' });

        const update = () => {
          const doc = document.documentElement;
          const max = doc.scrollHeight - window.innerHeight;
          const railH = railEl.clientHeight;
          // Thumb length mirrors how much of the document one screen is, floored
          // so it never becomes a dot on a very long page.
          const share = Math.max(0.06, Math.min(0.3, window.innerHeight / doc.scrollHeight));
          thumbEl.style.height = `${share * 100}%`;
          const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          toY(p * (railH - share * railH));
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        stop = () => {
          window.removeEventListener('scroll', update);
          window.removeEventListener('resize', update);
        };
      }

      /* ---------- C. pointer field ---------- */
      // Desktop only, and only for a fine pointer: on a touch screen the last
      // touch would freeze the field at wherever the finger left it.
      if (!fine || reduced) return stop;

      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const onMove = (e: PointerEvent) => {
        tx = (e.clientX / window.innerWidth) * 2 - 1;
        ty = (e.clientY / window.innerHeight) * 2 - 1;
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const tick = () => {
        // Heavy easing. The whole effect is a few pixels, so anything that
        // tracks the cursor closely reads as jitter rather than depth.
        cx += (tx - cx) * 0.055;
        cy += (ty - cy) * 0.055;
        root.style.setProperty('--ni-px', cx.toFixed(4));
        root.style.setProperty('--ni-py', cy.toFixed(4));
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.0015
          ? requestAnimationFrame(tick)
          : 0;
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => {
        stop();
        window.removeEventListener('pointermove', onMove);
        if (raf) cancelAnimationFrame(raf);
        root.style.removeProperty('--ni-px');
        root.style.removeProperty('--ni-py');
      };
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.rail} ref={rail} aria-hidden="true">
        <div className={styles.railThumb} ref={thumb} />
      </div>
    </>
  );
}
