import React from "react";
import Image from "next/image";

/**
 * El Waha logo system.
 *
 * The lockup is the supplied artwork — the Arabic calligraphic droplet, a
 * divider, and the Latin wordmark — rather than type set from tokens.
 *
 * The drawing is two-tone: the calligraphy in brand green, the alif struck
 * through it in brass. It ships in two colourways keyed out of that same
 * drawing — green on light grounds, white on dark ones (§3.5); white rather
 * than bone, so it holds over the brighter parts of the hero photography.
 * The brass accent is part of the artwork and rides along in both. It is
 * never on a gradient, never re-tracked.
 *
 * It stands alone. The "PUMPS & WELLS SERVICES" descriptor that used to
 * hang off a hairline beside it has been dropped: the nav, the headline
 * and the footer copy all say it already.
 *
 * Sizing derives from `x`, the cap height of the wordmark (§3.2), so the
 * lockup scales without being redrawn.
 */

/** Cap height of "EL WAHA" as a fraction of the artwork's height. */
const CAP_RATIO = 165 / 553;

const LOCKUP = { width: 1360, height: 553 };
const MARK = { width: 382, height: 553 };

export type LogoVariant =
  /** The full artwork: droplet, divider, wordmark. */
  | "lockup"
  /** The calligraphic droplet alone: avatars, favicons, stamped parts. */
  | "mark";

export interface LogoProps {
  variant?: LogoVariant;
  /** Cap height of the wordmark in px. Everything else derives from it. */
  x?: number;
  /** Reversed colourway for pine grounds: the white drawing. */
  reversed?: boolean;
  /** Accessible name. Defaults to the company name. */
  title?: string;
  /** Preload the artwork. Set on the header instance, which is the LCP. */
  preload?: boolean;
  /**
   * Note: the root sets `display` as an inline style so the lockup's
   * internal geometry holds wherever it lands. An inline style beats a
   * utility class, so a `hidden` / `sm:hidden` passed here will NOT hide
   * it — put responsive visibility on a wrapper element instead.
   */
  className?: string;
  /** Merged over the root's inline style, last, if you need an override. */
  style?: React.CSSProperties;
}

export default function Logo({
  variant = "lockup",
  x = 26,
  reversed = false,
  title = "El Waha",
  preload = false,
  className = "",
  style,
}: LogoProps) {
  if (variant === "mark") {
    return (
      <Mark
        size={x * 2}
        reversed={reversed}
        title={title}
        preload={preload}
        className={className}
        style={style}
      />
    );
  }

  // The artwork is placed by the cap height of its wordmark, so a given
  // `x` yields the same optical size it did when the mark was drawn here.
  const artHeight = x / CAP_RATIO;
  const artWidth = (artHeight * LOCKUP.width) / LOCKUP.height;

  return (
    <span
      role="img"
      aria-label={title}
      // The logo does not flip on Arabic pages; only its position in the
      // layout changes (§5.2 rule 6).
      dir="ltr"
      className={className}
      style={{ display: "inline-flex", ...style }}
    >
      <Image
        src={reversed ? "/images/brand/elwaha-logo-reversed.png" : "/images/brand/elwaha-logo.png"}
        alt=""
        width={LOCKUP.width}
        height={LOCKUP.height}
        preload={preload}
        // The intrinsic drawing is far larger than any rendered size; this
        // tells the optimiser what it actually has to serve.
        sizes={`${Math.ceil(artWidth)}px`}
        style={{ width: `${artWidth}px`, height: `${artHeight}px` }}
      />
    </span>
  );
}

/**
 * The calligraphic droplet alone. Fills the square and small-scale gaps
 * the lockup cannot — favicons, social avatars, stamped parts.
 */
export function Mark({
  size = 40,
  reversed = false,
  title = "El Waha",
  preload = false,
  className = "",
  style,
}: {
  size?: number;
  reversed?: boolean;
  title?: string;
  preload?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const width = (size * MARK.width) / MARK.height;

  return (
    <Image
      src={reversed ? "/images/brand/elwaha-mark-reversed.png" : "/images/brand/elwaha-mark.png"}
      alt={title}
      width={MARK.width}
      height={MARK.height}
      preload={preload}
      sizes={`${Math.ceil(width)}px`}
      className={className}
      style={{ width: `${width}px`, height: `${size}px`, ...style }}
    />
  );
}
