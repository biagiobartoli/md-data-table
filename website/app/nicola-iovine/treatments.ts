/* ---------------------------------------------------------------------------
   Section four — TRATTAMENTI.

   The campaign panels and the salon's real service list, both as data.
--------------------------------------------------------------------------- */

export type Panel = {
  src: string;
  alt: string;
  /* The poster box is a fixed 4/5 and the three photographs are 0.787, 0.802
     and 0.771, so each is trimmed by a different sliver. These are per-image
     framing decisions, not one blanket `cover`: they say which sliver goes,
     and they are what keeps every face and every length of hair intact. */
  pos: string;
  posMobile: string;
};

export const PANELS: Panel[] = [
  {
    src: 'c1',
    alt: 'Campagna Kevin Murphy — lunghezze e riflessi caldi',
    /* Tallest of the three, so the most height is trimmed. Framed high: the
       face sits in the top fifth and the hair runs the full length. */
    pos: '50% 16%',
    posMobile: '50% 12%',
  },
  {
    src: 'c2',
    alt: 'Campagna Kevin Murphy — onde naturali',
    /* Within a hair of 4/5 already; this only centres it. */
    pos: '50% 26%',
    posMobile: '50% 22%',
  },
  {
    src: 'c3',
    alt: 'Campagna Kevin Murphy — taglio uomo',
    /* Widest of the three, so the deepest vertical crop. Held high to keep
       the head clear of the top edge. */
    pos: '50% 12%',
    posMobile: '50% 9%',
  },
];

/* The salon's real list, verbatim. Prices are strings, not numbers: two of
   them are not prices at all, and formatting a number would invent a currency
   for "info in salone". */
export type Service = { name: string; price: string; note?: string };

export const SERVICES: Service[] = [
  { name: 'Piega',                    price: '21,00' },
  { name: 'Taglio Donna',             price: '27,00' },
  { name: 'Taglio Uomo',              price: '28,00' },
  { name: 'Colore',                   price: '43,00' },
  { name: 'Color Balancing',          price: '73,00' },
  { name: 'Gloss',                    price: '47,00' },
  { name: 'Contrasti',                price: '80,00' },
  { name: 'Balayage',                 price: '90,00', note: 'a partire da' },
  { name: 'Airlights',                price: '90,00', note: 'a partire da' },
  { name: 'Permanente',               price: '75,00' },
  { name: 'Relax (stiratura)',        price: 'info in salone' },
  { name: 'Trattamenti',              price: '7,00' },
  { name: 'Ricostruzione Dermoclean', price: '28,00' },
  { name: 'Ricostruzione K18',        price: '50,00' },
];

export const TITLE = 'TRATTAMENTI';
export const LIST_TITLE = ['TUTTI I', 'TRATTAMENTI'];
