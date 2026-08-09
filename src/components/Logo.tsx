import React from "react";
import Image from "next/image";

/**
 * El Waha logo system.
 *
 * The lockup is the supplied artwork — the Arabic calligraphic droplet, a
 * divider, and the Latin wordmark — rather than type set from tokens. It
 * ships in two colourways keyed out of the same drawing: pine for light
 * grounds, bone for pine ones (§3.5). It is never set in brass, never on a
 * gradient, never re-tracked.
 *
 * Sizing still derives from `x`, the cap height of the wordmark (§3.2), so
 * call sites are unchanged and the lockup scales without being redrawn.
 */

/** Cap height of "EL WAHA" as a fraction of the artwork's height. */
const CAP_RATIO = 165 / 553;
/** Cap-height ratio of IBM Plex Mono, measured from the metrics. */
const MONO_CAP = 0.68;

const LOCKUP = { width: 1367, height: 553 };
const MARK = { width: 390, height: 553 };

export type LogoVariant =
  /** Lockup plus the Latin descriptor. Min 120px wide. */
  | "full"
  /** Lockup alone. Used below 120px, where the descriptor would be
   *  unreadable — it is dropped, never shrunk (§3.3). */
  | "short"
  /** The calligraphic droplet alone: avatars, favicons, stamped parts. */
  | "mark";

export interface LogoProps {
  variant?: LogoVariant;
  /** Cap height of the wordmark in px. Everything else derives from it. */
  x?: number;
  /** Reversed colourway for pine grounds: the bone drawing. */
  reversed?: boolean;
  /** Latin descriptor. Three words at most, naming an activity (§3.4). */
  descriptor?: string;
  /** Arabic descriptor, set beside the Latin one in subsidiary lockups. */
  descriptorAr?: string;
  /** Accessible name. Defaults to the company name plus descriptor. */
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
  variant = "full",
  x = 26,
  reversed = false,
  descriptor = "PUMPS & WELLS SERVICES",
  descriptorAr,
  title,
  preload = false,
  className = "",
  style,
}: LogoProps) {
  const label = title ?? `El Waha — ${descriptor}`;

  if (variant === "mark") {
    return (
      <Mark
        size={x * 2}
        reversed={reversed}
        title={title ?? "El Waha"}
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

  const lockup = (
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
  );

  if (variant === "short") {
    return (
      <span
        role="img"
        aria-label={title ?? "El Waha"}
        // The logo does not flip on Arabic pages; only its position in
        // the layout changes (§5.2 rule 6).
        dir="ltr"
        className={className}
        style={{ display: "inline-flex", ...style }}
      >
        {lockup}
      </span>
    );
  }

  const descriptorSize = (0.26 * x) / MONO_CAP;
  const descriptorColor = reversed ? "rgba(246,245,239,0.8)" : "var(--color-ink)";
  const dividerColor = reversed ? "rgba(246,245,239,0.3)" : "rgba(14,59,46,0.3)";

  // The descriptor breaks to two lines so it sits within the artwork's
  // height instead of running past it.
  const descriptorWords = descriptor.split(" ");
  const descriptorLines =
    descriptorWords.length > 2
      ? [descriptorWords.slice(0, -1).join(" "), descriptorWords.slice(-1)[0]]
      : [descriptor];

  return (
    <span
      role="img"
      aria-label={label}
      dir="ltr"
      className={className}
      style={{ display: "inline-flex", alignItems: "stretch", gap: `${0.5 * x}px`, ...style }}
    >
      {lockup}

      {/* Hairline, lighter than the divider drawn inside the artwork: that
          one separates the symbol from the name, this one separates the
          name from the descriptor. */}
      <span
        style={{ width: 1, background: dividerColor, flexShrink: 0, margin: `${0.35 * x}px 0` }}
        aria-hidden="true"
      />

      <span
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: `${0.18 * x}px`,
          marginInlineStart: `${0.05 * x}px`,
        }}
      >
        {descriptorLines.map((line) => (
          <span
            key={line}
            // force-caps keeps this Latin fragment uppercase and tracked
            // even inside an Arabic page, where the global rule strips
            // tracking from Arabic text.
            className="force-caps"
            style={{
              fontFamily: "var(--font-plex-mono), monospace",
              fontWeight: 500,
              fontSize: `${descriptorSize}px`,
              lineHeight: 1.4,
              letterSpacing: "0.2em",
              color: descriptorColor,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </span>
        ))}
        {/* Arabic counterpart is tracked at zero — the two will not look
            identical, and they should not (§5.2 rule 3). */}
        {descriptorAr && (
          <span
            dir="rtl"
            style={{
              fontFamily: "var(--font-plex-arabic), sans-serif",
              fontWeight: 600,
              fontSize: `${0.46 * x}px`,
              lineHeight: 1.4,
              letterSpacing: "normal",
              color: descriptorColor,
              whiteSpace: "nowrap",
            }}
          >
            {descriptorAr}
          </span>
        )}
      </span>
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
