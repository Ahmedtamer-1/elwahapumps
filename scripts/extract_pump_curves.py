"""
Extracts Kurlar submersible-pump performance tables and the KM motor ladder from
the two PDF catalogues in public/Catalogue into:

    src/data/pump-curves.json   6"/8"/10" KP (bolted SS) + KSX (cast SS) families
    src/data/km-motors.json     the 49 real KM6/7/8/10 motor codes

Usage:
    python scripts/extract_pump_curves.py
    node scripts/verify-pump-curves.mjs      <- must pass before the data is used

WHY PYTHON, in an otherwise all-Node repo: this reads the PDFs by *word
coordinates* (pdfplumber), not by reconstructed text layout. Text-mode extraction
(`pdftotext -layout` / `-table`) was tried first and is not trustworthy here:
`-layout` merges adjacent numeric cells ("3 4" -> "34") and splits tall rows;
`-table` fixes that but still fails on ~37 of 933 rows, because several pages
overlay a performance chart on the same horizontal band as the table, and its
column reconstruction interleaves the two. Coordinates have neither problem — a
head value is assigned to a flow column because it is *physically underneath* it.

Getting a head value wrong here would put an undersized pump in a customer's well,
so the extra dependency buys real safety. This script is run once per catalogue
revision and its JSON output is committed; nothing at build or request time needs
Python.

The 4" KPN/KPS families are deliberately skipped — out of scope for v1.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber

from extract_chart_curves import extract_chart_data

ROOT = Path(__file__).resolve().parent.parent
CATALOGUE_DIR = ROOT / "public" / "Catalogue"
DATA_DIR = ROOT / "src" / "data"

KSX_PDF = CATALOGUE_DIR / "KSX Catalogue.pdf"
KURLAR_PDF = CATALOGUE_DIR / "Kurlar-Product-Catalogue-2025.pdf"
CORRECTIONS_FILE = Path(__file__).resolve().parent / "pump-curve-corrections.json"

MOTOR_PAGE = 38  # 1-based, in the Kurlar catalogue
# One data-sheet page per motor bore, each carrying an electrical table and a
# dimensions table for that bore's whole KM range.
MOTOR_DETAIL_PAGES = (40, 42, 44, 46)
# The mains voltage the motor ratings are quoted against for this market. The
# catalogue tabulates 380 / 400 / 415 V; Egypt runs 380 V, so that is the row that
# reaches the data sheet. The others are extracted too, so switching is a one-line
# change rather than a re-extraction.
PRIMARY_VOLTAGE = 380

# Tripwire: if a catalogue is replaced and a family vanishes or appears, fail
# loudly rather than quietly shipping a different product range.
EXPECTED_FAMILIES = {
    "K6SX-36", "K6SX-48", "K6SX-60", "K6SX-72",
    "K8SX-80", "K8SX-96", "K8SX-112", "K8SX-128", "K8SX-144",
    "K10SX-200", "K10SX-225", "K10SX-250", "K10SX-275",
    "KP-610", "KP-617", "KP-624", "KP-630", "KP-638", "KP-646", "KP-660",
    "KP-877", "KP-895", "KP-898",
    "KP-10110", "KP-10125", "KP-10160", "KP-10215",
}

MODEL_RE = re.compile(r"^(K(?:6|8|10)SX-\d+/\d+[AB]{0,4}|KP-?\d+/\d+)$")
TRIM_RE = re.compile(r"^(A{1,4}|B{1,4})$")
BORE_FRAGMENT_RE = re.compile(r"^\d+(?:''|\")-?$|^\d+(?:''|\")(?:-\d+(?:''|\"))*-?$")
NUMERIC_RE = re.compile(r"^\d+(?:[.,]\d+)?$")
# Rendered as an en/em dash or hyphen depending on the page: "no data at this flow".
NULL_CELL_RE = re.compile(r"^[-‐-―]+$")

# Table rows are ~11.9pt apart and words within one row vary by <0.5pt, so any
# gap threshold comfortably between the two works. It has to be a gap from the
# PREVIOUS word rather than from the cluster's first word: these pages interleave
# a 6.5pt component list with the 8pt table, and anchoring to the first word lets
# a cluster drift wide enough to swallow the next row's cells.
ROW_GAP = 4.0


def to_num(text: str) -> float:
    """Kurlar mixes ',' and '.' as the decimal separator, sometimes on one page."""
    return float(text.replace(",", "."))


def center(word: dict) -> float:
    return (word["x0"] + word["x1"]) / 2.0


def cluster_rows(words: list[dict], gap: float = ROW_GAP) -> list[list[dict]]:
    """Group words into visual rows by vertical position."""
    rows: list[list[dict]] = []
    previous_top = None
    for word in sorted(words, key=lambda w: (w["top"], w["x0"])):
        if previous_top is not None and word["top"] - previous_top <= gap:
            rows[-1].append(word)
        else:
            rows.append([word])
        previous_top = word["top"]
    return [sorted(row, key=lambda w: w["x0"]) for row in rows]


def parse_family_code(code: str) -> dict | None:
    """
    The digits in a Kurlar model code are the bore diameter followed by the
    nominal (best-efficiency) flow in m3/h:

        K6SX-36   -> 6",  36 m3/h        KP-610   -> 6",  10 m3/h
        K10SX-250 -> 10", 250 m3/h       KP-10160 -> 10", 160 m3/h

    qNom is the model's nominal duty. It usually, but not always, coincides with
    one of the printed flow breakpoints — KP-630's are 0/8/16/24/28/32/39, with
    the nominal 30 falling between two of them.
    """
    ksx = re.fullmatch(r"K(6|8|10)SX-(\d+)", code)
    if ksx:
        return {"series": "KSX", "boreInch": int(ksx.group(1)), "qNomM3h": int(ksx.group(2))}
    kp = re.fullmatch(r"KP-(\d+)", code)
    if kp:
        digits = kp.group(1)
        if digits.startswith("10") and len(digits) >= 4:
            return {"series": "KP", "boreInch": 10, "qNomM3h": int(digits[2:])}
        return {"series": "KP", "boreInch": int(digits[0]), "qNomM3h": int(digits[1:])}
    return None


class Header:
    """Column geometry for one pump table, read off its two header rows."""

    def __init__(self, m3h_row: list[dict], ls_row: list[dict]):
        self.flow_m3h, self.flow_x, tail = self._flow_columns(m3h_row, "m3/h")
        self.flow_ls, _, _ = self._flow_columns(ls_row, "l/s")

        self.kw_x = self._anchor(m3h_row, "kW")
        self.hp_x = self._anchor(m3h_row, "HP")
        self.mm_x = self._anchor(tail, "mm")
        self.kg_x = self._anchor(tail, "kg")

        # The table's horizontal band runs from the `POMPA TİPİ` label to the right
        # edge of the `kg` column. It must NOT be taken from the header row's full
        # extent: on most pages that same row also carries the component-list
        # header to the right and a chart axis label to the left, and including
        # either lets foreign text into the rows — merging adjacent table rows, or
        # exposing stray single letters that read as trim markers.
        pompa = next((w for w in m3h_row if w["text"].startswith("POMPA")), None)
        kg = next((w for w in tail if w["text"] == "kg"), None)
        if pompa is None or kg is None:
            raise ValueError("cannot bound the table: missing POMPA or kg header")
        self.left = pompa["x0"] - 25
        self.right = kg["x1"] + 25

    @staticmethod
    def _flow_columns(row: list[dict], label: str):
        """Numeric words after the unit label, up to the non-numeric one that ends the block."""
        idx = next((i for i, w in enumerate(row) if w["text"] == label), None)
        if idx is None:
            raise ValueError(f"no {label!r} in header row")
        values, centers = [], []
        i = idx + 1
        while i < len(row) and NUMERIC_RE.match(row[i]["text"]):
            values.append(to_num(row[i]["text"]))
            centers.append(center(row[i]))
            i += 1
        return values, centers, row[i:]

    @staticmethod
    def _anchor(row: list[dict], label: str) -> float:
        word = next((w for w in row if w["text"] == label), None)
        if word is None:
            raise ValueError(f"no {label!r} column in header")
        return center(word)

    def nearest_flow_column(self, x: float) -> int | None:
        best, best_d = None, 1e9
        for i, cx in enumerate(self.flow_x):
            d = abs(cx - x)
            if d < best_d:
                best, best_d = i, d
        # Flow columns sit ~22pt apart; half that keeps assignment unambiguous.
        return best if best_d <= 11 else None


def parse_variant(row: list[dict], header: Header) -> dict | None:
    """One visual row -> a variant, using column geometry for every field."""
    model_word = next((w for w in row if MODEL_RE.match(w["text"])), None)
    if model_word is None:
        return None

    model = model_word["text"]
    if model.startswith("KP") and not model.startswith("KP-"):
        model = "KP-" + model[2:]

    # Left block: everything whose right edge clears the kW column — the model,
    # its trim marker, and the bore-combo fragments.
    left = [w for w in row if w["x1"] <= header.kw_x - 6 and w is not model_word]

    trim = None
    attached = re.search(r"/(\d+)(A{1,4}|B{1,4})$", model)
    if attached:
        trim = attached.group(2)
        model = model[: -len(trim)]
    else:
        marker = next((w for w in left if TRIM_RE.match(w["text"])), None)
        if marker is not None:
            trim = marker["text"]

    stages = int(model.split("/")[1])

    bore_text = "".join(
        w["text"] for w in left if BORE_FRAGMENT_RE.match(w["text"])
    ).replace("''", '"')
    bores = [int(n) for n in re.findall(r"(\d+)\"", bore_text)]
    if not bores:
        return None

    def column_value(anchor: float, tolerance: float = 12.0):
        best, best_d = None, 1e9
        for w in row:
            d = abs(center(w) - anchor)
            if d < best_d and d <= tolerance:
                best, best_d = w, d
        return best

    kw_word = column_value(header.kw_x)
    hp_word = column_value(header.hp_x)
    if kw_word is None or hp_word is None:
        return None
    if not NUMERIC_RE.match(kw_word["text"]) or not NUMERIC_RE.match(hp_word["text"]):
        return None

    heads: list[float | None] = [None] * len(header.flow_m3h)
    for w in row:
        if w is model_word or w is kw_word or w is hp_word:
            continue
        is_value = NUMERIC_RE.match(w["text"])
        is_null = NULL_CELL_RE.match(w["text"])
        if not (is_value or is_null):
            continue
        col = header.nearest_flow_column(center(w))
        if col is None:
            continue
        if heads[col] is not None:
            return None  # two words in one flow column: geometry is off, don't guess
        heads[col] = to_num(w["text"]) if is_value else None

    # Head 0 is shut-off (zero flow) and is always printed; if it is missing the
    # row was not a data row at all.
    if heads[0] is None:
        return None

    length_word = column_value(header.mm_x, 14.0)
    weight_word = column_value(header.kg_x, 14.0)
    if length_word is None or weight_word is None:
        return None
    if not NUMERIC_RE.match(length_word["text"]) or not NUMERIC_RE.match(weight_word["text"]):
        return None

    return {
        # `model` alone is NOT unique: the reduced-impeller trims of a given stage
        # count share it (K10SX-200/1 exists as /1B, /1A and /1). `code` is the
        # full catalogue designation and is the identifier used in URLs.
        "code": f"{model}{trim or ''}",
        "model": model,
        "stages": stages,
        "trim": trim,
        "motorKw": to_num(kw_word["text"]),
        "motorHp": to_num(hp_word["text"]),
        "motorBores": bores,
        "headsM": heads,
        "lengthMm": int(to_num(length_word["text"])),
        "weightKg": to_num(weight_word["text"]),
    }


def parse_outlet(rows: list[list[dict]]) -> str | None:
    """
    `Outlet Connection / Cikis Baglantisi` in the page footer, e.g. `BSP 4"`.

    Taken at family level: the in-table outlet cell is vertically merged across
    groups of rows, so per-row extraction yields fragments ("+", "FLANGE", "DN",
    "80"). The footer states it once, unambiguously. Outlet is display-only — it
    never affects selection — so family granularity is sufficient.
    """
    for i, row in enumerate(rows):
        texts = [w["text"] for w in row]
        if "Outlet" not in texts or "Connection" not in texts:
            continue
        label_x = row[texts.index("Outlet")]["x0"]
        for below in rows[i + 1 : i + 3]:
            candidates = sorted(
                (w for w in below if w["x0"] >= label_x - 8), key=lambda w: w["x0"]
            )
            # Walk right while words stay adjacent; the wide gap to the next
            # footer column ("Outlet / Çıkış: AISI 304") ends the value.
            value: list[str] = []
            previous_x1 = None
            for w in candidates:
                if previous_x1 is not None and w["x0"] - previous_x1 > 20:
                    break
                value.append(w["text"])
                previous_x1 = w["x1"]
            if value:
                return " ".join(value).replace("''", '"')
    return None


def parse_page(page, page_no: int, source: str) -> dict | None:
    words = page.extract_words()
    rows = cluster_rows(words)

    m3h_row = next((r for r in rows if any(w["text"] == "m3/h" for w in r)), None)
    ls_row = next((r for r in rows if any(w["text"] == "l/s" for w in r)), None)
    if m3h_row is None or ls_row is None:
        return None

    try:
        header = Header(m3h_row, ls_row)
    except ValueError:
        return None
    if len(header.flow_m3h) != len(header.flow_ls) or len(header.flow_m3h) < 4:
        return None

    # Re-cluster using only words inside the table's horizontal band. Several
    # pages overlay a performance chart and a component list on the same vertical
    # band as the table; excluding them first is what makes row clustering
    # unambiguous, since only table cells remain and they are ~11.9pt apart.
    table_rows = cluster_rows(
        [w for w in words if header.left <= center(w) <= header.right]
    )
    variants = [v for v in (parse_variant(r, header) for r in table_rows) if v]
    if len(variants) < 3:
        return None

    family_code = variants[0]["model"].split("/")[0]
    meta = parse_family_code(family_code)
    if meta is None:
        return None

    strays = {v["model"].split("/")[0] for v in variants} - {family_code}
    if strays:
        raise SystemExit(
            f"{source} p{page_no}: expected only {family_code}, also matched {sorted(strays)}"
        )

    return {
        "code": family_code,
        "series": meta["series"],
        "boreInch": meta["boreInch"],
        "qNomM3h": meta["qNomM3h"],
        "productSlug": "pump-cast-stainless" if meta["series"] == "KSX" else "pump-submersible",
        "outlet": parse_outlet(rows),
        "flowPointsM3h": header.flow_m3h,
        "flowPointsLs": header.flow_ls,
        "sourcePdf": source,
        "sourcePage": page_no,
        "variants": variants,
    }


def extract_families(pdf_path: Path) -> list[dict]:
    families = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            family = parse_page(page, i, pdf_path.name)
            if family:
                families.append(family)
    return families


def extract_motors(pdf_path: Path) -> list[dict]:
    """
    Page 38 tabulates every motor as `KM6-30  30  22  3x6  1  3x4  2  4  15`
    = code, HP, kW, then cable-selection data (D.O.L. mm2 / runs, wye-delta mm2 /
    runs, max cable length m, max starts/hour). Only code/bore/HP/kW are taken;
    the cable columns are where a future cable-sizing feature would read from.
    """
    motors: dict[str, dict] = {}
    with pdfplumber.open(str(pdf_path)) as pdf:
        rows = cluster_rows(pdf.pages[MOTOR_PAGE - 1].extract_words())
    for row in rows:
        texts = [w["text"] for w in row]
        for i, text in enumerate(texts):
            m = re.fullmatch(r"KM(6|7|8|10)-(\d+(?:\.\d+)?)", text)
            if not m or i + 2 >= len(texts):
                continue
            hp_text, kw_text = texts[i + 1], texts[i + 2]
            if not NUMERIC_RE.match(hp_text) or not NUMERIC_RE.match(kw_text):
                continue
            if to_num(hp_text) != to_num(m.group(2)):
                raise SystemExit(
                    f"motor {text}: HP column {hp_text} disagrees with code suffix {m.group(2)}"
                )
            motors[text] = {
                "code": text,
                "boreInch": int(m.group(1)),
                "hp": to_num(hp_text),
                "kw": to_num(kw_text),
            }
    return sorted(motors.values(), key=lambda m: (m["boreInch"], m["hp"]))


MOTOR_CODE_RE = re.compile(r"^KM(6|7|8|10)-(\d+(?:\.\d+)?)$")


ELECTRICAL_HEADER = ["HP", "kW", "V", "rpm", "A", "A", "50", "75", "100",
                     "50", "75", "100", "Nm", "Nm", "kN"]
DIMENSIONS_HEADER = ["HP", "kW", "mm", "kg", "cm", "cm", "cm", "kg"]


def _columns(rows: list[list[dict]], header: list[str]) -> list[float] | None:
    """
    x-centres of a table's columns, found by matching the header's exact label
    sequence anywhere in a row.

    Taking "the row that mentions `mm`" and slicing its first N words is not safe:
    on two of the four pages the dimensions header shares a row with a data line
    from the other table, so the slice returns that line's values as if they were
    column positions. Requiring the full label sequence cannot match a data row.
    """
    width = len(header)
    for row in rows:
        texts = [w["text"] for w in row]
        for start in range(len(texts) - width + 1):
            if texts[start:start + width] == header:
                return [center(w) for w in row[start:start + width]]
    return None


def _cells(words: list[dict], anchors: list[float], tolerance: float = 13.0) -> list[str | None]:
    """One visual row mapped onto a header's columns by horizontal position."""
    out: list[str | None] = [None] * len(anchors)
    for word in words:
        distances = [(abs(center(word) - a), i) for i, a in enumerate(anchors)]
        distance, index = min(distances)
        if distance <= tolerance and out[index] is None:
            out[index] = word["text"]
    return out


def extract_motor_details(pdf_path: Path) -> dict[str, dict]:
    """
    The per-bore motor data sheets: rated speed, current, efficiency and power factor
    at 380/400/415 V, plus overall length and weight.

    These are what turn a selection into something orderable - the installer needs
    the total length going down the borehole and the current the starter has to
    carry, and the customer needs the motor efficiency that (with the pump
    efficiency) sets the running cost. Read by column geometry for the same reason
    the pump tables are: each page interleaves two tables and a photo caption, and
    reconstructed text layout merges cells across them.

    Rows are grouped tightly (2pt): a motor occupies three consecutive voltage rows
    only ~12pt apart, and a looser threshold merges them into one row of doubled
    values.

    A voltage row is attributed to the motor whose code sits nearest it vertically,
    NOT to the last code seen while scanning down. The code is printed once per
    motor, vertically centred across its three-row block, so it lines up with the
    middle (400 V) row - a running "current code" therefore mis-assigns the 380 V
    row of every motor to the one above it.
    """
    with pdfplumber.open(str(pdf_path)) as pdf:
        pages = {n: pdf.pages[n - 1].extract_words() for n in MOTOR_DETAIL_PAGES}

    # Transcription repairs for cells the catalogue mis-prints, asserted against
    # what is actually on the page so a re-issued catalogue cannot be silently
    # rewritten with a stale fix. Same contract as the head-value corrections.
    spec = json.loads(CORRECTIONS_FILE.read_text(encoding="utf-8"))
    fixes = {
        (f["code"], f["voltage"], f["field"]): f
        for f in spec.get("motorCorrections", [])
    }
    used: set[tuple[str, str, str]] = set()

    def middle(word: dict) -> float:
        return (word["top"] + word["bottom"]) / 2

    details: dict[str, dict] = {}
    for page_no, words in pages.items():
        rows = cluster_rows(words, gap=2.0)
        electrical = _columns(rows, ELECTRICAL_HEADER)
        dimensions = _columns(rows, DIMENSIONS_HEADER)
        if electrical is None or dimensions is None:
            raise SystemExit(f"motor page {page_no}: could not locate both table headers")

        codes = [w for w in words if MOTOR_CODE_RE.match(w["text"])]
        left_codes = [w for w in codes if center(w) < electrical[0]]
        right_codes = [w for w in codes if dimensions[0] - 60 < center(w) < dimensions[0]]
        if not left_codes or not right_codes:
            raise SystemExit(f"motor page {page_no}: no motor codes beside one of the tables")

        def number(cells: list[str | None], index: int) -> float | None:
            value = cells[index]
            return to_num(value) if value and NUMERIC_RE.match(value) else None

        # Electrical rows are read by snapping to the table's own pitch rather than
        # by clustering. Clustering chains words whose baselines differ by a point
        # or two, and on a handful of motors that bridges two voltage rows into one
        # - silently dropping whichever value lands in an already-filled column.
        # The layout is strictly regular, so the geometry can simply be asserted:
        # each code is centred on its block, with one voltage row per third of it.
        left_codes.sort(key=middle)
        pitches = [middle(b) - middle(a) for a, b in zip(left_codes, left_codes[1:])]
        pitches.sort()
        block = pitches[len(pitches) // 2] if pitches else 0.0
        if not 30 <= block <= 42:
            raise SystemExit(f"motor page {page_no}: unexpected row block pitch {block:.1f}pt")
        step = block / 3

        table_words = [
            w for w in words
            if electrical[0] - 20 <= center(w) <= electrical[-1] + 20
        ]
        for code_word in left_codes:
            entry = details.setdefault(code_word["text"], {"byVoltage": {}})
            for offset, voltage in ((-step, 380), (0.0, 400), (step, 415)):
                target = middle(code_word) + offset
                line = [w for w in table_words if abs(middle(w) - target) <= step / 3]
                cells = _cells(line, electrical)
                read = number(cells, 2)
                if read is None or int(read) != voltage:
                    continue

                def field(index: int, name: str) -> float | None:
                    key = (code_word["text"], str(voltage), name)
                    fix = fixes.get(key)
                    if fix is None:
                        return number(cells, index)
                    if cells[index] != fix["printed"]:
                        raise SystemExit(
                            f"motor correction {key}: expected the catalogue to print"
                            f" {fix['printed']!r}, it now reads {cells[index]!r}"
                            f" - re-review before trusting this repair"
                        )
                    used.add(key)
                    return fix["corrected"]

                speed = field(3, "rpm")
                entry["byVoltage"][str(voltage)] = {
                    "rpm": int(speed) if speed else None,
                    "currentA": field(4, "currentA"),
                    "startingCurrentA": field(5, "startingCurrentA"),
                    "efficiencyPct": field(8, "efficiencyPct"),
                    "cosPhi": field(11, "cosPhi"),
                }

        # Dimensions table: one row per motor, and its code shares that row. The
        # window has to start left of the HP column to include the code itself.
        for row in rows:
            right = [w for w in row if center(w) >= dimensions[0] - 70]
            code_word = next((w for w in right if MOTOR_CODE_RE.match(w["text"])), None)
            if code_word is None:
                continue
            cells = _cells([w for w in right if w is not code_word], dimensions)
            entry = details.setdefault(code_word["text"], {"byVoltage": {}})
            length = number(cells, 2)
            weight = number(cells, 3)
            if length:
                entry["lengthMm"] = int(length)
            if weight:
                entry["weightKg"] = weight

    unused = set(fixes) - used
    if unused:
        raise SystemExit(f"motor corrections never applied: {sorted(unused)}")
    return details


def apply_corrections(families: list[dict]) -> tuple[int, int]:
    """
    Applies scripts/pump-curve-corrections.json: repairs individual mis-printed
    head cells and drops variants whose printed curve is unreliable throughout.

    Each correction asserts the value it expects to overwrite, so a replaced
    catalogue can never be silently rewritten with stale repairs.
    """
    spec = json.loads(CORRECTIONS_FILE.read_text(encoding="utf-8"))
    by_code = {v["code"]: (f, v) for f in families for v in f["variants"]}

    for fix in spec["corrections"]:
        entry = by_code.get(fix["code"])
        if entry is None:
            raise SystemExit(f"correction targets unknown variant {fix['code']}")
        family, variant = entry
        column = fix["column"]
        if family["flowPointsM3h"][column] != fix["flowM3h"]:
            raise SystemExit(
                f"correction {fix['code']} col {column}: expected flow {fix['flowM3h']} m3/h,"
                f" catalogue now says {family['flowPointsM3h'][column]}"
            )
        if variant["headsM"][column] != fix["printed"]:
            raise SystemExit(
                f"correction {fix['code']} col {column}: expected printed {fix['printed']} m,"
                f" catalogue now says {variant['headsM'][column]} — re-review before trusting this repair"
            )
        variant["headsM"][column] = fix["corrected"]
        variant.setdefault("correctedColumns", []).append(column)

    excluded = {e["code"] for e in spec["exclusions"]}
    unknown = excluded - by_code.keys()
    if unknown:
        raise SystemExit(f"exclusions target unknown variants: {sorted(unknown)}")
    for family in families:
        family["variants"] = [v for v in family["variants"] if v["code"] not in excluded]

    return len(spec["corrections"]), len(excluded)


def main() -> None:
    for pdf in (KSX_PDF, KURLAR_PDF):
        if not pdf.exists():
            raise SystemExit(f"missing catalogue PDF: {pdf}")

    print("Extracting KSX catalogue...")
    ksx = extract_families(KSX_PDF)
    print(f"  {len(ksx)} families, {sum(len(f['variants']) for f in ksx)} variants")

    print("Extracting Kurlar 2025 catalogue...")
    # 4" KPN/KPS never match parse_family_code and drop out on their own; the
    # bore filter guards against anything else unexpected (a future 12" line).
    kp = [f for f in extract_families(KURLAR_PDF) if f["boreInch"] >= 6]
    print(f"  {len(kp)} families, {sum(len(f['variants']) for f in kp)} variants")

    families = ksx + kp
    found = {f["code"] for f in families}
    missing = EXPECTED_FAMILIES - found
    unexpected = found - EXPECTED_FAMILIES
    if missing or unexpected:
        raise SystemExit(
            f"family set changed - missing: {sorted(missing)}, unexpected: {sorted(unexpected)}"
        )

    corrected, dropped = apply_corrections(families)
    print(
        f"Applied corrections: {corrected} mis-printed head cells repaired,"
        f" {dropped} unreliable variants withheld"
    )

    print("Reading efficiency / NPSH curves off the chart pages...")
    charts, chart_warnings = extract_chart_data([KSX_PDF, KURLAR_PDF], families)
    for family in families:
        entry = charts.get(family["code"])
        if entry is None:
            continue
        family["etaPct"] = entry["etaPct"]
        family["npshM"] = entry["npshM"]
        if "bandM3h" in entry:
            family["bandM3h"] = entry["bandM3h"]
    print(f"  {len(charts)}/{len(families)} families have an efficiency curve")
    for warning in chart_warnings:
        print(f"  ! {warning}")

    print("Extracting KM motor ladder...")
    motors = extract_motors(KURLAR_PDF)
    details = extract_motor_details(KURLAR_PDF)
    missing = [m["code"] for m in motors if m["code"] not in details]
    if missing:
        raise SystemExit(f"no data sheet found for motors: {missing}")
    for motor in motors:
        detail = details[motor["code"]]
        rated = detail["byVoltage"].get(str(PRIMARY_VOLTAGE))
        if rated is None:
            raise SystemExit(f"{motor['code']}: no {PRIMARY_VOLTAGE} V row on its data sheet")
        motor.update(rated)
        motor["voltage"] = PRIMARY_VOLTAGE
        motor["lengthMm"] = detail.get("lengthMm")
        motor["weightKg"] = detail.get("weightKg")
    incomplete = [
        m["code"] for m in motors
        if not all(m.get(k) for k in ("rpm", "currentA", "cosPhi", "efficiencyPct",
                                      "lengthMm", "weightKg"))
    ]
    if incomplete:
        raise SystemExit(f"incomplete motor data sheets: {incomplete}")
    print(f"  {len(motors)} motor codes, all with full {PRIMARY_VOLTAGE} V data sheets")

    (DATA_DIR / "pump-curves.json").write_text(
        json.dumps(families, indent=2) + "\n", encoding="utf-8"
    )
    (DATA_DIR / "km-motors.json").write_text(
        json.dumps(motors, indent=2) + "\n", encoding="utf-8"
    )

    total = sum(len(f["variants"]) for f in families)
    print(f"\nWrote src/data/pump-curves.json ({len(families)} families, {total} variants)")
    print(f"Wrote src/data/km-motors.json ({len(motors)} motors)")
    print("\nNow run: node scripts/verify-pump-curves.mjs")


if __name__ == "__main__":
    sys.exit(main())
