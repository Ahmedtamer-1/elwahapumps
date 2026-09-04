import React from "react";
import Link from "next/link";
import { compactNumber } from "@/lib/format";

/**
 * Stat tile: label · value · optional delta · optional 12-point sparkline.
 * The sparkline runs in the de-emphasis gray with the current period in the
 * brand accent (#1c7a40, validated >= 3:1 on the white card surface).
 */
interface StatTileProps {
  label: string;
  value: number;
  /** Signed change vs the named comparison period. */
  delta?: { value: number; period: string };
  /** Whether an increase is a good thing (drives delta color). */
  upIsGood?: boolean;
  /** Up to 12 recent counts, oldest first. Last entry is the current period. */
  trend?: number[];
  href?: string;
}

function Sparkline({ points }: { points: number[] }) {
  const data = points.slice(-12);
  const max = Math.max(...data, 1);
  const lastIndex = data.length - 1;

  return (
    <svg
      viewBox={`0 0 ${data.length * 8} 24`}
      className="w-full h-6 mt-[14px]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {data.map((n, i) => {
        const h = Math.max((n / max) * 22, n > 0 ? 2 : 1);
        // 6px wide bar in an 8px slot leaves the 2px surface gap between marks.
        return (
          <rect
            key={i}
            x={i * 8}
            y={24 - h}
            width={6}
            height={h}
            fill={i === lastIndex ? "#d2ab5c" : "rgba(20,20,20,0.12)"}
          />
        );
      })}
    </svg>
  );
}

export default function StatTile({ label, value, delta, upIsGood = true, trend, href }: StatTileProps) {
  const deltaIsGood = delta ? (delta.value >= 0) === upIsGood : true;
  const deltaColor = !delta || delta.value === 0
    ? "text-stone"
    : deltaIsGood
      ? "text-pine"
      : "text-red-700";

  const body = (
    <>
      <p className="font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-stone-light">{label}</p>
      <p className="font-extrabold text-[26px] text-pine mt-[8px] leading-none">
        {compactNumber(value)}
      </p>
      {delta && (
        <p className={`text-xs font-semibold mt-2 ${deltaColor}`}>
          {delta.value > 0 ? "+" : ""}
          {delta.value} <span className="text-stone font-medium">vs {delta.period}</span>
        </p>
      )}
      {trend && trend.length > 0 && <Sparkline points={trend} />}
    </>
  );

  const className =
    "block h-full bg-white p-[22px_24px] transition-colors";

  return href ? (
    <Link href={href} className={`${className} hover:bg-bone/30 group`}>
      <div className="group-hover:text-field transition-colors">
        {body}
      </div>
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
