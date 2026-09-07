/* ---------------------------------------------------------------------------
   Section four — TRATTAMENTI.

   The campaign panels and the salon's real service list, both as data.
--------------------------------------------------------------------------- */

export type Panel = {
  src: string;
  alt: string;
  /* These are full-bleed backdrops, so which axis is croppable flips with the
     viewport. On a landscape screen a portrait photograph fills the width and
     overflows vertically, so only the Y value does anything; on a phone it
     fills the height and overflows horizontally, so only X does. Hence a
     separate value per breakpoint per image rather than one blanket `cover`. */
  pos: string;        // desktop: Y chooses the visible band
  posMobile: string;  // mobile:  X chooses the visible column
};

export const PANELS: Panel[] = [
  {
    src: 'c1',
    alt: 'Campagna Kevin Murphy — lunghezze e riflessi caldi',
    pos: '50% 8%',
    posMobile: '58% 50%',
  },
  {
    src: 'c2',
    alt: 'Campagna Kevin Murphy — onde naturali',
    pos: '50% 14%',
    posMobile: '50% 50%',
  },
  {
    src: 'c3',
    alt: 'Campagna Kevin Murphy — taglio uomo',
    pos: '50% 6%',
    posMobile: '56% 50%',
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
export const LIST_TITLE = 'Tutti i trattamenti';

/* Split for the two columns. Seven and seven, in the order given. */
export const COLUMNS = [SERVICES.slice(0, 7), SERVICES.slice(7)];

/* Which campaign photograph each row reveals on hover, and which band of it.
   Fourteen rows over three photographs, so they cycle; the band walks down the
   frame as the list goes so two neighbouring rows never show the same crop.
   Each row is a wide, shallow letterbox, which is why only the Y matters. */
export const ROW_MEDIA = SERVICES.map((_, i) => ({
  src: PANELS[i % PANELS.length].src,
  pos: `50% ${12 + ((i * 13) % 62)}%`,
}));
