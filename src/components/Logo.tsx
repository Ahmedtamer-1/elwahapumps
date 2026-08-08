import React from "react";

/**
 * El Waha logo system — Brand Report §03.
 *
 * Direction A ("Refined original") is the primary lockup: heavy green
 * capitals, a structural bar under the name, the founding date split to
 * the bar's ends, a hairline divider, and the descriptor set wide in
 * monospace. Direction C's concentric ring is the standalone mark.
 *
 * Every measurement derives from `x`, the cap height of the wordmark
 * (§3.2), so the lockup scales without being redrawn. Nothing here is
 * set in absolute units except the value of `x` itself.
 */

/** Cap-height ratios of the two families, measured from the metrics. */
const ARCHIVO_CAP = 0.72;
const MONO_CAP = 0.68;

export type LogoVariant =
  /** Wordmark, bar, EST/2000, divider, descriptor. Min 120px wide. */
  | "full"
  /** Wordmark and bar only. Used below 120px, where the descriptor
   *  would be unreadable — it is dropped, never shrunk (§3.3). */
  | "short"
  /** The concentric ring alone: avatars, favicons, stamped parts. */
  | "mark";

export interface LogoProps {
  variant?: LogoVariant;
  /** Cap height of the wordmark in px. Everything else derives from it. */
  x?: number;
  /** Reversed colourway for pine grounds: bone wordmark, brass bar. */
  reversed?: boolean;
  /** Latin descriptor. Three words at most, naming an activity (§3.4). */
  descriptor?: string;
  /** Arabic descriptor, set beside the Latin one in subsidiary lockups. */
  descriptorAr?: string;
  /** Accessible name. Defaults to the company name plus descriptor. */
  title?: string;
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
  className = "",
  style,
}: LogoProps) {
  // §3.5: the lockup is only ever pine on light, or bone-and-brass on pine.
  // It is never set in brass, never on a gradient, never re-tracked.
  const wordmarkColor = reversed ? "var(--color-bone)" : "var(--color-pine)";
  const barColor = reversed ? "var(--color-brass)" : "var(--color-pine)";
  const dateColor = "var(--color-brass)";
  const descriptorColor = reversed ? "rgba(246,245,239,0.8)" : "var(--color-ink)";
  const dividerColor = reversed ? "rgba(246,245,239,0.3)" : "rgba(14,59,46,0.3)";

  const label = title ?? `El Waha — ${descriptor}`;

  if (variant === "mark") {
    return (
      <RingMark
        size={x * 2}
        reversed={reversed}
        title={title ?? "El Waha"}
        className={className}
        style={style}
      />
    );
  }

  // Derived from x (§3.2 measurement table).
  const wordmarkSize = x / ARCHIVO_CAP;
  const barHeight = 0.1 * x;
  const gapToBar = 0.22 * x;
  const dateSize = (0.22 * x) / MONO_CAP;
  const descriptorSize = (0.26 * x) / MONO_CAP;

  // The descriptor breaks to two lines and aligns to the wordmark's cap
  // height and baseline, rather than floating as it did in the old mark.
  const descriptorWords = descriptor.split(" ");
  const descriptorLines =
    descriptorWords.length > 2
      ? [descriptorWords.slice(0, -1).join(" "), descriptorWords.slice(-1)[0]]
      : [descriptor];

  const wordmarkBlock = (
    <span style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <span
        style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 800,
          fontSize: `${wordmarkSize}px`,
          lineHeight: 0.9,
          // Part of the drawing, not a style choice (§3.5).
          letterSpacing: "-0.03em",
          color: wordmarkColor,
          whiteSpace: "nowrap",
        }}
      >
        EL WAHA
      </span>
      <span
        style={{
          height: `${barHeight}px`,
          background: barColor,
          marginTop: `${gapToBar}px`,
        }}
      />
      {/* The founding date splits to the bar's ends so it reads at small
          sizes instead of vanishing, as it did set as "-SINCE 2000-". */}
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: `${0.24 * x}px`,
          fontFamily: "var(--font-plex-mono), monospace",
          fontWeight: 500,
          fontSize: `${dateSize}px`,
          lineHeight: 1,
          letterSpacing: "0.22em",
          color: dateColor,
        }}
      >
        <span>EST</span>
        <span style={{ marginInlineEnd: "-0.22em" }}>2000</span>
      </span>
    </span>
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
        {wordmarkBlock}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      dir="ltr"
      className={className}
      style={{ display: "inline-flex", alignItems: "stretch", gap: `${0.5 * x}px`, ...style }}
    >
      {wordmarkBlock}

      {/* Hairline, not the old heavy bar. */}
      <span style={{ width: 1, background: dividerColor, flexShrink: 0 }} aria-hidden="true" />

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
 * Direction C's ring: a borehole seen from above, and equally a pipe in
 * section. Fills the square and small-scale gaps the wordmark cannot —
 * favicons, social avatars, stamped parts, embroidery.
 *
 * The report notes the geometry there is indicative and wants a designer
 * to draw the final mark; this is built to the stated proportions so it
 * can stand in until that happens.
 */
export function RingMark({
  size = 40,
  reversed = false,
  title = "El Waha",
  className = "",
  style,
}: {
  size?: number;
  reversed?: boolean;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const outer = reversed ? "var(--color-bone)" : "var(--color-pine)";
  const inner = "var(--color-brass)";

  // Ratios taken from §3.1 direction C: outer ring stroke 0.10 of the
  // diameter, inner ring at half the diameter, centre dot 0.133.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
      role="img"
      aria-label={title}
    >
      <circle cx="30" cy="30" r="27" fill="none" stroke={outer} strokeWidth="6" />
      <circle cx="30" cy="30" r="12.5" fill="none" stroke={inner} strokeWidth="5" />
      <circle cx="30" cy="30" r="4" fill={outer} />
    </svg>
  );
}
