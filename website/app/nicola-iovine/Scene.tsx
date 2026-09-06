'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, prefersReducedMotion } from '@/lib/motion';
import Hero from './Hero';
import SectionTwo from './SectionTwo';
import styles from './hero.module.css';

/** Soft silver mote, drawn once and blitted — far cheaper than per-particle arcs. */
function makeSprite(size: number) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  r.addColorStop(0, 'rgba(178,182,187,0.55)');
  r.addColorStop(0.3, 'rgba(158,162,168,0.2)');
  r.addColorStop(0.62, 'rgba(140,145,151,0.06)');
  r.addColorStop(1, 'rgba(130,135,141,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, size, size);
  return c;
}

type Mote = { x: number; y: number; dx: number; dy: number; s: number; a: number; phase: number };

export default function Scene() {
  const scene = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useIsomorphicLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const mobile = window.matchMedia('(max-width: 860px)').matches;

    const ctx = gsap.context(() => {
      const two = `.${styles.pin} section`;

      if (reduced) {
        /* No pin and no dissolve. The scene collapses to auto height so the
           two sections simply stack and scroll — otherwise the unpinned scene
           would leave 200vh of empty scroll below the hero. */
        scene.current?.setAttribute('data-reduced', 'true');
        gsap.set(`.${styles.heroBg}`, { opacity: 1 });
        return;
      }

      // ---- dust canvas, derived purely from progress so it reverses exactly ----
      const cv = canvas.current!;
      const g = cv.getContext('2d', { alpha: true })!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sprite = makeSprite(mobile ? 26 : 34);
      let motes: Mote[] = [];
      let W = 0, H = 0;

      const build = () => {
        W = cv.clientWidth; H = cv.clientHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const title = document.querySelector('h1')?.getBoundingClientRect();
        const bx = title ? title.left : W * 0.1;
        const bw = title ? title.width : W * 0.8;
        const by = title ? title.top : H * 0.38;
        const bh = title ? title.height : H * 0.2;
        const count = mobile ? 90 : 240;
        motes = Array.from({ length: count }, () => {
          // biased to the title band, with a soft halo around it
          const spread = Math.random() < 0.82 ? 0.92 : 1.5;
          return {
            x: bx + bw * (0.5 + (Math.random() - 0.5) * spread),
            y: by + bh * (0.5 + (Math.random() - 0.5) * spread * 1.5),
            dx: (Math.random() - 0.5) * (mobile ? 90 : 150),
            dy: 90 + Math.random() * (mobile ? 150 : 280),
            s: (mobile ? 5 : 7) + Math.random() * (mobile ? 8 : 13),
            a: 0.07 + Math.random() * 0.2,
            phase: Math.random(),
          };
        });
      };

      const draw = (p: number) => {
        g.clearRect(0, 0, W, H);
        if (p <= 0.2) return;
        for (const m of motes) {
          const local = (p - 0.2 - m.phase * 0.19) / 0.6;
          if (local <= 0 || local >= 1) continue;
          const a = Math.sin(local * Math.PI) * m.a;
          if (a <= 0.004) continue;
          const s = m.s * (0.85 + local * 0.5);
          g.globalAlpha = a;
          g.drawImage(sprite, m.x + m.dx * local - s / 2, m.y - m.dy * local - s / 2, s, s);
        }
        g.globalAlpha = 1;
      };

      build();

      // ---- scrubbed dissolve ----
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: pin.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setFilter(self.progress > 0.12);
            draw(self.progress);
          },
          onRefresh: (self) => {
            build();
            setFilter(self.progress > 0.12);
            draw(self.progress);
          },
        },
      });

      const cut = mobile ? '#ni-dust-cut-lite' : '#ni-dust-cut';

      /* The filter is attached only while it is actually eroding. Left on at
         rest it costs a full filter pass every frame for a no-op, and it forces
         the text off subpixel antialiasing — the hero renders fractionally
         softer for nothing. Hysteresis keeps it from thrashing at the edge. */
      const url = `url(#ni-dust${mobile ? '-lite' : ''})`;
      const dustEls = gsap.utils.toArray<HTMLElement>(`.${styles.dust}`);
      let filterOn = false;
      const setFilter = (on: boolean) => {
        if (on === filterOn) return;
        filterOn = on;
        for (const el of dustEls) el.style.filter = on ? url : '';
      };
      gsap.set(two, { opacity: 0 });
      gsap.set(`${two} > div`, { y: 38, opacity: 0 });

      /* 0-20 the hero still reads as solid, so a short scroll never costs you
         the opening frame; 20-82 erodes; the reveal lands last. */
      /* The watermark is not eroded. It sits at 0.15 opacity, where granulation
         is invisible, and it is the single largest filtered area on the page —
         filtering it cost more than the title and subtitle combined. It fades
         and drifts instead, which reads identically at that value. */
      tl.to(`.${styles.watermark}`, { opacity: 0, scale: 1.04, yPercent: -3, duration: 56 }, 22)
        .to(cut, { attr: { intercept: -15 }, duration: 62 }, 20)
        .to(`.${styles.dust}`, { yPercent: -4.5, scale: 1.022, duration: 70 }, 21)
        .to(`.${styles.grain}`, { opacity: 0, duration: 44 }, 26)
        .to(`.${styles.heroBg}`, { opacity: 0, duration: 52 }, 36)
        .to(two, { opacity: 1, duration: 32 }, 40)
        .to(`${two} > div`, { y: 0, opacity: 1, duration: 40 }, 56);

      if (!mobile) {
        tl.to('#ni-dust-warp', { attr: { scale: 26 }, duration: 66 }, 25);
      }

      return () => { motes = []; };
    }, scene);

    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <div className={styles.scene} ref={scene}>
      <div className={styles.pin} ref={pin}>
        <Hero />
        <SectionTwo />
        <canvas className={styles.dustCanvas} ref={canvas} aria-hidden="true" />
      </div>
    </div>
  );
}
