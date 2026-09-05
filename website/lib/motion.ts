import { useEffect, useLayoutEffect } from 'react';

/**
 * useLayoutEffect warns during SSR. GSAP setup wants layout timing on the
 * client, so swap in useEffect on the server.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
