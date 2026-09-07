/* ---------------------------------------------------------------------------
   Section three's art direction, in data.

   The composition is hand-placed, not generated: every plate names its own
   position, size, rotation and the direction it flies in from. Desktop and
   mobile are separate arrangements rather than one responsive rule, because an
   irregular overlapping layout cannot be reflowed into a narrow column without
   turning into a pile.

   The stage sits BELOW the SALONE heading, so unlike the first version this
   composition has no centre band to keep clear — it can spread wide and shallow
   and use its whole box.

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
  'Finitura e styling',
  'Dettaglio di colore',
  'Onde e movimento',
  'Il salone a Chiavari',
];

/* Desktop: seven prints across a 16:11 stage. Sizes deliberately uneven —
   two large anchors, three mid, two small punctuation marks — and no plate
   shares an edge or a centre line with another. */
type Placed = Omit<Plate, 'alt'>;

export const PLATES: Plate[] = ([
  { src: 'g1', x: 1,  y:  3, w: 19,   ratio: 3/4, rot: -4.2, depth: 0.62, from: 'lower-left'  },
  { src: 'g4', x: 20, y:  0, w: 22,   ratio: 3/2, rot:  2.6, depth: 0.30, from: 'upper-right' },
  { src: 'g6', x: 40, y:  9, w: 11,   ratio: 1,   rot:  5.1, depth: 0.38, from: 'distance'    },
  { src: 'g7', x: 55, y:  1, w: 19,   ratio: 4/5, rot: -3.0, depth: 0.66, from: 'upper-right' },
  { src: 'g3', x: 15, y: 38, w: 24,   ratio: 1,   rot: -1.4, depth: 0.95, from: 'distance'    },
  { src: 'g5', x: 41, y: 45, w: 17,   ratio: 2/3, rot:  3.4, depth: 0.72, from: 'lower-left'  },
  { src: 'g2', x: 72, y: 52, w: 14.5, ratio: 4/5, rot:  1.8, depth: 0.42, from: 'lower-left'  },
] as Placed[]).map((p, i) => ({ ...p, alt: ALT[i] }));

/* Mobile: two loose columns, deliberately with no overlaps at all. The varied
   sizes, the stagger and the rotations are what carry the editorial feel here;
   the desktop spread's overlaps do not survive the width — at 390px they read
   as breakage rather than as art direction. Every plate clears its neighbours
   on one axis or the other. */
export const PLATES_MOBILE: Plate[] = ([
  { src: 'g1', x:  2, y:  0, w: 52, ratio: 3/4, rot: -3.4, depth: 0.60, from: 'lower-left'  },
  { src: 'g4', x: 56, y:  4, w: 42, ratio: 3/2, rot:  2.8, depth: 0.32, from: 'upper-right' },
  { src: 'g6', x: 60, y: 21, w: 26, ratio: 1,   rot:  4.6, depth: 0.40, from: 'distance'    },
  { src: 'g7', x:  4, y: 37, w: 46, ratio: 4/5, rot: -2.6, depth: 0.55, from: 'lower-left'  },
  { src: 'g3', x: 54, y: 40, w: 44, ratio: 1,   rot: -1.8, depth: 0.90, from: 'distance'    },
  { src: 'g5', x:  8, y: 68, w: 40, ratio: 2/3, rot:  3.0, depth: 0.70, from: 'upper-right' },
  { src: 'g2', x: 54, y: 67, w: 36, ratio: 4/5, rot:  1.6, depth: 0.35, from: 'lower-left'  },
] as Placed[]).map((p, i) => ({ ...p, alt: ALT[i] }));

export const TITLE = 'SALONE';
