'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import styles from './hero.module.css';

const WORDS = ['NICOLA', 'IOVINE'];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const logo = useRef<HTMLImageElement>(null);

  useIsomorphicLayoutEffect(() => {
    /* A 404 can resolve before React attaches onError, so re-check on mount:
       a broken image reports complete with naturalWidth 0. */
    const img = logo.current;
    if (img && img.complete && img.naturalWidth === 0) img.style.display = 'none';

    const ctx = gsap.context(() => {
      /* The CSS start state is translateY(102%), but getComputedStyle reports a
         matrix in pixels, so GSAP reads it as y:146px / yPercent:0 and tweening
         yPercent becomes a no-op. Normalise into GSAP's own model first. */
      gsap.set(`.${styles.ch}`, { y: 0, yPercent: 102 });

      if (prefersReducedMotion()) {
        gsap.set(`.${styles.ch}`, { yPercent: 0 });
        gsap.set(`.${styles.sub}`, { opacity: 1, y: 0 });
        gsap.set(`.${styles.rule}`, { scaleX: 1 });
        gsap.set([`.${styles.nav}`, `.${styles.foot}`, `.${styles.watermark}`], { opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(`.${styles.watermark}`, { opacity: 1, duration: 2.8, ease: 'power2.out' }, 0)
        .to(`.${styles.ch}`, {
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
      {/* The hero's own ground. It fades on scroll so the dissolving content
          reveals section two behind, rather than sitting on opaque black. */}
      <div className={styles.heroBg} aria-hidden="true" />

      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <defs>
          {/* Dust dissolve. Fine noise is pushed into alpha and thresholded, so
              the artwork erodes into grains rather than fading; a second, much
              coarser noise then displaces those grains so they drift instead of
              vanishing in place. Both feTurbulence nodes have fixed parameters,
              so the expensive noise is generated once — only the threshold and
              the displacement scale animate. */}
          <filter id="ni-dust" x="-5%" y="-12%" width="110%" height="124%"
                  colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="1"
                          seed="11" result="grain" />
            <feColorMatrix in="grain" type="matrix" result="grainA"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      1 0 0 0 0" />
            <feComponentTransfer in="grainA" result="cut">
              <feFuncA id="ni-dust-cut" type="linear" slope="14" intercept="1.2" />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="cut" operator="in" result="eroded" />
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.021"
                          numOctaves="2" seed="5" result="warp" />
            <feDisplacementMap id="ni-dust-warp" in="eroded" in2="warp" scale="0"
                               xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Mobile: threshold only. Displacement over a full viewport is the
              expensive half and is the first thing to stutter on a phone. */}
          <filter id="ni-dust-lite" x="-3%" y="-6%" width="106%" height="112%"
                  colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1"
                          seed="11" result="grain" />
            <feColorMatrix in="grain" type="matrix" result="grainA"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      1 0 0 0 0" />
            <feComponentTransfer in="grainA" result="cut">
              <feFuncA id="ni-dust-cut-lite" type="linear" slope="14" intercept="1.2" />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="cut" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Official brand lockup, repainted silver by scripts/logo-prep.py.
          Hidden rather than broken if the asset is not present yet. */}
      <div className={styles.watermark} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logo}
          src="/ni/logo-mono.webp"
          alt=""
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>


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
        <h1 className={`${styles.title} ${styles.dust}`}>
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
        <p className={`${styles.subWrap} ${styles.dust}`} aria-hidden="true">
          <i className={styles.rule} />
          <span className={styles.sub}>Hairdressing</span>
          <i className={styles.rule} />
        </p>
      </div>

      <div className={`${styles.foot} ${styles.dust}`}>
        <span>Hair Design · Color · Style</span>
        <span className={styles.scroll}>Scroll</span>
      </div>

      <div className={styles.grain} aria-hidden="true" />
    </main>
  );
}
