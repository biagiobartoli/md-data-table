/**
 * Freezes the page while something is open, whether or not Lenis is running.
 *
 * Deliberately NOT `overflow:hidden`: on an already-scrolled page that clamps
 * the scroll position and the page jumps, which is fatal here — the expanded
 * plate is a transformed element in normal flow, so any scroll under it drags
 * it away from the viewport centre and it no longer returns to where it came
 * from. Stopping Lenis and swallowing the raw scroll inputs keeps the document
 * exactly where it was.
 */
type Locker = { lock(): void; unlock(): void };

let locker: Locker | null = null;
let depth = 0;

const swallow = (e: Event) => e.preventDefault();
const SCROLL_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ',
]);
const swallowKeys = (e: KeyboardEvent) => {
  if (SCROLL_KEYS.has(e.key)) e.preventDefault();
};

export function registerScrollLock(l: Locker | null) {
  locker = l;
}

export function lockScroll() {
  if (depth++ > 0) return;
  locker?.lock();
  window.addEventListener('wheel', swallow, { passive: false });
  window.addEventListener('touchmove', swallow, { passive: false });
  window.addEventListener('keydown', swallowKeys, { passive: false });
}

export function unlockScroll() {
  if (depth === 0 || --depth > 0) return;
  window.removeEventListener('wheel', swallow);
  window.removeEventListener('touchmove', swallow);
  window.removeEventListener('keydown', swallowKeys);
  locker?.unlock();
}
