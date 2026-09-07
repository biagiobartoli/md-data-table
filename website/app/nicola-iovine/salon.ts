/* ---------------------------------------------------------------------------
   Section six — the salon's real details, the real hours, and the real
   reviews. Everything here is verbatim from what Nicola supplied; nothing in
   this file is inferred, formatted into existence, or filled in.
--------------------------------------------------------------------------- */

export const SALON = {
  legalName: 'N.I. Hairdressing di Iovine Nicola',
  street: 'Via G. B. Prandina, 16',
  city: '16043 Chiavari GE',
  phone: '0185 187 1467',
  phoneHref: 'tel:01851871467',
};

/* Built from the address above rather than stored as a second copy of it, so
   the two can never drift apart. */
export const DIRECTIONS_HREF =
  'https://www.google.com/maps/dir/?api=1&destination=' +
  encodeURIComponent(`${SALON.street}, ${SALON.city}`);

export const RATING = { score: '4.8', outOf: '5', count: '97' };

/* `closed` is a separate flag rather than the string "Chiuso" in the hours
   column: the closed days are set in a different face, and a component should
   not have to compare against a word to know that. */
export type Day = { day: string; hours: string; closed?: boolean };

export const HOURS: Day[] = [
  { day: 'Lunedì',    hours: 'Chiuso', closed: true },
  { day: 'Martedì',   hours: '09:00 – 18:00' },
  { day: 'Mercoledì', hours: '09:00 – 18:00' },
  { day: 'Giovedì',   hours: '09:00 – 18:00' },
  { day: 'Venerdì',   hours: '09:00 – 18:00' },
  { day: 'Sabato',    hours: '09:00 – 18:00' },
  { day: 'Domenica',  hours: 'Chiuso', closed: true },
];

export type Review = { name: string; stars: number; text: string };

/* The three real review excerpts, unedited. */
export const REVIEWS: Review[] = [
  {
    name: 'Lynne L.',
    stars: 5,
    text:
      'I had my hair colored and highlighted at this salon today and I am ' +
      'delighted. From the initial consultation with Nicola, to the end ' +
      'result, the service was very welcoming and excellent. Nicola listened ' +
      'to what I would like and the team delivered.',
  },
  {
    name: 'Lina 4',
    stars: 5,
    text:
      'Perfect, exactly what I was looking for. Nice smelling products and ' +
      'very good haircut.',
  },
  {
    name: 'Lucila Boni',
    stars: 5,
    text:
      'I’m very satisfied. The cut was done by Nicola with care and ' +
      'precision, exactly how I wanted it. The staff is kind and professional.',
  },
];

export const TITLE_LINES = ['PRENOTA IL TUO', 'APPUNTAMENTO'];
export const REVIEWS_TITLE = 'Le vostre parole';

/* The four destinations the nav and the footer both point at. */
export const SECTION_IDS = {
  salone: 'salone',
  trattamenti: 'trattamenti',
  lavori: 'lavori',
  contatti: 'contatti',
};
