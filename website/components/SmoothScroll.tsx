'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';
import { registerScrollLock } from '@/lib/scrollLock';

/**
 * Drives Lenis from GSAP's ticker instead of its own rAF loop.
 *
 * This matters: if Lenis and ScrollTrigger run on separate loops, scroll-driven
 * timelines read stale scroll positions and visibly lag behind the smoothed
 * scroll. Sharing one ticker keeps them frame-locked.
 *
 * Honours prefers-reduced-motion by leaving native scrolling untouched.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);

    let lenis: Lenis | null = null;
    let onTick: ((time: number) => void) | null = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({ duration: 1.2, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);

      // GSAP ticker time is seconds; Lenis expects milliseconds.
      onTick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(onTick);

      // Lag smoothing fights the smoothed scroll during heavy frames.
      gsap.ticker.lagSmoothing(0);

      // So an open overlay can freeze the page; overflow:hidden alone does not
      // stop Lenis, which owns the scroll position while it is running.
      registerScrollLock({ lock: () => lenis?.stop(), unlock: () => lenis?.start() });
    };

    const stop = () => {
      if (onTick) gsap.ticker.remove(onTick);
      onTick = null;
      registerScrollLock(null);
      lenis?.destroy();
      lenis = null;
      gsap.ticker.lagSmoothing(500, 33);
    };

    if (!mq.matches) start();

    // React to the user toggling reduced motion mid-session.
    const onChange = () => (mq.matches ? stop() : start());
    mq.addEventListener('change', onChange);

    return () => {
      mq.removeEventListener('change', onChange);
      stop();
    };
  }, []);

  return <>{children}</>;
}
