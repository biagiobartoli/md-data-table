'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import { PANELS, SERVICES, TITLE, LIST_TITLE } from './treatments';
import styles from './section-four.module.css';

/* The campaign runs on one pinned stage and a single 1000-unit timeline, so
   every beat is a scroll position rather than a duration and the whole thing
   reverses exactly. The panels are three nested boxes each:

     .panel      the mask. Travels vertically; overflow hidden.
     .panelIn    counter-travels, so the photograph stays optically anchored
                 while its frame slides past — this is what makes it read as a
                 physical advertising panel rather than a sliding image.
     img         the slow campaign motion: scale and drift while it is held.

   All three are composited transforms. */

const HOLD = [
  /* enter, settled-from, settled-to, exit — in timeline units out of 1000. */
  { in: 150, from: 230, to: 380, out: 450 },
  { in: 420, from: 500, to: 640, out: 710 },
  { in: 680, from: 760, to: 930, out: 1000 },
];

export default function SectionFour() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const listRoot = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const mobile = window.matchMedia('(max-width: 860px)').matches;

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>(`.${styles.ch}`);
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`);
      const ins = gsap.utils.toArray<HTMLElement>(`.${styles.panelIn}`);
      const imgs = gsap.utils.toArray<HTMLElement>(`.${styles.panel} img`);
      const counts = gsap.utils.toArray<HTMLElement>(`.${styles.countN}`);

      /* ---------- start states ---------------------------------------- */
      const mid = (chars.length - 1) / 2;
      chars.forEach((ch, i) => {
        gsap.set(ch, { yPercent: 120, x: (i - mid) * (mobile ? 9 : 26), z: -70 });
      });
      gsap.set(`.${styles.eyebrow}`, { opacity: 0, y: 12 });
      gsap.set(`.${styles.rail}`, { opacity: 0 });
      panels.forEach((p, i) => {
        gsap.set(p, { yPercent: 100 });
        gsap.set(ins[i], { yPercent: -100 });
        gsap.set(imgs[i], { scale: 1.06, yPercent: -1.6 });
      });
      gsap.set(counts, { yPercent: 100 });
      gsap.set(counts[0], { yPercent: 0 });

      if (reduced) {
        /* No pin and no scrub: the stage collapses and the three panels become
           a plain vertical run, so nothing can be stranded at opacity 0. */
        root.current?.setAttribute('data-reduced', 'true');
        gsap.set(chars, { yPercent: 0, x: 0, z: 0 });
        gsap.set([`.${styles.eyebrow}`, `.${styles.rail}`], { opacity: 1, y: 0 });
        panels.forEach((p, i) => {
          gsap.set(p, { yPercent: 0 });
          gsap.set(ins[i], { yPercent: 0 });
          gsap.set(imgs[i], { scale: 1, yPercent: 0 });
        });
        gsap.set(counts, { yPercent: 0 });
        gsap.set(`.${styles.listCh}`, { yPercent: 0, x: 0 });
        gsap.set(`.${styles.row}`, { opacity: 1, y: 0 });
        gsap.set(`.${styles.rowLine}`, { scaleX: 1 });
        return;
      }

      /* ---------- the pinned campaign --------------------------------- */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          /* Two and a half screens of campaign. The list block below is ~2vh
             of real content that cannot be compressed without hurting the
             prices' legibility, so this is what keeps the whole section inside
             the 350-500vh the brief asked for. Each panel still gets roughly
             two thirds of a screen to be held and looked at. */
          end: () => `+=${window.innerHeight * 2.5}`,
          pin: pin.current,
          scrub: 0.9,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      /* 1. TRATTAMENTI. Letters rise out of their masks left to right while
            the word compresses its tracking and comes forward. */
      chars.forEach((ch, i) => {
        tl.to(ch, { yPercent: 0, x: 0, z: 0, duration: 62, ease: 'power3.out' }, 4 + i * 4.5);
      });
      tl.to(`.${styles.eyebrow}`, { opacity: 1, y: 0, duration: 40, ease: 'power2.out' }, 0)
        /* and the title yields the stage rather than simply vanishing */
        .to(`.${styles.titleWrap}`, {
          yPercent: -16, scale: 0.86, opacity: 0, duration: 70, ease: 'power2.inOut',
        }, 128)
        .to(`.${styles.rail}`, { opacity: 1, duration: 50, ease: 'power2.out' }, 170);

      /* 2. The three panels, one at a time. Each rises into the stage behind
            its own mask, holds while the photograph slowly settles, then
            leaves upward as the next one arrives — the overlap is the
            handover, and it is what reads as panels moving past. */
      PANELS.forEach((_, i) => {
        const h = HOLD[i];
        tl.to(panels[i], { yPercent: 0, duration: 92, ease: 'power3.inOut' }, h.in)
          .to(ins[i],    { yPercent: 0, duration: 92, ease: 'power3.inOut' }, h.in)
          /* the campaign motion: slow, fashion-paced, never a Ken Burns sweep */
          .to(imgs[i], {
            scale: 1, yPercent: 1.4,
            duration: h.to - h.from, ease: 'none',
          }, h.from);

        if (i < PANELS.length - 1) {
          tl.to(panels[i], { yPercent: -100, duration: 92, ease: 'power3.inOut' }, h.out - 30)
            .to(ins[i],    { yPercent: 100,  duration: 92, ease: 'power3.inOut' }, h.out - 30);
        }
        if (i > 0) {
          tl.to(counts[i - 1], { yPercent: -100, duration: 36, ease: 'power2.inOut' }, h.in + 30)
            .to(counts[i],     { yPercent: 0,    duration: 36, ease: 'power2.inOut' }, h.in + 30);
        }
      });

      /* the last panel and the rail hand the stage back before the pin ends */
      tl.to(`.${styles.rail}`, { opacity: 0, duration: 44, ease: 'power2.in' }, 930)
        .to(panels[2], { yPercent: -100, duration: 70, ease: 'power2.in' }, 940)
        .to(ins[2],    { yPercent: 100,  duration: 70, ease: 'power2.in' }, 940);

      /* ---------- TUTTI I TRATTAMENTI, then the list ------------------- */
      const listTl = gsap.timeline({
        scrollTrigger: {
          trigger: listRoot.current,
          start: 'top 88%',
          end: 'bottom 78%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      gsap.set(`.${styles.listCh}`, { yPercent: 116, x: mobile ? 8 : 22 });
      gsap.set(`.${styles.row}`, { opacity: 0, y: 22 });
      gsap.set(`.${styles.rowLine}`, { scaleX: 0 });

      gsap.utils.toArray<HTMLElement>(`.${styles.listCh}`).forEach((ch, i) => {
        listTl.to(ch, { yPercent: 0, x: 0, duration: 40, ease: 'power3.out' }, 2 + i * 2.4);
      });
      listTl.to(`.${styles.row}`, {
        opacity: 1, y: 0, duration: 26, ease: 'power2.out', stagger: 5.5,
      }, 60)
        .to(`.${styles.rowLine}`, {
          scaleX: 1, duration: 30, ease: 'power2.out', stagger: 5.5,
        }, 62);
    }, root);

    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <section className={styles.four} ref={root} aria-label="Trattamenti">
      <div className={styles.pin} ref={pin}>
        <div className={styles.stage}>
          {/* The poster. One panel at a time occupies it. */}
          <div className={styles.poster}>
            {PANELS.map((p, i) => (
              <div className={styles.panel} key={p.src} style={{ zIndex: 10 + i }}>
                <div className={styles.panelIn}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/ni/campaign/${p.src}.webp`}
                    alt={p.alt}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{ '--pos': p.pos, '--posM': p.posMobile } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.titleWrap}>
            <span className={styles.eyebrow}>02 — Campagna</span>
            <h2 className={styles.title} aria-label={TITLE}>
              {TITLE.split('').map((c, i) => (
                <span className={styles.mask} key={i} aria-hidden="true">
                  <span className={styles.ch}>{c}</span>
                </span>
              ))}
            </h2>
          </div>

          {/* Two marks, no more: which panel you are on, and what this is. */}
          <div className={styles.rail} aria-hidden="true">
            <span className={styles.count}>
              <span className={styles.countTrack}>
                {PANELS.map((p, i) => (
                  <span className={styles.countN} key={p.src}>
                    0{i + 1}
                  </span>
                ))}
              </span>
              <span className={styles.countTotal}>/ 03</span>
            </span>
            <span className={styles.railLabel}>Campagna</span>
          </div>
        </div>
      </div>

      <div className={styles.listBlock} ref={listRoot}>
        <h3 className={styles.listTitle} aria-label={LIST_TITLE.join(' ')}>
          {LIST_TITLE.map((word, w) => (
            <span className={styles.listLine} key={w}>
              {word.split('').map((c, i) => (
                <span className={styles.listMask} key={i} aria-hidden="true">
                  <span className={styles.listCh}>{c === ' ' ? ' ' : c}</span>
                </span>
              ))}
            </span>
          ))}
        </h3>

        <ul className={styles.list}>
          {SERVICES.map((s) => (
            <li className={styles.row} key={s.name}>
              <span className={styles.rowLine} aria-hidden="true" />
              <span className={styles.rowName}>{s.name}</span>
              <span className={styles.rowPrice}>
                {s.note && <em className={styles.rowNote}>{s.note} </em>}
                {s.price === 'info in salone' ? (
                  <em className={styles.rowNote}>{s.price}</em>
                ) : (
                  <>
                    <span className={styles.rowCur}>€</span>
                    {s.price}
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
