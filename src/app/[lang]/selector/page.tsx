import React from "react";
import Link from "next/link";
import { AlertTriangle, FileText, Info } from "lucide-react";

import { getDictionary, hasLocale, Locale } from "../dictionaries";
import PerformanceChart from "@/components/selector/PerformanceChart";
import SelectorForm from "@/components/selector/SelectorForm";
import { catalogueLimits, motorOptionsFor, selectFromCatalogue } from "@/lib/pump-data";
import { fill } from "@/lib/format";
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

const round = (value: number, places = 1): string =>
  value.toFixed(places).replace(/\.0+$/, "");

export default async function SelectorPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const query = await searchParams;
  const dict = await getDictionary(lang as Locale);
  const t = dict.pumpSelector;
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
    <div className="min-h-screen bg-black pb-24">
      <section className="relative bg-neutral-950 px-4 pb-10 pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-sky-400">
            {t.eyebrow}
          </p>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{t.title}</h1>
          <p className="max-w-3xl text-neutral-400">{t.subtitle}</p>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl space-y-8 px-4">
        <SelectorForm
          dict={t}
          flow={rawFlow}
          flowUnit={flowUnit}
          head={rawHead}
          headUnit={headUnit}
          action={base}
        />

        {!submitted && (
          <Panel>
            <h2 className="mb-2 text-lg font-semibold text-white">{t.emptyTitle}</h2>
            <p className="text-neutral-400">{t.emptyBody}</p>
            <p className="mt-2 text-sm text-neutral-500">
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
            <h2 className="mb-2 text-lg font-semibold text-white">{t.noMatchTitle}</h2>
            <p className="text-neutral-400">
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
              className="mt-4 inline-block rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-black hover:bg-sky-400"
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

        <p className="border-t border-neutral-900 pt-6 text-xs leading-relaxed text-neutral-600">
          {t.sourceNote} {t.notAdvice}
        </p>
      </div>
    </div>
  );
}

function flowUnitKey(unit: FlowUnit): "unitM3h" | "unitLs" | "unitLmin" {
  return unit === "m3h" ? "unitM3h" : unit === "ls" ? "unitLs" : "unitLmin";
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">{children}</div>
  );
}

function Notice({ tone, text }: { tone: "warn" | "info"; text: string }) {
  const Icon = tone === "warn" ? AlertTriangle : Info;
  const colour =
    tone === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
      : "border-sky-500/40 bg-sky-500/10 text-sky-200";
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${colour}`}>
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
  const zoneColour =
    chosen.zone === "optimal"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : chosen.zone === "good"
        ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
        : "bg-amber-500/15 text-amber-300 border-amber-500/30";

  return (
    <div className="space-y-8">
      {result.status === "oversized" && <Notice tone="warn" text={t.oversizedNotice} />}
      {variant.correctedColumns?.length ? <Notice tone="warn" text={t.correctedNotice} /> : null}

      <section className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">{t.resultsTitle}</p>
            <h2 className="text-3xl font-bold text-white">{variant.code}</h2>
            <p className="mt-1 text-sm text-neutral-400">
              {family.series === "KP" ? t.seriesKP : t.seriesKSX} · {family.boreInch}&quot;
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${zoneColour}`}>
            {zoneLabel}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* curves */}
      <section className="grid gap-4 lg:grid-cols-3">
        <PerformanceChart
          flowLabel={flowAxisLabel}
          flowMax={flowMax}
          band={family.bandM3h}
          emptyLabel={t.chartUnavailable}
          series={{
            label: t.chartHead,
            unit: t.unitM,
            colour: "#38bdf8",
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
            colour: "#34d399",
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
            colour: "#fbbf24",
            points: curve
              .filter((p) => p.shaftKw !== null)
              .map((p) => [p.qM3h, p.shaftKw!] as [number, number]),
            duty: chosen.shaftKw === null ? null : [qM3h, chosen.shaftKw],
          }}
        />
      </section>

      {/* datasheet + motor */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">{t.datasheetTitle}</h3>
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

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">{t.motorTitle}</h3>
          {fitted ? (
            <>
              <p className="mb-3 text-2xl font-bold text-white">{fitted.code}</p>
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
                <p className="mt-3 text-xs text-neutral-500">
                  {fill(t.motorNoExact, { hp: options.recommendedHp })}
                </p>
              )}

              {options.choices.length > 1 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-neutral-300">{t.motorChangeLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {options.choices.map((choice) => {
                      const active = choice.motor.code === fitted.code;
                      return (
                        <Link
                          key={choice.motor.code}
                          href={keep({ pick: variant.code, motor: String(choice.motor.hp) })}
                          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                            active
                              ? "border-sky-400 bg-sky-500/20 text-sky-200"
                              : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
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
            <p className="text-sm text-neutral-400">
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
          <h3 className="text-lg font-semibold text-white">{t.alternativesTitle}</h3>
          <p className="mb-4 text-sm text-neutral-400">
            {shortlist.length === 1
              ? t.matchCountOne
              : fill(t.matchCountMany, { count: result.matchCount })}
          </p>
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-neutral-900 text-neutral-400">
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
                      className={`border-t border-neutral-800 ${active ? "bg-sky-500/10" : ""}`}
                    >
                      <Td>
                        <span className="font-medium text-white">{candidate.variant.code}</span>
                      </Td>
                      <Td>{round(candidate.headM)} m</Td>
                      <Td>+{Math.round(candidate.headExcess * 100)} %</Td>
                      <Td>{candidate.etaPct === null ? "—" : `${round(candidate.etaPct)} %`}</Td>
                      <Td>{candidate.shaftKw === null ? "—" : `${round(candidate.shaftKw)} kW`}</Td>
                      <Td>{candidate.variant.motorHp} HP</Td>
                      <Td>{candidate.family.boreInch}&quot;</Td>
                      <Td>
                        {active ? (
                          <span className="text-xs text-sky-300">●</span>
                        ) : (
                          <Link
                            href={keep({ pick: candidate.variant.code })}
                            className="text-sky-400 hover:text-sky-300"
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
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-black hover:bg-sky-400"
        >
          {t.noMatchContact}
        </Link>
        <Link
          href={`/${lang}/products/${family.productSlug}`}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-5 py-2.5 font-semibold text-neutral-200 hover:border-neutral-500"
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
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone === "warn" ? "text-amber-300" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
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
    <div className="flex items-baseline justify-between gap-4 border-b border-neutral-900 py-2 last:border-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span
        className={`text-sm font-medium ${highlight ? "text-sky-300" : "text-neutral-200"}`}
      >
        {value}
      </span>
    </div>
  );
}

const Th = ({ children }: { children?: React.ReactNode }) => (
  <th className="px-3 py-2.5 text-start font-medium">{children}</th>
);
const Td = ({ children }: { children?: React.ReactNode }) => (
  <td className="px-3 py-2.5 text-neutral-300">{children}</td>
);
