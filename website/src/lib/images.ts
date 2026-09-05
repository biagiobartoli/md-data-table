/**
 * Image strategy
 * ---------------
 * This build ships vector art (components/ui/burger-art.tsx) rather than stock
 * photography, because the build environment cannot reach an image CDN and
 * unverified remote URLs would render as broken boxes.
 *
 * To switch to real photography:
 *   1. Add the host to next.config.mjs:
 *        images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] }
 *   2. Replace <BurgerArt /> with <Image src={MENU_PHOTOS[i]} ... /> in
 *      components/sections/menu.tsx and hero-scroll.tsx.
 *   3. Verify each URL returns 200 before committing it.
 */
export const MENU_PHOTOS: string[] = [];
