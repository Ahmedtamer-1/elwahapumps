"""
Reads the efficiency (Eta) and NPSH curves, and the recommended-flow band, off the
performance-chart pages of the two Kurlar catalogues.

WHY THIS EXISTS SEPARATELY from extract_pump_curves.py: that script reads *tables*
by word coordinates. Efficiency and NPSH are never tabulated — they exist only as
drawn polylines on the chart pages, so they have to be read out of the PDF's vector
geometry and mapped back through the printed axes. Different input, different
failure modes, so it lives in its own module; extract_pump_curves.py imports
`extract_chart_data` and merges the result into each family.

WHAT IT IS USED FOR: efficiency closes the power triangle. With head from the table
and efficiency from the curve, shaft power at any duty point is rho*g*Q*H/eta, which
gives the customer the kW figure and the motor load that decide whether a selection
is actually buildable. Without it a selector can only say "this pump reaches that
head" and nothing about what it costs to run.

HOW THE PAGES ARE READ:

  * A chart is located by the `Eta` and `NPSH` labels printed inside it, NOT by
    stroke colour. Both catalogues draw these curves inconsistently - blue on some
    pages, black or grey on others, and Kurlar overdraws each one twice - so colour
    is not a reliable selector. The labels are always there.

  * A chart is bound to its family by the title box every chart carries
    (`<family>` / `50 Hz` / `ISO 9906 : 2012 Grade 3B`). `9906` occurs exactly once
    per chart, so it anchors the box; the family code is the topmost text row above
    it. Only that row may be used - the row between is `50 Hz`, whose `50` otherwise
    glues onto the code and yields `K6SX-3650`.

  * Both catalogues print several charts per family (one per stage range, and the
    A3 spreads carry two side by side). Efficiency is a property of the hydraulic
    stage, so every chart of a family plots the same Eta curve; they are extracted
    independently and cross-checked against each other, which is free verification.

  * The flow axis unit is NOT taken from its label. The KSX pages label this axis
    `Q[l/s]` while printing m3/h values on it. Instead each hypothesis is tested
    against a physical invariant - a pump's efficiency peaks at its nominal flow,
    which is the number in its model code - and the one that agrees is used. A
    family where neither agrees is reported rather than guessed at.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import pdfplumber

CODE_RE = re.compile(r"(K(?:6|8|10)SX-?\d+|KP-?\d+)")
NUM_RE = re.compile(r"^\d+(?:[.,]\d+)?$")

# A chart's flow axis is accepted as m3/h (or l/s) when the extracted efficiency
# peak lands within this fraction of the family's nominal flow. The nominal flow in
# a model code is rounded for the name-plate - KP-617's curve peaks nearer 14 m3/h
# than 17 - so this has to allow real disagreement. It only has to be tight enough
# to tell the two units apart, and they differ by a factor of 3.6.
UNIT_TOLERANCE = 0.25


def to_num(text: str) -> float:
    return float(text.replace(",", "."))


def normalise_code(code: str) -> str:
    if code.startswith("KP") and not code.startswith("KP-"):
        code = "KP-" + code[2:]
    if "SX" in code and "SX-" not in code:
        code = code.replace("SX", "SX-")
    return code


def text_rows(words: list[dict], tol: float = 3.0) -> list[list[dict]]:
    rows: list[list[dict]] = []
    previous = None
    for word in sorted(words, key=lambda w: (w["top"], w["x0"])):
        if previous is not None and abs(word["top"] - previous) <= tol:
            rows[-1].append(word)
        else:
            rows.append([word])
        previous = word["top"]
    return [sorted(r, key=lambda w: w["x0"]) for r in rows]


def to_rgb(colour) -> tuple[float, float, float] | None:
    """pdfplumber reports RGB on one catalogue and CMYK on the other."""
    if not colour:
        return None
    if len(colour) == 3:
        return tuple(colour)
    if len(colour) == 4:
        c, m, y, k = colour
        return ((1 - c) * (1 - k), (1 - m) * (1 - k), (1 - y) * (1 - k))
    if len(colour) == 1:
        return (colour[0],) * 3
    return None


def is_band_fill(colour) -> bool:
    """The pale tint marking the recommended operating range, in either colour space."""
    rgb = to_rgb(colour)
    if not rgb:
        return False
    r, g, b = rgb
    return b > 0.9 and g > 0.85 and 0.7 < r < 0.96


@dataclass
class Chart:
    code: str
    page_no: int
    eta: list[tuple[float, float]]   # (flow in axis units, %)
    npsh: list[tuple[float, float]]  # (flow in axis units, m)
    band: tuple[float, float] | None  # recommended flow range, axis units
    x_span: tuple[float, float]


def legend_boxes(page) -> list[dict]:
    words = page.extract_words()
    out = []
    for word in words:
        if word["text"] != "9906":
            continue
        above = [
            w for w in words
            if w["top"] < word["top"] - 5 and word["top"] - w["top"] < 34
            and abs(w["x0"] - word["x0"]) < 130
        ]
        if not above:
            continue
        joined = "".join(w["text"] for w in text_rows(above)[0])
        joined = joined.replace("–", "-").replace("—", "-")
        match = CODE_RE.search(joined)
        if match:
            out.append({"code": normalise_code(match.group(1)), "x": word["x0"]})
    return out


def sub_charts(page) -> list[dict]:
    """
    Each Eta/NPSH sub-chart, as its two polylines plus the pixel box they occupy.
    Duplicated strokes are collapsed first so a chart yields exactly two curves.
    """
    words = page.extract_words()
    eta_labels = [w for w in words if w["text"] == "Eta"]
    if not eta_labels:
        return []

    seen: set = set()
    curves = []
    for curve in page.curves:
        if len(curve["pts"]) <= 100:
            continue
        xs = [x for x, _ in curve["pts"]]
        ys = [y for _, y in curve["pts"]]
        sig = (round(min(xs), 1), round(max(xs), 1), round(min(ys), 1), round(max(ys), 1),
               len(curve["pts"]) // 10)
        if sig in seen:
            continue
        seen.add(sig)
        curves.append({"pts": curve["pts"], "x0": min(xs), "x1": max(xs),
                       "y0": min(ys), "y1": max(ys)})

    charts, placed = [], set()
    for label in eta_labels:
        picked = [
            c for c in curves
            if c["x0"] - 40 <= label["x0"] <= c["x1"] + 40
            and abs((c["y0"] + c["y1"]) / 2 - label["top"]) < 70
        ]
        if len(picked) != 2:
            continue
        sig = tuple(sorted((round(c["x0"]), round(c["y0"])) for c in picked))
        if sig in placed:
            continue
        placed.add(sig)
        charts.append({"curves": picked, "label": label})
    return charts


def _fit(labels: list[tuple[float, float]]) -> tuple[float, float] | None:
    n = len(labels)
    mean_p = sum(p for p, _ in labels) / n
    mean_v = sum(v for _, v in labels) / n
    num = sum((p - mean_p) * (v - mean_v) for p, v in labels)
    den = sum((p - mean_p) ** 2 for p, _ in labels)
    if den == 0:
        return None
    slope = num / den
    return (mean_v - slope * mean_p, slope)


def axis_scale(labels: list[tuple[float, float]]) -> tuple[float, float] | None:
    """
    (offset, units-per-point) through tick position/value pairs, fitted robustly.

    A plain least-squares fit is not safe here: the box searched around a chart also
    catches the odd number belonging to something else - a page folio, a stray label
    from the neighbouring chart - and one outlier is enough to tilt the fit and
    silently rescale a whole curve. On some pages an outlier even lands at the same
    height as a real tick, so summary statistics over all the points (a median
    slope, say) can be dragged right off the true ladder.

    Ticks are evenly spaced by construction, so instead every pair of labels is
    taken as a candidate axis and the one the most other labels agree with wins.
    With at most a dozen labels the cubic cost is irrelevant, and a stray cannot
    outvote the real ladder.
    """
    labels = sorted(set(labels))
    if len(labels) < 3:
        return None

    span = labels[-1][0] - labels[0][0]
    if span <= 0:
        return None

    best: list[tuple[float, float]] = []
    for i, a in enumerate(labels):
        for b in labels[i + 1:]:
            if b[0] == a[0] or b[1] == a[1]:
                continue
            slope = (b[1] - a[1]) / (b[0] - a[0])
            tolerance = 0.02 * abs(slope) * span
            agree = [
                p for p in labels
                if abs((p[1] - a[1]) - slope * (p[0] - a[0])) <= tolerance
            ]
            if len(agree) > len(best):
                best = agree
    if len(best) < 3:
        return None
    return _fit(best)


def nearest_axis(
    ticks: list[tuple[float, float, float]], edge: float, tol: float = 4.5
) -> list[tuple[float, float]]:
    """
    Of several parallel tick ladders, the one whose line lies closest to `edge`.

    Each tick is `(position-along-axis, value, offset-across-axis)`. Charts in the
    Kurlar catalogue print an m3/h flow row and an l/s flow row one under the other,
    and a chart's own value axis can sit alongside its neighbour's. Fitting across
    two ladders produces a scale that is right for neither, so they are separated by
    their across-axis offset and only the nearest ladder is kept. Which unit that
    ladder is in gets settled later, against the family's nominal flow.
    """
    groups: dict[float, list[tuple[float, float]]] = {}
    for position, value, offset in ticks:
        key = next((k for k in groups if abs(k - offset) <= tol), offset)
        groups.setdefault(key, []).append((position, value))
    usable = [(offset, g) for offset, g in groups.items() if len(g) >= 3]
    if not usable:
        return []
    return min(usable, key=lambda item: abs(item[0] - edge))[1]


def apply(scale: tuple[float, float], position: float) -> float:
    return scale[0] + scale[1] * position


def read_chart(page, chart: dict, legends: list[dict], page_no: int) -> Chart | None:
    curves = chart["curves"]
    x0 = min(c["x0"] for c in curves)
    x1 = max(c["x1"] for c in curves)
    y0 = min(c["y0"] for c in curves)
    y1 = max(c["y1"] for c in curves)

    legend = next((l for l in legends if x0 - 70 <= l["x"] <= x1 + 70), None)
    if legend is None:
        return None

    words = page.extract_words()
    numeric = [w for w in words if NUM_RE.match(w["text"])]

    # Flow axis: the tick ladder printed under the sub-chart, within its x-span.
    below = [
        ((w["x0"] + w["x1"]) / 2, to_num(w["text"]), (w["top"] + w["bottom"]) / 2)
        for w in numeric
        if x0 - 30 <= (w["x0"] + w["x1"]) / 2 <= x1 + 30 and y1 < w["top"] < y1 + 34
    ]
    # Eta axis on the right, NPSH axis on the left. These windows have to reach well
    # past the curve extent: a curve stops at the pump's maximum flow, which on
    # several families falls short of the plotted frame the labels sit against.
    right = [((w["top"] + w["bottom"]) / 2, to_num(w["text"]), (w["x0"] + w["x1"]) / 2)
             for w in numeric
             if x1 < w["x0"] < x1 + 130 and y0 - 22 < w["top"] < y1 + 22]
    left = [((w["top"] + w["bottom"]) / 2, to_num(w["text"]), (w["x0"] + w["x1"]) / 2)
            for w in numeric
            if x0 - 130 < w["x1"] < x0 and y0 - 22 < w["top"] < y1 + 22]

    x_scale = axis_scale(nearest_axis(below, y1))
    eta_scale = axis_scale(nearest_axis(right, x1))
    npsh_scale = axis_scale(nearest_axis(left, x0))
    if not (x_scale and eta_scale and npsh_scale):
        return None

    # Telling the two polylines apart: NPSH required climbs with flow all the way to
    # the pump's limit, so its highest point is its last one, while efficiency turns
    # over and comes back down. Measured as "how close to its own maximum does the
    # curve end", that separates them on every page in both catalogues.
    #
    # This deliberately does not use "efficiency is zero at zero flow", which is
    # true of the pump but not of the drawing: several charts start their flow axis
    # part-way up the range, so both curves begin well above zero.
    def tail_ratio(curve) -> float:
        # PDF y grows downward, so a value is -y.
        values = [-y for _, y in curve["pts"]]
        lo, hi = min(values), max(values)
        if hi == lo:
            return 1.0
        last = values[max(range(len(curve["pts"])), key=lambda i: curve["pts"][i][0])]
        return (last - lo) / (hi - lo)

    ranked = sorted(curves, key=tail_ratio)
    eta_curve, npsh_curve = ranked[0], ranked[1]
    if tail_ratio(npsh_curve) < 0.9:
        return None  # neither curve rises to its maximum at the last flow point

    eta = sorted((apply(x_scale, x), apply(eta_scale, y)) for x, y in eta_curve["pts"])
    npsh = sorted((apply(x_scale, x), apply(npsh_scale, y)) for x, y in npsh_curve["pts"])

    # The recommended operating range is printed as a pale vertical tint across both
    # charts. Rects that span most of the frame are the plot background rather than
    # the band, so they are excluded by width; what remains is checked against the
    # efficiency peak below, since the band exists precisely to bracket it.
    band = None
    width = x1 - x0
    tints = [
        r for r in page.rects
        if is_band_fill(r.get("non_stroking_color"))
        and r["x0"] >= x0 - 30 and r["x1"] <= x1 + 30
        and 8 < (r["x1"] - r["x0"]) < 0.75 * width
    ]
    if tints:
        widest = max(tints, key=lambda r: r["x1"] - r["x0"])
        band = (apply(x_scale, widest["x0"]), apply(x_scale, widest["x1"]))

    return Chart(legend["code"], page_no, eta, npsh, band, (x0, x1))


def resample(points: list[tuple[float, float]], at: list[float]) -> list[float | None]:
    """Linear interpolation onto the catalogue's flow breakpoints."""
    if not points:
        return [None] * len(at)
    out: list[float | None] = []
    for q in at:
        if q < points[0][0] - 1e-6:
            out.append(None)
            continue
        if q > points[-1][0] + 1e-6:
            out.append(None)
            continue
        chosen = points[-1][1]
        for i in range(1, len(points)):
            if q <= points[i][0]:
                qa, va = points[i - 1]
                qb, vb = points[i]
                chosen = vb if qb == qa else va + (vb - va) * (q - qa) / (qb - qa)
                break
        out.append(chosen)
    return out


def peak(points: list[tuple[float, float]]) -> tuple[float, float]:
    return max(points, key=lambda p: p[1])


def extract_chart_data(pdf_paths: list, families: list[dict]) -> tuple[dict, list[str]]:
    """
    Returns `{family_code: {"etaPct": [...], "npshM": [...], "bandM3h": [lo, hi]}}`
    sampled onto each family's own flow breakpoints, plus a list of warnings.
    """
    by_code = {f["code"]: f for f in families}
    charts: dict[str, list[Chart]] = {}

    for path in pdf_paths:
        with pdfplumber.open(str(path)) as pdf:
            for page_no, page in enumerate(pdf.pages, start=1):
                legends = legend_boxes(page)
                if not legends:
                    continue
                for chart in sub_charts(page):
                    read = read_chart(page, chart, legends, page_no)
                    if read is not None and read.code in by_code:
                        charts.setdefault(read.code, []).append(read)

    result: dict[str, dict] = {}
    warnings: list[str] = []

    for code, family in by_code.items():
        found = charts.get(code, [])
        if not found:
            warnings.append(f"{code}: no performance chart found")
            continue

        q_nom = family["qNomM3h"]
        usable: list[tuple[Chart, float]] = []
        for chart in found:
            peak_q, _ = peak(chart.eta)
            for factor, unit in ((1.0, "m3/h"), (3.6, "l/s")):
                if abs(peak_q * factor - q_nom) / q_nom <= UNIT_TOLERANCE:
                    usable.append((chart, factor))
                    break
            else:
                warnings.append(
                    f"{code}: chart on p{chart.page_no} peaks at {peak_q:.1f} axis units,"
                    f" which is neither {q_nom} m3/h nor {q_nom / 3.6:.1f} l/s - skipped"
                )
        if not usable:
            warnings.append(f"{code}: no chart could be calibrated against nominal flow")
            continue

        flows = family["flowPointsM3h"]
        eta_samples, npsh_samples, bands = [], [], []
        for chart, factor in usable:
            eta_samples.append(resample([(q * factor, v) for q, v in chart.eta], flows))
            npsh_samples.append(resample([(q * factor, v) for q, v in chart.npsh], flows))
            if chart.band:
                bands.append((chart.band[0] * factor, chart.band[1] * factor))

        def average(samples: list[list[float | None]]) -> list[float | None]:
            out: list[float | None] = []
            for i in range(len(flows)):
                values = [s[i] for s in samples if s[i] is not None]
                out.append(round(sum(values) / len(values), 1) if values else None)
            return out

        # Charts of one family plot the same Eta curve; disagreement means one of
        # them was mis-read, so report it rather than averaging the error away.
        if len(eta_samples) > 1:
            for i in range(len(flows)):
                values = [s[i] for s in eta_samples if s[i] is not None]
                if values and max(values) - min(values) > 6.0:
                    warnings.append(
                        f"{code}: charts disagree on efficiency at {flows[i]} m3/h"
                        f" ({', '.join(f'{v:.1f}' for v in values)} %)"
                    )

        entry = {"etaPct": average(eta_samples), "npshM": average(npsh_samples)}
        if bands:
            low = round(sum(b[0] for b in bands) / len(bands), 1)
            high = round(sum(b[1] for b in bands) / len(bands), 1)
            # A band that does not straddle the efficiency peak is not the band -
            # some other tinted rect on the page was picked up. Drop it: the range
            # is advisory, and a wrong one would mislabel good selections as poor.
            peak_q = max(
                (peak([(q * factor, v) for q, v in chart.eta]) for chart, factor in usable),
                key=lambda p: p[1],
            )[0]
            if low - 1 <= peak_q <= high + 1:
                entry["bandM3h"] = [low, high]
            else:
                warnings.append(
                    f"{code}: recommended-flow band {low}-{high} m3/h does not contain"
                    f" the efficiency peak at {peak_q:.0f} m3/h - band dropped"
                )
        peak_pct = max((v for v in entry["etaPct"] if v is not None), default=0)
        if not 40 <= peak_pct <= 90:
            warnings.append(f"{code}: peak efficiency {peak_pct:.1f} % is outside 40-90 %")
        result[code] = entry

    return result, warnings
