import styles from './section-two.module.css';

const CRAFT = [
  { n: '01', t: 'Taglio',   d: 'Struttura, peso, movimento. La forma nasce dal gesto.' },
  { n: '02', t: 'Colore',   d: 'Toni costruiti a mano, luce calibrata sulla pelle.' },
  { n: '03', t: 'Styling',  d: 'Finitura essenziale, pensata per durare oltre il salone.' },
];

export default function SectionTwo() {
  return (
    <section className={styles.two} aria-label="Il salone">
      <div className={styles.inner}>
        <span className={styles.eyebrow}>01 — Il Salone</span>
        <h2 className={styles.head}>
          Il gesto<br /><em>prima</em> della forma.
        </h2>
        <p className={styles.lead}>
          Ogni taglio comincia da come una persona si muove, non da come vorrebbe
          apparire. Il resto è tecnica.
        </p>
        <ul className={styles.craft}>
          {CRAFT.map((c) => (
            <li key={c.n}>
              <span className={styles.n}>{c.n}</span>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
