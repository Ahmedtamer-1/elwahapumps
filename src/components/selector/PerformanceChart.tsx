import React from "react";

/**
 * The three performance curves, drawn as inline SVG on the server.
 *
 * No charting library and no client JavaScript: the curves are static once a pump
 * is chosen, the catalogue data they come from must not be shipped to the browser
 * (it is ~600 KB), and installers open this on a phone over mobile data at a well
 * head. An <svg> element costs a few KB and renders before any script would.
 */

export interface Series {
  label: string;
  unit: string;
  /** [flow m3/h, value]; nulls in the source are dropped before this point. */
  points: [number, number][];
  /** Marker at the selected duty point. Omitted when the value is unpublished. */
  duty: [number, number] | null;
  colour: string;
}

interface Props {
  series: Series;
  /** Flow axis label, already localised. */
  flowLabel: string;
  /**
   * Upper bound of the flow axis, shared across the set of charts. Passing it in
   * keeps all three on one scale, so the duty line sits at the same place in each
   * and they can be read as one picture. Left out, each chart would end its axis at
   * its own last point — and the efficiency curve stops short of the head curve.
   */
  flowMax: number;
  /** Recommended-flow range to shade, in m3/h. */
  band?: [number, number];
  /** Localised note shown instead of the plot when there is nothing to draw. */
  emptyLabel: string;
}

// The viewBox is sized close to the width the card actually gets (~360px in the
// three-up layout) so the SVG renders near 1:1. A much wider viewBox scaled down to
// fit would shrink the tick labels with it — at 520 units wide they landed at about
// 5px on screen, which is unreadable on the phone this is most used on.
const W = 380;
const H = 210;
const PAD = { top: 12, right: 14, bottom: 32, left: 42 };
const LABEL_SIZE = 11;

const TICK_COUNT = 5;
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10];

/**
 * A readable gridline interval, chosen before the axis maximum rather than after.
 *
 * Rounding the maximum first and dividing it into equal parts is what produces both
 * of the usual chart faults: a 250 m curve rounded onto a 500 m axis, drawn in the
 * bottom half of its plot, or an axis labelled 0 / 62 / 125 / 188. Picking the
 * interval first and multiplying up gives a tight axis whose labels are round.
 */
function axisMax(value: number): number {
  if (value <= 0) return 1;
  const rawStep = value / TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const scaled = rawStep / magnitude;
  const step = (NICE_STEPS.find((s) => scaled <= s + 1e-9) ?? 10) * magnitude;
  return step * TICK_COUNT;
}

function ticks(max: number): number[] {
  return Array.from({ length: TICK_COUNT + 1 }, (_, i) => (max * i) / TICK_COUNT);
}

function format(value: number): string {
  if (value === 0) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function PerformanceChart({
  series,
  flowLabel,
  flowMax,
  band,
  emptyLabel,
}: Props) {
  const { points, duty, colour, label, unit } = series;

  if (points.length < 2) {
    return (
      <figure className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <figcaption className="mb-2 text-sm font-medium text-neutral-300">
          {label} <span className="text-neutral-500">({unit})</span>
        </figcaption>
        <p className="py-10 text-center text-xs text-neutral-500">{emptyLabel}</p>
      </figure>
    );
  }

  const maxQ = axisMax(flowMax);
  const maxV = axisMax(Math.max(...points.map((p) => p[1])));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (q: number) => PAD.left + (q / maxQ) * plotW;
  const y = (v: number) => PAD.top + plotH - (v / maxV) * plotH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`)
    .join(" ");

  return (
    <figure className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <figcaption className="mb-1 text-sm font-medium text-neutral-300">
        {label} <span className="text-neutral-500">({unit})</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${label} against ${flowLabel}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* recommended operating range */}
        {band && band[1] > band[0] && (
          <rect
            x={x(Math.max(0, band[0]))}
            y={PAD.top}
            width={Math.max(0, x(Math.min(band[1], maxQ)) - x(Math.max(0, band[0])))}
            height={plotH}
            fill="#38bdf8"
            opacity="0.14"
          />
        )}

        {ticks(maxV).map((value) => (
          <g key={`y${value}`}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(value)}
              y2={y(value)}
              stroke="#27272a"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 6}
              y={y(value) + 3.5}
              textAnchor="end"
              fontSize={LABEL_SIZE}
              fill="#71717a"
            >
              {format(value)}
            </text>
          </g>
        ))}

        {ticks(maxQ).map((value) => (
          <text
            key={`x${value}`}
            x={x(value)}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            fontSize={LABEL_SIZE}
            fill="#71717a"
          >
            {format(value)}
          </text>
        ))}

        <path d={path} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" />

        {duty && (
          <g>
            <line
              x1={x(duty[0])}
              x2={x(duty[0])}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="#f87171"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={x(duty[0])} cy={y(duty[1])} r="4" fill="#f87171" />
          </g>
        )}

        <text
          x={PAD.left + plotW / 2}
          y={H - 4}
          textAnchor="middle"
          fontSize={LABEL_SIZE}
          fill="#a1a1aa"
        >
          {flowLabel}
        </text>
      </svg>
    </figure>
  );
}
