import styles from './section-two.module.css';

const BRANDS = [
  { file: 'kevin-murphy', label: 'Kevin Murphy' },
  { file: 'nak-hair',     label: 'Nak Hair' },
];

export default function SectionTwo() {
  return (
    <section className={styles.two} aria-label="Il salone">
      {/* Baked by scripts/section2-bg.py at --saturation 0.68: muted and
          flattened, but deliberately NOT monochrome — the ash tones are what
          the shot is about, and draining them costs the image its subject.
          Baked rather than filtered so the treatment is identical everywhere
          and costs nothing per frame. */}
      <div className={styles.bg} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ni/section-2-hair.webp" alt="" />
      </div>

      <div className={styles.inner}>
        <span className={styles.eyebrow}>01 — Il Salone</span>

        {/* Split into lines so each can rise out of its own mask. The masks
            carry padding-bottom with a matching negative margin, or they clip
            the descenders in "gesto" and "prima". */}
        <h2 className={styles.head}>
          <span className={styles.line}><span className={styles.lineIn}>Il gesto</span></span>
          <span className={styles.line}>
            <span className={styles.lineIn}><em>prima</em> della forma.</span>
          </span>
        </h2>

        <p className={styles.bio}>
          Nicola Iovine è attivo professionalmente da oltre 40 anni. Nel 2010, con
          l’apertura del salone a Chiavari, realizza il sogno di dar vita a un nuovo
          progetto. Lo affiancano delle aziende giovani, Kevin Murphy e Nakhair.
        </p>

        <ul className={styles.plates}>
          {BRANDS.map((b) => (
            <li key={b.file} className={styles.plate}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/ni/${b.file}.webp`} alt={b.label} />
              <span className={styles.plateLabel}>{b.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
