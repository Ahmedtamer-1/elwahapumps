import React from "react";
import Link from "next/link";
import { AlertTriangle, FileText, Info } from "lucide-react";

import { getDictionary, hasLocale, Locale } from "../dictionaries";
import PerformanceChart from "@/components/selector/PerformanceChart";
import SelectorForm from "@/components/selector/SelectorForm";
import { catalogueLimits, motorOptionsFor, selectFromCatalogue } from "@/lib/pump-data";
import { localizedAlternates } from "@/lib/seo";
import {
  assembly,
  curveOf,
  fromM3h,
  isFlowUnit,
  isHeadUnit,
  resolveMotor,
  toM3h,
  toMeters,
  type Candidate,
  type FlowUnit,
  type HeadUnit,
} from "@/lib/pump-selector";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const query = await searchParams;
  // Bare /selector is a genuine, indexable page; a result URL with
  // flow/head parameters is a near-duplicate of every other duty point —
  // noindex those and canonicalise to the bare form (S1-T08).
  const hasQuery = Object.keys(query).length > 0;
  return {
    title: dict.pumpSelector.title,
    description: dict.pumpSelector.subtitle,
    alternates: localizedAlternates(lang, "/selector"),
    robots: hasQuery ? { index: false, follow: true } : undefined,
  };
}

const one = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

/** Substitutes {name} placeholders in a dictionary string. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

const round = (value: number, places = 1): string =>
  value.toFixed(places).replace(/\.0+$/, "");

export default async function SelectorPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const query = await searchParams;
  const dict = await getDictionary(lang as Locale);
  const t = dict.pumpSelector as unknown as Record<string, string>;
  const base = `/${lang}/selector`;

  const rawFlow = one(query.q).trim();
  const rawHead = one(query.h).trim();
  const flowUnit: FlowUnit = isFlowUnit(one(query.qu)) ? (one(query.qu) as FlowUnit) : "m3h";
  const headUnit: HeadUnit = isHeadUnit(one(query.hu)) ? (one(query.hu) as HeadUnit) : "m";

  const flowValue = Number(rawFlow.replace(",", "."));
  const headValue = Number(rawHead.replace(",", "."));
  const submitted = rawFlow !== "" || rawHead !== "";
  const usable =
    Number.isFinite(flowValue) && Number.isFinite(headValue) && flowValue > 0 && headValue > 0;

  const limits = catalogueLimits();
  const qM3h = usable ? toM3h(flowValue, flowUnit) : 0;
  const hM = usable ? toMeters(headValue, headUnit) : 0;
  const result = usable ? selectFromCatalogue({ qM3h, hM }) : null;

  // The customer's own units are used everywhere the number is theirs, so the page
  // never silently answers a question in units they did not ask it in.
  const showFlow = (m3h: number) => `${round(fromM3h(m3h, flowUnit))} ${t[flowUnitKey(flowUnit)]}`;
  const flowAxisLabel = `Q (${t.unitM3h})`;

  const shortlist: Candidate[] = result?.top ? [result.top, ...result.alternatives] : [];
  const requested = one(query.pick);
  const chosen = shortlist.find((c) => c.variant.code === requested) ?? result?.top ?? null;

  return (
    /* The page used to be pine end to end, which made a results plate of
       specification tables read as marketing. It is now an ink header band
       carrying the query, and a white plate carrying the answer. */
    <div className="min-h-screen bg-white pb-20">
      <section className="bg-ink px-4 sm:px-6 lg:px-8 pt-28 pb-10">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 lg:items-end">
          <div className="lg:col-span-7">
            <span className="spec-label text-brass block">{t.eyebrow}</span>
            <h1 className="mt-3.5 text-h2 md:text-h1 font-extrabold text-bone text-balance">
              {t.title}
            </h1>
            <p className="mt-4 text-small leading-6 text-bone/70 max-w-[56ch]">{t.subtitle}</p>
          </div>

          {/* The query sits beside the headline rather than under it: on a
              results page the duty point is a control the reader keeps
              adjusting, not an introduction they read once. */}
          <div className="lg:col-span-5">
            <SelectorForm
              dict={t}
              flow={rawFlow}
              flowUnit={flowUnit}
              head={rawHead}
              headUnit={headUnit}
              action={base}
              tone="ink"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto mt-12 max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">

        {!submitted && (
          <Panel>
            <h2 className="text-h3 font-extrabold text-pine">{t.emptyTitle}</h2>
            <p className="mt-2 text-small leading-6 text-stone">{t.emptyBody}</p>
            <p className="mt-2 font-mono text-[11px] leading-5 text-stone-light">
              {fill(t.emptyRangeNote, {
                maxFlow: Math.round(limits.maxFlowM3h),
                maxHead: Math.round(limits.maxHeadM),
              })}
            </p>
          </Panel>
        )}

        {submitted && !usable && (
          <Notice tone="warn" text={t.invalidInput} />
        )}

        {result && result.status === "no-match" && (
          <Panel>
            <h2 className="text-h3 font-extrabold text-pine">{t.noMatchTitle}</h2>
            <p className="mt-2 text-small leading-6 text-stone">
              {result.bestAvailableHeadM === null
                ? fill(t.noMatchOutOfRange, {
                    flow: showFlow(qM3h),
                    maxFlow: Math.round(limits.maxFlowM3h),
                  })
                : fill(t.noMatchBestAvailable, {
                    flow: showFlow(qM3h),
                    best: Math.round(result.bestAvailableHeadM),
                    target: Math.round(hM),
                  })}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="mt-5 inline-block bg-pine px-6 py-3.5 text-[13px] font-semibold text-bone transition-colors hover:bg-field"
            >
              {t.noMatchContact}
            </Link>
          </Panel>
        )}

        {result && chosen && (
          <Results
            t={t}
            lang={lang}
            base={base}
            result={result}
            chosen={chosen}
            shortlist={shortlist}
            qM3h={qM3h}
            hM={hM}
            flowUnit={flowUnit}
            headUnit={headUnit}
            rawFlow={rawFlow}
            rawHead={rawHead}
            motorHp={one(query.motor)}
            flowAxisLabel={flowAxisLabel}
          />
        )}

        <p className="border-t border-rule pt-6 font-mono text-[11px] leading-5 text-stone">
          {t.sourceNote} {t.notAdvice}
        </p>
      </div>
    </div>
  );
}

function flowUnitKey(unit: FlowUnit): string {
  return unit === "m3h" ? "unitM3h" : unit === "ls" ? "unitLs" : "unitLmin";
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="border border-rule border-t-2 border-t-pine bg-bone p-6 sm:p-8">{children}</div>;
}

function Notice({ tone, text }: { tone: "warn" | "info"; text: string }) {
  const Icon = tone === "warn" ? AlertTriangle : Info;
  /* Amber is not in the palette; brass is the amber this brand owns. So the
     two notices separate on weight rather than hue — a warning gets the brass
     edge and fill, an aside stays bone and quiet — and the icon already
     distinguishes them a second time. */
  const colour =
    tone === "warn"
      ? "border-brass bg-brass/15 text-ink"
      : "border-rule bg-bone text-stone";
  return (
    <div className={`flex items-start gap-3 border p-4 text-small leading-6 ${colour}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <p>{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// results
// ---------------------------------------------------------------------------

function Results({
  t,
  lang,
  base,
  result,
  chosen,
  shortlist,
  qM3h,
  hM,
  flowUnit,
  headUnit,
  rawFlow,
  rawHead,
  motorHp,
  flowAxisLabel,
}: {
  t: Record<string, string>;
  lang: string;
  base: string;
  result: NonNullable<ReturnType<typeof selectFromCatalogue>>;
  chosen: Candidate;
  shortlist: Candidate[];
  qM3h: number;
  hM: number;
  flowUnit: FlowUnit;
  headUnit: HeadUnit;
  rawFlow: string;
  rawHead: string;
  motorHp: string;
  flowAxisLabel: string;
}) {
  const { family, variant } = chosen;
  const options = motorOptionsFor(variant);
  const requestedHp = Number(motorHp);
  const motor = resolveMotor(options, Number.isFinite(requestedHp) && requestedHp > 0 ? requestedHp : null);
  const fitted = motor.choice?.motor ?? null;
  const dims = assembly(variant, fitted);

  const curve = curveOf(family, variant);
  // One flow axis for all three charts, taken from the head curve because it is
  // the one that spans the pump's whole published range.
  const flowMax = Math.max(qM3h, ...curve.map((p) => p.qM3h));
  const overloaded = chosen.motorLoad !== null && fitted !== null
    ? chosen.shaftKw! / fitted.kw > 1
    : false;
  const loadPct = fitted && chosen.shaftKw !== null ? (chosen.shaftKw / fitted.kw) * 100 : null;

  const keep = (extra: Record<string, string>) => {
    const params = new URLSearchParams({ q: rawFlow, qu: flowUnit, h: rawHead, hu: headUnit });
    for (const [k, v] of Object.entries(extra)) params.set(k, v);
    return `${base}?${params.toString()}`;
  };

  const zoneLabel =
    chosen.zone === "optimal" ? t.zoneOptimal : chosen.zone === "good" ? t.zoneGood : t.zoneAcceptable;
  /* Now read on white, so the chips are filled rather than tinted: a solid
     pine for the best zone, brass-on-ink for good, the status red for
     marginal. Each carries its own label, so colour never says it alone. */
  const zoneColour =
    chosen.zone === "optimal"
      ? "bg-pine text-bone border-pine"
      : chosen.zone === "good"
        ? "bg-brass text-ink border-brass"
        : "bg-error text-on-error border-error";

  return (
    <div className="space-y-8">
      {result.status === "oversized" && <Notice tone="warn" text={t.oversizedNotice} />}
      {variant.correctedColumns?.length ? <Notice tone="warn" text={t.correctedNotice} /> : null}

      {/* The recommendation, on a brass edge — the one plate on the page that
          answers the question that was asked. */}
      <section className="border border-rule border-t-[3px] border-t-brass bg-white p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className={`border px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] ${zoneColour}`}>
            {zoneLabel}
          </span>
          <span className="spec-label text-stone-light">
            {family.series === "KP" ? t.seriesKP : t.seriesKSX} · {family.boreInch}&quot;
          </span>
        </div>

        <span className="spec-label block">{t.resultsTitle}</span>
        <h2 className="mt-2 mb-6 text-h2 font-extrabold text-ink">{variant.code}</h2>

        <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={t.dutyPoint} value={`${round(fromM3h(qM3h, flowUnit))} ${t[flowUnitKey(flowUnit)]}`} sub={`${round(hM)} ${t.unitM}`} />
          <Stat label={t.specDelivered} value={`${round(chosen.headM)} ${t.unitM}`} sub={`+${Math.round(chosen.headExcess * 100)}%`} />
          <Stat
            label={t.specEfficiency}
            value={chosen.etaPct === null ? "—" : `${round(chosen.etaPct)} %`}
            sub={chosen.etaPct === null ? t.efficiencyUnavailable : undefined}
          />
          <Stat
            label={t.specShaftKw}
            value={chosen.shaftKw === null ? "—" : `${round(chosen.shaftKw)} kW`}
            sub={loadPct === null ? undefined : fill(t.specMotorLoadValue, { pct: Math.round(loadPct) })}
            tone={overloaded ? "warn" : undefined}
          />
        </div>

        {overloaded && (
          <div className="mt-4">
            <Notice
              tone="warn"
              text={fill(t.motorOverloadWarning, {
                shaft: round(chosen.shaftKw!),
                motor: String(fitted?.kw ?? ""),
              })}
            />
          </div>
        )}
      </section>

      {/* curves.
          Framed as one instrument panel with a mono header and a legend, so
          the three charts read as three traces off one pump rather than three
          unrelated figures. They stay as separate plots — a single combined
          axis would need three scales on it. */}
      <section className="border border-rule">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule-light px-5 py-4">
          <span className="spec-label">
            {t.chartHead} · {t.chartEfficiency} · {t.chartPower}
          </span>
          <div className="flex flex-wrap gap-4 font-mono text-[11px] text-stone-light">
            <span className="text-pine">— {t.chartHead}</span>
            <span className="text-brass">— {t.chartEfficiency}</span>
            <span className="text-stone">— {t.chartPower}</span>
          </div>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-3">
        <PerformanceChart
          flowLabel={flowAxisLabel}
          flowMax={flowMax}
          band={family.bandM3h}
          emptyLabel={t.chartUnavailable}
          series={{
            label: t.chartHead,
            unit: t.unitM,
            /* Read on white now, so the ramp changes with the ground: pine
               leads because head is the quantity the customer came for, brass
               takes efficiency, and stone carries power. Brass at 1.9:1 on
               white is too weak to lead, but it holds as a 2px stroke against
               the pine it sits beside. */
            colour: "#0e3b2e",
            points: curve.map((p) => [p.qM3h, p.headM] as [number, number]),
            duty: [qM3h, chosen.headM],
          }}
        />
        <PerformanceChart
          flowLabel={flowAxisLabel}
          flowMax={flowMax}
          band={family.bandM3h}
          emptyLabel={t.chartUnavailable}
          series={{
            label: t.chartEfficiency,
            unit: "%",
            colour: "#d2ab5c",
            points: curve
              .filter((p) => p.etaPct !== null)
              .map((p) => [p.qM3h, p.etaPct!] as [number, number]),
            duty: chosen.etaPct === null ? null : [qM3h, chosen.etaPct],
          }}
        />
        <PerformanceChart
          flowLabel={flowAxisLabel}
          flowMax={flowMax}
          band={family.bandM3h}
          emptyLabel={t.chartUnavailable}
          series={{
            label: t.chartPower,
            unit: "kW",
            colour: "#5a5a54",
            points: curve
              .filter((p) => p.shaftKw !== null)
              .map((p) => [p.qM3h, p.shaftKw!] as [number, number]),
            duty: chosen.shaftKw === null ? null : [qM3h, chosen.shaftKw],
          }}
        />
        </div>
      </section>

      {/* datasheet + motor */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="border border-rule bg-white p-6">
          <h3 className="spec-label mb-4">{t.datasheetTitle}</h3>
          <Spec label={t.specSeries} value={family.series === "KP" ? t.seriesKP : t.seriesKSX} />
          <Spec label={t.specStages} value={String(variant.stages)} />
          {variant.trim && <Spec label={t.specTrim} value={variant.trim} />}
          <Spec label={t.specBore} value={`${family.boreInch}"`} />
          {family.outlet && <Spec label={t.specOutlet} value={family.outlet} />}
          <Spec label={t.specRequired} value={`${round(hM)} ${t.unitM}`} />
          <Spec label={t.specDelivered} value={`${round(chosen.headM)} ${t.unitM}`} />
          <Spec label={t.specMargin} value={`+${Math.round(chosen.headExcess * 100)} %`} />
          <Spec
            label={t.specEfficiency}
            value={chosen.etaPct === null ? "—" : `${round(chosen.etaPct)} %`}
          />
          <Spec label={t.specHydraulicKw} value={`${round(chosen.hydraulicKw)} kW`} />
          <Spec
            label={t.specShaftKw}
            value={chosen.shaftKw === null ? "—" : `${round(chosen.shaftKw)} kW`}
          />
          <Spec
            label={t.specNpsh}
            value={chosen.npshM === null ? "—" : `${round(chosen.npshM)} ${t.unitM}`}
          />
          <Spec label={t.specLength} value={`${variant.lengthMm} mm`} />
          <Spec label={t.specWeight} value={`${variant.weightKg} kg`} />
          {fitted && (
            <>
              <Spec label={t.specTotalLength} value={`${dims.lengthMm} mm`} highlight />
              <Spec label={t.specTotalWeight} value={`${dims.weightKg} kg`} highlight />
            </>
          )}
        </div>

        {/* The motor panel takes bone, so the pairing reads as pump-on-white
            and motor-on-paper rather than two identical boxes. */}
        <div className="border border-rule bg-bone p-6">
          <h3 className="spec-label mb-4">{t.motorTitle}</h3>
          {fitted ? (
            <>
              <p className="mb-4 font-mono text-xl font-medium text-ink">{fitted.code}</p>
              <Spec label={t.motorRecommended} value={`${options.recommendedHp} HP (${options.recommendedKw} kW)`} />
              <Spec label={t.motorPower} value={`${fitted.hp} HP (${fitted.kw} kW)`} />
              <Spec
                label={t.specMotorLoad}
                value={loadPct === null ? "—" : `${Math.round(loadPct)} %`}
              />
              <Spec label={t.motorVoltage} value={`${fitted.voltage} V`} />
              <Spec label={t.motorCurrent} value={`${fitted.currentA} A`} />
              <Spec label={t.motorStartingCurrent} value={`${fitted.startingCurrentA} A`} />
              <Spec label={t.motorCosPhi} value={String(fitted.cosPhi)} />
              <Spec label={t.motorEfficiency} value={`${fitted.efficiencyPct} %`} />
              <Spec label={t.motorRpm} value={`${fitted.rpm} rpm`} />
              <Spec label={t.motorLength} value={`${fitted.lengthMm} mm`} />
              <Spec label={t.motorWeight} value={`${fitted.weightKg} kg`} />

              {motor.isUndersized && (
                <div className="mt-4">
                  <Notice
                    tone="warn"
                    text={fill(t.motorUndersizedWarning, { recommended: options.recommendedHp })}
                  />
                </div>
              )}
              {!options.hasExactMatch && (
                <p className="mt-3 font-mono text-[11px] leading-5 text-stone">
                  {fill(t.motorNoExact, { hp: options.recommendedHp })}
                </p>
              )}

              {options.choices.length > 1 && (
                <div className="mt-5">
                  <p className="spec-label mb-2.5">{t.motorChangeLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {options.choices.map((choice) => {
                      const active = choice.motor.code === fitted.code;
                      return (
                        <Link
                          key={choice.motor.code}
                          href={keep({ pick: variant.code, motor: String(choice.motor.hp) })}
                          className={`border px-3 py-1.5 font-mono text-[12px] transition-colors ${
                              active
                              ? "border-pine bg-pine text-bone"
                              : "border-rule bg-white text-ink hover:border-pine"
                          }`}
                        >
                          {choice.motor.hp} HP
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-small leading-6 text-stone">
              {fill(t.motorNoOptions, {
                bores: variant.motorBores.join("/"),
                kw: options.recommendedKw,
                hp: options.recommendedHp,
              })}
            </p>
          )}
        </div>
      </section>

      {/* alternatives */}
      {shortlist.length > 1 && (
        <section>
          {/* Opens on a pine rule with the count as the heading, the way every
              other section on the site opens. */}
          <div className="border-t-2 border-pine pt-4 mb-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
            <div>
              <span className="spec-label block">{t.alternativesTitle}</span>
              <h3 className="mt-2 text-h3 font-extrabold text-pine">
                {shortlist.length === 1
                  ? t.matchCountOne
                  : fill(t.matchCountMany, { count: result.matchCount })}
              </h3>
            </div>
            <p className="text-small leading-6 text-stone max-w-[48ch] pb-1">
              {t.alternativesBody}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <Th>{t.colModel}</Th>
                  <Th>{t.colHead}</Th>
                  <Th>{t.colExcess}</Th>
                  <Th>{t.colBep}</Th>
                  <Th>{t.specShaftKw}</Th>
                  <Th>{t.colMotor}</Th>
                  <Th>{t.colBore}</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {shortlist.map((candidate) => {
                  const active = candidate.variant.code === variant.code;
                  return (
                    <tr
                      key={candidate.variant.code}
                      className={active ? "bg-brass/15" : "bg-white"}
                    >
                      <Td>
                        <span className="font-medium text-ink">{candidate.variant.code}</span>
                      </Td>
                      <Td>{round(candidate.headM)} m</Td>
                      <Td>+{Math.round(candidate.headExcess * 100)} %</Td>
                      <Td>{candidate.etaPct === null ? "—" : `${round(candidate.etaPct)} %`}</Td>
                      <Td>{candidate.shaftKw === null ? "—" : `${round(candidate.shaftKw)} kW`}</Td>
                      <Td>{candidate.variant.motorHp} HP</Td>
                      <Td>{candidate.family.boreInch}&quot;</Td>
                      <Td>
                        {active ? (
                          <span className="spec-label text-pine">{t.motorTagRecommended}</span>
                        ) : (
                          <Link
                            href={keep({ pick: candidate.variant.code })}
                            className="spec-label text-pine hover:text-field transition-colors"
                          >
                            {t.viewDatasheet}
                          </Link>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/${lang}/contact`}
          className="inline-flex items-center gap-2 bg-pine px-7 py-4 text-[13px] font-semibold text-bone transition-colors hover:bg-field"
        >
          {t.noMatchContact}
        </Link>
        <Link
          href={`/${lang}/products/${family.productSlug}`}
          className="inline-flex items-center gap-2 border border-rule px-7 py-4 text-[13px] font-semibold text-pine transition-colors hover:border-pine"
        >
          <FileText size={16} aria-hidden />
          {t.viewProduct}
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "warn";
}) {
  return (
    <div className="bg-white p-4">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-stone-light">
        {label}
      </p>
      {/* Mono, tabular: these are readings off a curve, and a row of them is
          read down the digit. */}
      <p
        className={`mt-1.5 font-mono text-[15px] font-medium tabular-nums ${
          tone === "warn" ? "text-error" : "text-ink"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 font-mono text-[11px] text-stone">{sub}</p>}
    </div>
  );
}

function Spec({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule-light py-2.5 last:border-0">
      <span className="font-mono text-[11.5px] text-stone">{label}</span>
      <span
        className={`font-mono text-[12.5px] tabular-nums ${
          highlight ? "font-medium text-pine" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* One cell style for the alternatives table, matching the spec tables on the
   product pages: bone mono headers, mono cells, figures on the digit. */
const Th = ({ children }: { children?: React.ReactNode }) => (
  <th className="border border-rule-light bg-bone px-3.5 py-2.5 text-start font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-stone whitespace-nowrap">
    {children}
  </th>
);
const Td = ({ children }: { children?: React.ReactNode }) => (
  <td className="border border-rule-light px-3.5 py-2.5 font-mono text-[12.5px] tabular-nums text-ink whitespace-nowrap">
    {children}
  </td>
);
