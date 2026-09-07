/* ---------------------------------------------------------------------------
   Section five — I NOSTRI LAVORI.

   Related to SALONE but not the same thing: that section is a room, this one is
   results. So the composition is a spread rather than a scatter, the grade
   keeps its colour instead of going nearly monochrome, and the interaction is
   hover-and-quieten rather than a magnetic field.

   IMAGES ARE PLACEHOLDERS, cropped from the hair photography already in the
   project (see scripts/works-placeholders.py). Swap `src` for the real set and
   nothing else changes.
--------------------------------------------------------------------------- */

export type Work = {
  src: string;
  alt: string;
  /** Small caps caption, revealed with the plate on hover. */
  label: string;
  /** Position and width as a % of the stage; height follows from `ratio`. */
  x: number;
  y: number;
  w: number;
  ratio: number;
  rot: number;
  /** 0 = far, 1 = near. Drives entrance travel, stacking and hover lift. */
  depth: number;
};

/* Desktop: one dominant look, two mid plates, three supporting details, laid
   out as an editorial spread that reads left to right and top to bottom. */
export const WORKS: Work[] = [
  { src: 'w1', label: 'Balayage',  alt: 'Lunghezze con balayage caldo',
    x:  3, y:  2, w: 24, ratio: 3/4, rot: -2.4, depth: 0.92 },
  { src: 'w3', label: 'Colore',    alt: 'Studio di colore sulle lunghezze',
    x: 30, y:  0, w: 30, ratio: 3/2, rot:  1.4, depth: 0.44 },
  { src: 'w2', label: 'Texture',   alt: 'Dettaglio di ricci e movimento',
    x: 66, y:  3, w: 16, ratio: 1,   rot:  3.2, depth: 0.36 },
  { src: 'w6', label: 'Styling',   alt: 'Piega e finitura',
    x: 36, y: 36, w: 22, ratio: 4/5, rot:  1.8, depth: 0.86 },
  { src: 'w4', label: 'Taglio',    alt: 'Taglio uomo',
    x: 66, y: 48, w: 20, ratio: 4/5, rot: -1.6, depth: 0.62 },
  { src: 'w5', label: 'Lunghezze', alt: 'Dettaglio delle lunghezze',
    x: 14, y: 60, w: 12, ratio: 2/3, rot: -3.6, depth: 0.58 },
];

/* Mobile: the same six re-laid as two staggered columns. No overlaps at all —
   at this width they read as breakage rather than as art direction. */
export const WORKS_MOBILE: Work[] = [
  { src: 'w1', label: 'Balayage',  alt: 'Lunghezze con balayage caldo',
    x:  2, y:  0, w: 54, ratio: 3/4, rot: -2.4, depth: 0.92 },
  { src: 'w3', label: 'Colore',    alt: 'Studio di colore sulle lunghezze',
    x: 58, y:  5, w: 40, ratio: 3/2, rot:  1.4, depth: 0.44 },
  { src: 'w2', label: 'Texture',   alt: 'Dettaglio di ricci e movimento',
    x: 60, y: 22, w: 32, ratio: 1,   rot:  3.2, depth: 0.36 },
  { src: 'w6', label: 'Styling',   alt: 'Piega e finitura',
    x:  4, y: 40, w: 48, ratio: 4/5, rot:  1.8, depth: 0.86 },
  { src: 'w4', label: 'Taglio',    alt: 'Taglio uomo',
    x: 58, y: 43, w: 38, ratio: 4/5, rot: -1.6, depth: 0.62 },
  { src: 'w5', label: 'Lunghezze', alt: 'Dettaglio delle lunghezze',
    x: 14, y: 72, w: 34, ratio: 2/3, rot: -3.6, depth: 0.58 },
];

/* The barber's bench behind the whole section. Baked by
   scripts/works-background.py — corner crop marks cut, graded down but kept
   warm. Which axis is croppable flips with the viewport, as always: the frame
   is 1.69 landscape and the section is portrait-ish, so on desktop the sides
   go and only X matters; on a phone the crop is far tighter, so the value is
   chosen to hold the scissors rather than the empty wood. */
export const BACKGROUND = {
  src: 'bench',
  pos: '52% 46%',
  posMobile: '58% 42%',
};

export const TITLE_LINES = ['I NOSTRI', 'LAVORI'];
export const KICKER = 'Colore, styling e trasformazione';
