/**
 * The two lucide icons a <BlogCard> uses, drawn once as SVG <symbol>s and
 * referenced with <use>.
 *
 * Each inline lucide icon is ~320 bytes of markup. /blog renders every post,
 * so its two icons per card added 123 KB to a page that Vercel bills by the
 * 8 KB on every ISR write. A <use> reference is ~60 bytes and draws exactly
 * the same paths (data copied from lucide-react 1.24.0).
 *
 * <CardIconSprite /> is rendered once by the public layout so the symbols are
 * on every page that shows a card. No "use client": both are plain markup.
 */

const ICONS = {
  clock: {
    strokeWidth: 1.5,
    paths: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
  "arrow-right": {
    strokeWidth: 1.75,
    paths: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
  },
} as const;

export type CardIconName = keyof typeof ICONS;

export function CardIconSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }} aria-hidden="true">
      {(Object.keys(ICONS) as CardIconName[]).map((name) => (
        <symbol key={name} id={`ci-${name}`} viewBox="0 0 24 24">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth={ICONS[name].strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ICONS[name].paths}
          </g>
        </symbol>
      ))}
    </svg>
  );
}

/** Size it with the same `w-3 h-3` classes a lucide icon takes. */
export function CardIcon({ name, className }: { name: CardIconName; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#ci-${name}`} />
    </svg>
  );
}
