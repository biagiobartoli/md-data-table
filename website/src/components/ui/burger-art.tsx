import { cn } from "@/lib/utils";

/**
 * Vector burger used in place of stock photography.
 *
 * Why vector: the build environment has no reachable image CDN, and shipping
 * unverified Unsplash IDs renders as broken boxes. This scales cleanly, costs
 * ~2KB, and never 404s. To swap in real photography later see src/lib/images.ts.
 */
export function BurgerArt({
  className,
  seed = 0,
}: {
  className?: string;
  seed?: number;
}) {
  const uid = `burger-${seed}`;
  return (
    <svg
      viewBox="0 0 320 260"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Illustration of a stacked flame-grilled burger"
    >
      <defs>
        <linearGradient id={`${uid}-bun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8A33D" />
          <stop offset="55%" stopColor="#C97B23" />
          <stop offset="100%" stopColor="#A15C16" />
        </linearGradient>
        <linearGradient id={`${uid}-bunBottom`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C97B23" />
          <stop offset="100%" stopColor="#8E4F12" />
        </linearGradient>
        <linearGradient id={`${uid}-patty`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5C3218" />
          <stop offset="50%" stopColor="#40200E" />
          <stop offset="100%" stopColor="#2A1409" />
        </linearGradient>
        <linearGradient id={`${uid}-cheese`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFC64D" />
          <stop offset="100%" stopColor="#F0A000" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6A1A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FF6A1A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ember glow beneath the stack */}
      <ellipse cx="160" cy="228" rx="130" ry="30" fill={`url(#${uid}-glow)`} />

      {/* top bun */}
      <path
        d="M38 106C38 60 93 30 160 30s122 30 122 76c0 9-6 14-15 14H53c-9 0-15-5-15-14Z"
        fill={`url(#${uid}-bun)`}
      />
      {/* sesame seeds */}
      <g fill="#FBE7C0" opacity="0.92">
        <ellipse cx="112" cy="68" rx="7" ry="4" transform="rotate(-22 112 68)" />
        <ellipse cx="160" cy="54" rx="7" ry="4" transform="rotate(6 160 54)" />
        <ellipse cx="208" cy="68" rx="7" ry="4" transform="rotate(24 208 68)" />
        <ellipse cx="84" cy="92" rx="6" ry="3.5" transform="rotate(-38 84 92)" />
        <ellipse cx="236" cy="92" rx="6" ry="3.5" transform="rotate(38 236 92)" />
        <ellipse cx="136" cy="86" rx="6" ry="3.5" transform="rotate(-8 136 86)" />
        <ellipse cx="186" cy="86" rx="6" ry="3.5" transform="rotate(12 186 86)" />
      </g>

      {/* lettuce — ruffled edge, overlapping bun above and cheese below */}
      <g fill="#5FA83C">
        <circle cx="44" cy="132" r="12" />
        <circle cx="64" cy="132" r="12" />
        <circle cx="84" cy="132" r="12" />
        <circle cx="104" cy="132" r="12" />
        <circle cx="124" cy="132" r="12" />
        <circle cx="144" cy="132" r="12" />
        <circle cx="164" cy="132" r="12" />
        <circle cx="184" cy="132" r="12" />
        <circle cx="204" cy="132" r="12" />
        <circle cx="224" cy="132" r="12" />
        <circle cx="244" cy="132" r="12" />
        <circle cx="264" cy="132" r="12" />
        <circle cx="284" cy="132" r="12" />
      </g>
      <rect x="36" y="114" width="248" height="20" rx="6" fill="#5FA83C" />
      <rect x="36" y="114" width="248" height="7" rx="3" fill="#4E8F30" />

      {/* cheese */}
      <path
        d="M48 132h224c7 0 11 5 9 11l-7 18c-2 6-7 9-13 9H59c-6 0-11-3-13-9l-7-18c-2-6 2-11 9-11Z"
        fill={`url(#${uid}-cheese)`}
      />
      <path d="M86 168l-7 22 15-5 3-17Z" fill="#F0A000" />
      <path d="M216 168l7 22-15-5-3-17Z" fill="#F0A000" />

      {/* patty */}
      <rect
        x="42"
        y="162"
        width="236"
        height="40"
        rx="20"
        fill={`url(#${uid}-patty)`}
      />
      {/* char marks */}
      <g stroke="#170B04" strokeWidth="3.5" strokeLinecap="round" opacity="0.55">
        <line x1="76" y1="174" x2="94" y2="190" />
        <line x1="124" y1="174" x2="142" y2="190" />
        <line x1="172" y1="174" x2="190" y2="190" />
        <line x1="220" y1="174" x2="238" y2="190" />
      </g>

      {/* bottom bun */}
      <path
        d="M50 196h220c10 0 16 6 14 15-4 17-26 27-62 27H98c-36 0-58-10-62-27-2-9 4-15 14-15Z"
        fill={`url(#${uid}-bunBottom)`}
      />
    </svg>
  );
}
