'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import styles from './hero.module.css';

const WORDS = ['NICOLA', 'IOVINE'];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* The CSS start state is translateY(102%), but getComputedStyle reports a
         matrix in pixels, so GSAP reads it as y:146px / yPercent:0 and tweening
         yPercent becomes a no-op. Normalise into GSAP's own model first. */
      gsap.set(`.${styles.ch}`, { y: 0, yPercent: 102 });

      if (prefersReducedMotion()) {
        gsap.set(`.${styles.ch}`, { yPercent: 0 });
        gsap.set(`.${styles.sub}`, { opacity: 1, y: 0 });
        gsap.set(`.${styles.rule}`, { scaleX: 1 });
        gsap.set([`.${styles.nav}`, `.${styles.foot}`], { opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(`.${styles.ch}`, {
          yPercent: 0, duration: 1.9, stagger: { each: 0.055, from: 'start' },
        }, 0.25)
        .to(`.${styles.sub}`, { opacity: 1, y: 0, duration: 1.8 }, 1.45)
        .to(`.${styles.rule}`, { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 1.5)
        .to(`.${styles.nav}`,  { opacity: 1, duration: 1.6 }, 1.9)
        .to(`.${styles.foot}`, { opacity: 1, duration: 1.6 }, 2.1);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main className={styles.hero} ref={root}>

      <nav className={styles.nav}>
        <a className={styles.mark} href="#" aria-label="Nicola Iovine">NI</a>
        <ul className={styles.links}>
          <li><a href="#">Salone</a></li>
          <li><a href="#">Servizi</a></li>
          <li><a href="#">Gallery</a></li>
          <li><a href="#">Contatti</a></li>
        </ul>
      </nav>

      <div className={styles.centre}>
        <h1 className={styles.title}>
          <span className={styles.srOnly}>Nicola Iovine</span>
          {WORDS.map((w, wi) => (
            <span
              className={wi === 1 ? `${styles.word} ${styles.wordTwo}` : styles.word}
              key={w}
              aria-hidden="true"
            >
              {[...w].map((c, i) => (
                <span className={styles.mask} key={i}>
                  <span className={styles.ch}>{c}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className={styles.subWrap} aria-hidden="true">
          <i className={styles.rule} />
          <span className={styles.sub}>Hairdressing</span>
          <i className={styles.rule} />
        </p>
      </div>

      <div className={styles.foot}>
        <span>Hair Design · Color · Style</span>
        <span className={styles.scroll}>Scroll</span>
      </div>

      <div className={styles.grain} aria-hidden="true" />
    </main>
  );
}
