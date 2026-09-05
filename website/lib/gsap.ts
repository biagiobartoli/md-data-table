import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Single registration point. registerPlugin is idempotent, but it must not run
// during SSR — ScrollTrigger touches window/document on registration.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
