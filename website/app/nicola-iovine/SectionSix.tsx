'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import { whatsappHref } from './contact';
import {
  SALON, DIRECTIONS_HREF, RATING, HOURS, REVIEWS,
  TITLE_LINES, REVIEWS_TITLE, SECTION_IDS,
} from './salon';
import styles from './section-six.module.css';

/* The review ticker runs on its own clock, like section four's backdrop, and
   like it is gated by an IntersectionObserver. It is a transform on one track
   rather than scrollLeft: scrollLeft is integer-quantised, and at the speed
   this wants — slow enough to read — that quantisation is visible as stutter. */
const SPEED = 26;        // px per second
const HOVER_SCALE = 0.12; // how far the ticker slows under the cursor
const RESUME_DELAY = 1.4; // seconds after a drag before it picks up again

export default function SectionSix() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>(`.${styles.ch}`);
      const revealed = gsap.utils.toArray<HTMLElement>(`.${styles.reveal}`);

      gsap.set(chars, { yPercent: 118, x: 12 });
      gsap.set(revealed, { opacity: 0, y: 16 });

      if (reduced) {
        gsap.set(chars, { yPercent: 0, x: 0 });
        gsap.set(revealed, { opacity: 1, y: 0 });
      } else {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 76%',
          once: true,
          onEnter: () => {
            gsap.timeline({ defaults: { ease: 'power3.out' } })
              .to(chars, { yPercent: 0, x: 0, duration: 1.2, stagger: 0.035 }, 0)
              /* The order the brief asks for: title, then the actions, then the
                 details, then the rating, then the reviews — each waiting on
                 the last rather than all arriving together. */
              .to(revealed, { opacity: 1, y: 0, duration: 0.9, stagger: 0.085 }, 0.55);
          },
        });
      }

      /* ---- the ticker ------------------------------------------------
         Reduced motion gets no ticker at all: the viewport is a plain
         horizontally scrollable row, which is what the brief asks for and is
         also the only honest way to show three cards without motion. */
      if (reduced) return;

      const vp = viewport.current!;
      const tr = track.current!;
      let half = tr.scrollWidth / 2;   // the track is the reviews twice over
      let auto = 0;                    // px travelled by the clock
      let drag = 0;                    // px the finger has added
      let running = false;
      let dragging = false;
      let lastX = 0, lastT = 0, velocity = 0;
      let resume: gsap.core.Tween | null = null;
      let speedScale = 1;

      const measure = () => { half = tr.scrollWidth / 2; };
      const apply = () => {
        /* Wrapped into the first copy, so the second copy is only ever the
           thing that fills the gap on the right — the seam never arrives. */
        const x = -(((auto - drag) % half) + half) % half;
        gsap.set(tr, { x });
      };

      const tick = (_t: number, dt: number) => {
        if (!running || dragging) return;
        auto += (SPEED * speedScale * dt) / 1000;
        apply();
      };

      gsap.ticker.add(tick);
      window.addEventListener('resize', measure);

      /* Hover slows rather than stops, and eases into it — a ticker that halts
         dead under the cursor reads as broken rather than as considerate. */
      const slow = () => gsap.to({ v: speedScale }, {
        v: HOVER_SCALE, duration: 0.6, ease: 'power2.out',
        onUpdate() { speedScale = (this.targets()[0] as { v: number }).v; },
      });
      const quicken = () => gsap.to({ v: speedScale }, {
        v: 1, duration: 0.9, ease: 'power2.out',
        onUpdate() { speedScale = (this.targets()[0] as { v: number }).v; },
      });
      vp.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') slow(); });
      vp.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') quicken(); });

      /* Drag, with a little inertia on release. */
      const onDown = (e: PointerEvent) => {
        dragging = true;
        resume?.kill();
        lastX = e.clientX; lastT = performance.now(); velocity = 0;
        vp.setPointerCapture(e.pointerId);
        vp.classList.add(styles.isDragging);
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const now = performance.now();
        const dx = e.clientX - lastX;
        drag += dx;
        if (now > lastT) velocity = dx / (now - lastT) * 1000;
        lastX = e.clientX; lastT = now;
        apply();
      };
      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        vp.releasePointerCapture(e.pointerId);
        vp.classList.remove(styles.isDragging);
        /* Carry the throw, then hand back to the clock. */
        const glide = gsap.utils.clamp(-600, 600, velocity) * 0.28;
        resume = gsap.to({ d: drag }, {
          d: drag + glide, duration: RESUME_DELAY, ease: 'power2.out',
          onUpdate() { drag = (this.targets()[0] as { d: number }).d; apply(); },
        });
      };
      vp.addEventListener('pointerdown', onDown);
      vp.addEventListener('pointermove', onMove);
      vp.addEventListener('pointerup', onUp);
      vp.addEventListener('pointercancel', onUp);

      const io = new IntersectionObserver(
        ([e]) => { running = e.isIntersecting; if (running) measure(); },
        { rootMargin: '20% 0px' },
      );
      io.observe(root.current!);

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener('resize', measure);
        io.disconnect();
        resume?.kill();
      };
    }, root);

    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  /* Twice over, so the wrap has something to show. aria-hidden on the copy so
     a screen reader is not read the same three reviews again. */
  const cards = (copy: boolean) =>
    REVIEWS.map((r, i) => (
      <figure className={styles.card} key={`${copy ? 'b' : 'a'}${i}`} aria-hidden={copy}>
        <span className={styles.stars} aria-label={`${r.stars} stelle su 5`}>
          {'★'.repeat(r.stars)}
        </span>
        <blockquote className={styles.quote}>{r.text}</blockquote>
        <figcaption className={styles.who}>{r.name}</figcaption>
      </figure>
    ));

  return (
    <section
      className={styles.six}
      id={SECTION_IDS.contatti}
      ref={root}
      aria-label="Contatti e prenotazioni"
    >
      <div className={styles.atmos} aria-hidden="true" />
      <span className={styles.place} aria-hidden="true">CHIAVARI</span>

      <div className={styles.inner}>
        <div className={styles.top}>
          {/* ---- left: the ask ---- */}
          <div className={styles.ask}>
            <span className={`${styles.eyebrow} ${styles.reveal}`}>05 — Contatti</span>
            <h2 className={styles.title} aria-label={TITLE_LINES.join(' ')}>
              {TITLE_LINES.map((line, li) => (
                <span className={styles.line} key={li}>
                  {line.split('').map((c, i) => (
                    <span className={styles.mask} key={i} aria-hidden="true">
                      <span className={styles.ch}>{c === ' ' ? ' ' : c}</span>
                    </span>
                  ))}
                </span>
              ))}
            </h2>

            <div className={`${styles.actions} ${styles.reveal}`}>
              <a
                className={styles.cta}
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.ctaSheen} aria-hidden="true" />
                Prenota su WhatsApp
              </a>
              <a className={styles.ghost} href={SALON.phoneHref}>Chiama</a>
              <a
                className={styles.ghost}
                href={DIRECTIONS_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                Indicazioni
                <span className={styles.arrow} aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* ---- right: where and when ---- */}
          <div className={styles.details}>
            <div className={styles.reveal}>
              <p className={styles.legal}>{SALON.legalName}</p>
              <a
                className={styles.address}
                href={DIRECTIONS_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                {SALON.street}<br />{SALON.city}
              </a>
              <a className={styles.phone} href={SALON.phoneHref}>{SALON.phone}</a>
            </div>

            <div className={`${styles.rating} ${styles.reveal}`}>
              <span className={styles.score}>{RATING.score}</span>
              <span className={styles.scoreOf}>/ {RATING.outOf}</span>
              <span className={styles.ratingStars} aria-hidden="true">★★★★★</span>
              <span className={styles.count}>{RATING.count} recensioni</span>
            </div>

            <dl className={`${styles.hours} ${styles.reveal}`}>
              {HOURS.map((d) => (
                <div className={styles.hourRow} key={d.day}>
                  <dt className={styles.day}>{d.day}</dt>
                  <dd className={d.closed ? `${styles.time} ${styles.closed}` : styles.time}>
                    {d.hours}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ---- reviews ---- */}
        <div className={`${styles.reviews} ${styles.reveal}`}>
          <h3 className={styles.reviewsTitle}>{REVIEWS_TITLE}</h3>
          <div className={styles.viewport} ref={viewport}>
            <div className={styles.track} ref={track}>
              {cards(false)}
              {cards(true)}
            </div>
          </div>
        </div>

        {/* ---- footer ---- */}
        <footer className={styles.footer}>
          <div className={styles.footBrand}>
            <span className={styles.footName}>Nicola Iovine</span>
            <span className={styles.footRole}>Hairdressing</span>
          </div>
          <div className={styles.footCol}>
            <span className={styles.footLine}>{SALON.street}</span>
            <span className={styles.footLine}>{SALON.city}</span>
            <a className={styles.footLink} href={SALON.phoneHref}>{SALON.phone}</a>
          </div>
          <nav className={styles.footNav} aria-label="Sezioni">
            <a href={`#${SECTION_IDS.salone}`}>Salone</a>
            <a href={`#${SECTION_IDS.trattamenti}`}>Trattamenti</a>
            <a href={`#${SECTION_IDS.lavori}`}>I nostri lavori</a>
            <a href={`#${SECTION_IDS.contatti}`}>Contatti</a>
          </nav>
          <div className={styles.footLegal}>
            {/* Placeholders, as asked — no policy pages exist yet. */}
            <a href="#" className={styles.footTiny}>Privacy</a>
            <a href="#" className={styles.footTiny}>Cookie</a>
            <span className={styles.footTiny}>
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Nicola Iovine
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
