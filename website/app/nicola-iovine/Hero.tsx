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

      const strands = gsap.utils.toArray<SVGPathElement>(`.${styles.strand}`);
      strands.forEach((s) => {
        const len = s.getTotalLength();
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      });

      if (prefersReducedMotion()) {
        gsap.set(`.${styles.ch}`, { yPercent: 0 });
        gsap.set(`.${styles.sub}`, { opacity: 1, y: 0 });
        gsap.set(`.${styles.rule}`, { scaleX: 1 });
        gsap.set([`.${styles.nav}`, `.${styles.foot}`, `.${styles.halo}`], { opacity: 1 });
        gsap.set(strands, { strokeDashoffset: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(`.${styles.ch}`, {
          yPercent: 0, duration: 1.9, stagger: { each: 0.055, from: 'start' },
        }, 0.25)
        .to(`.${styles.halo}`, { opacity: 1, duration: 3.0, ease: 'power2.out' }, 0.4)
        /* strands draw rather than fade — the movement is the point */
        .to(strands, {
          strokeDashoffset: 0, duration: 3.6, ease: 'power2.inOut', stagger: 0.22,
        }, 0.7)
        .to(`.${styles.sub}`, { opacity: 1, y: 0, duration: 1.8 }, 1.45)
        .to(`.${styles.rule}`, { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 1.5)
        .to(`.${styles.nav}`,  { opacity: 1, duration: 1.6 }, 1.9)
        .to(`.${styles.foot}`, { opacity: 1, duration: 1.6 }, 2.1);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main className={styles.hero} ref={root}>
      <div className={styles.halo} aria-hidden="true" />

      <svg className={styles.strands} viewBox="0 0 1440 900"
           preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="ni-strand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#A9ADB2" stopOpacity="0"/>
            <stop offset="26%"  stopColor="#C0C3C6" stopOpacity=".55"/>
            <stop offset="52%"  stopColor="#E2E4E6" stopOpacity=".85"/>
            <stop offset="76%"  stopColor="#A9ADB2" stopOpacity=".4"/>
            <stop offset="100%" stopColor="#94989D" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#ni-strand)" strokeLinecap="round">
          <path className={styles.strand} d="M-140 214 C 300 74, 690 250, 1010 138 S 1400 44, 1580 152" strokeWidth=".9" opacity=".42"/>
          <path className={styles.strand} d="M-140 288 C 250 168, 560 372, 880 268 S 1320 132, 1580 236" strokeWidth=".75" opacity=".30"/>
          <path className={styles.strand} d="M-140 452 C 320 356, 620 546, 940 448 S 1360 350, 1580 430" strokeWidth=".6" opacity=".18"/>
          <path className={styles.strand} d="M-140 636 C 240 742, 580 552, 900 668 S 1330 764, 1580 654" strokeWidth=".8" opacity=".33"/>
          <path className={styles.strand} d="M-140 712 C 300 812, 660 640, 980 754 S 1380 828, 1580 736" strokeWidth=".9" opacity=".30"/>
          <path className={styles.strand} d="M-140 794 C 260 866, 700 726, 1020 828 S 1400 880, 1580 806" strokeWidth=".65" opacity=".22"/>
        </g>
      </svg>

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
          <span className={styles.sub}>Hairdresser</span>
          <i className={styles.rule} />
        </p>
      </div>

      <div className={styles.foot}>
        <span>Hair Design · Color · Style</span>
        <span className={styles.scroll}>Scroll</span>
      </div>

      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
    </main>
  );
}
