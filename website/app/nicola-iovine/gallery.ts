/* ---------------------------------------------------------------------------
   Section three's art direction, in data.

   The composition is hand-placed, not generated: every plate names its own
   position, size, rotation and the direction it flies in from. Desktop and
   mobile are separate arrangements rather than one responsive rule, because an
   irregular overlapping layout cannot be reflowed into a narrow column without
   turning into a pile.

   IMAGES ARE PLACEHOLDERS. They were cropped out of the two photographs we
   already had (see scripts/gallery-placeholders.py) so the interaction could be
   built and judged against real photographic content. Swap `src` here for the
   real salon set and everything else keeps working.
--------------------------------------------------------------------------- */

/** Where a plate flies in from as the section is scrolled into. */
export type Entrance = 'lower-left' | 'upper-right' | 'distance';

export type Plate = {
  src: string;
  alt: string;
  /** Position of the plate's top-left, as a % of the stage box. */
  x: number;
  y: number;
  /** Width as a % of stage width. Height follows from `ratio`. */
  w: number;
  /** width / height of the image itself. */
  ratio: number;
  /** Resting rotation in degrees. Hover straightens this toward 0. */
  rot: number;
  /** 0 = far, 1 = near. Drives parallax, magnetic pull and stacking. */
  depth: number;
  from: Entrance;
};

/* Indexed by position in the arrays below, not by file — the two arrangements
   place the same seven photographs in a different reading order. */
const ALT = [
  'Taglio e piega, luce naturale',
  'Postazione di lavoro',
  'Angolo del salone',
  'Onde e movimento',
  'Dettaglio di colore',
  'Finitura e styling',
  'Il salone a Chiavari',
];

/* Desktop: seven prints across a 16:11 stage. Sizes deliberately uneven —
   two large anchors, three mid, two small punctuation marks — and no plate
   shares an edge or a centre line with another. */
type Placed = Omit<Plate, 'alt'>;

export const PLATES: Plate[] = ([
  { src: 'g1', x:  2.5, y: 12, w: 20,   ratio: 3/4,  rot: -4.2, depth: 0.62, from: 'lower-left'  },
  { src: 'g4', x: 25,   y:  2, w: 15.5, ratio: 3/2,  rot:  2.6, depth: 0.30, from: 'upper-right' },
  { src: 'g6', x: 38,   y: 15, w: 11,   ratio: 1,    rot:  5.1, depth: 0.38, from: 'distance'    },
  { src: 'g5', x: 68,   y:  6, w: 17,   ratio: 2/3,  rot:  3.4, depth: 0.72, from: 'upper-right' },
  { src: 'g3', x: 18,   y: 48, w: 23,   ratio: 1,    rot: -1.4, depth: 0.95, from: 'distance'    },
  { src: 'g7', x: 62,   y: 50, w: 19,   ratio: 4/5,  rot: -3.0, depth: 0.66, from: 'lower-left'  },
  { src: 'g2', x: 40,   y: 72, w: 12.5, ratio: 4/5,  rot:  1.8, depth: 0.42, from: 'lower-left'  },
] as Placed[]).map((p, i) => ({ ...p, alt: ALT[i] }));

/* Mobile: the same seven, re-arranged. Still irregular and still overlapping
   slightly, but down a single column at a size where nothing is buried. */
export const PLATES_MOBILE: Plate[] = ([
  { src: 'g1', x:  3, y:  1, w: 54, ratio: 3/4, rot: -3.4, depth: 0.60, from: 'lower-left'  },
  { src: 'g4', x: 46, y: 24, w: 48, ratio: 3/2, rot:  2.8, depth: 0.32, from: 'upper-right' },
  { src: 'g6', x: 68, y: 44, w: 26, ratio: 1,   rot:  4.6, depth: 0.40, from: 'upper-right' },
  { src: 'g5', x: 10, y: 56, w: 42, ratio: 2/3, rot:  3.0, depth: 0.70, from: 'lower-left'  },
  { src: 'g3', x:  7, y: 36, w: 58, ratio: 1,   rot: -1.8, depth: 0.90, from: 'distance'    },
  { src: 'g7', x: 54, y: 66, w: 40, ratio: 4/5, rot: -2.6, depth: 0.55, from: 'lower-left'  },
  { src: 'g2', x: 14, y: 84, w: 30, ratio: 4/5, rot:  1.6, depth: 0.35, from: 'distance'    },
] as Placed[]).map((p, i) => ({ ...p, alt: ALT[i] }));

export const TITLE = 'SALONE';
