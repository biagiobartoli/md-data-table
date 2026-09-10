/* ---------------------------------------------------------------------------
   I PRODOTTI CON CUI LAVORIAMO — the two houses the salon works with.

   THE LOGO FILES ARE NOT IN THE PROJECT YET. The brief asked for the exact
   uploaded brand marks, cropped out of their screenshots; those screenshots
   never arrived, and a traced or re-set approximation of somebody else's
   trademark is not a placeholder, it is a wrong logo. So each brand renders
   its name until its file exists.

   To finish this section, drop the two screenshots somewhere and run:

       python3 scripts/brand-logos.py <kevin-murphy.png> <nak-hair.png>

   which isolates the mark from its background, repaints it to the site's
   silver and writes public/ni/brands/*.webp. Then set `logo` below. Nothing
   else changes — not the layout, not the animation, not the hover.
--------------------------------------------------------------------------- */

export type Brand = {
  id: string;
  /** Shown until `logo` exists, and again if the file ever fails to load. */
  name: string;
  /** Path under /public, or null while the mark is missing. */
  logo: string | null;
  /** Alt text for the mark. Names the brand, not the picture of it. */
  alt: string;
  /** Optical sizing: marks are different shapes and must read as equals. */
  width: string;
};

export const BRANDS: Brand[] = [
  {
    id: 'kevin-murphy',
    name: 'Kevin Murphy',
    logo: null,
    alt: 'Kevin Murphy',
    /* The K-over-wordmark lockup is close to square, so it is sized by a
       narrower box than a wordmark would be. */
    width: 'clamp(150px,15vw,232px)',
  },
  {
    id: 'nak-hair',
    name: 'Nak Hair',
    logo: null,
    alt: 'Nak Hair Australia',
    /* A wide, short wordmark. Given more width so the two read as the same
       weight on the page rather than the same number of pixels. */
    width: 'clamp(190px,19vw,300px)',
  },
];

export const TITLE_LINES = ['I PRODOTTI', 'CON CUI LAVORIAMO'];
