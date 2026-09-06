import type { Metadata } from 'next';
import { Cormorant, Cormorant_Garamond, Montserrat } from 'next/font/google';
import Scene from './Scene';
import SectionThree from './SectionThree';
import styles from './hero.module.css';

const display = Cormorant({
  subsets: ['latin'], weight: ['300', '400', '500'],
  variable: '--ni-display', display: 'swap',
});
const italic = Cormorant_Garamond({
  subsets: ['latin'], weight: ['300', '400'], style: ['italic'],
  variable: '--ni-italic', display: 'swap',
});
const ui = Montserrat({
  subsets: ['latin'], weight: ['300', '400', '500'],
  variable: '--ni-ui', display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nicola Iovine — Hairdresser',
  description: 'Hair design, colour and style.',
};

export default function Page() {
  return (
    <div className={`${display.variable} ${italic.variable} ${ui.variable} ${styles.root}`}>
      <Scene />
      <SectionThree />
    </div>
  );
}
