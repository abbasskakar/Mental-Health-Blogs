/**
 * Small colour helpers for validating the admin-chosen accent.
 *
 * The accent is used as link text and UI colour on both themes, so a value
 * that only works on one of them is unusable. An admin-saved `#1a1e1e` once
 * shipped to production and rendered every link in every article at a 1.05:1
 * contrast ratio against the dark background — effectively invisible.
 */

/** The two page backgrounds the accent has to stay legible against. */
const LIGHT_BG = '#FFFFFF';
const DARK_BG = '#09090B';

/**
 * WCAG AA for large text and UI components. Deliberately not 4.5: the site's
 * own default accent (#0D9488) sits at 3.29:1 on white, and rejecting the
 * design default would be absurd.
 */
const MIN_CONTRAST = 3;

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** WCAG relative luminance. */
function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return 0;
  const la = luminance(ca);
  const lb = luminance(cb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * True when `hex` is a six-digit colour that stays legible on BOTH the light
 * and the dark background. Anything else falls back to the design default.
 */
export function isAccentReadable(hex: string | null | undefined): boolean {
  if (!hex || !parseHex(hex)) return false;
  return (
    contrastRatio(hex, LIGHT_BG) >= MIN_CONTRAST &&
    contrastRatio(hex, DARK_BG) >= MIN_CONTRAST
  );
}

/**
 * A hover variant of the accent: nudged toward whichever end keeps it
 * distinguishable. Without this, a custom accent would fall back to the
 * stylesheet's teal `--accent-hover` and links would change hue on hover.
 */
export function accentHover(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  // Darken a light accent, lighten a dark one, so hover is always visible.
  const factor = luminance(rgb) > 0.4 ? 0.82 : 1.22;
  return toHex(rgb.map((v) => v * factor) as [number, number, number]);
}
