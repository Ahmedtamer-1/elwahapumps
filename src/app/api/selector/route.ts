import { NextResponse } from "next/server";
import { catalogueLimits, selectFromCatalogue } from "@/lib/pump-data";
import { isFlowUnit, isHeadUnit, toM3h, toMeters, type FlowUnit, type HeadUnit } from "@/lib/pump-selector";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawFlow = (searchParams.get("q") ?? "").trim();
  const rawHead = (searchParams.get("h") ?? "").trim();
  const flowUnit: FlowUnit = isFlowUnit(searchParams.get("qu") ?? "") ? (searchParams.get("qu") as FlowUnit) : "m3h";
  const headUnit: HeadUnit = isHeadUnit(searchParams.get("hu") ?? "") ? (searchParams.get("hu") as HeadUnit) : "m";

  const flowValue = Number(rawFlow.replace(",", "."));
  const headValue = Number(rawHead.replace(",", "."));
  const usable = Number.isFinite(flowValue) && Number.isFinite(headValue) && flowValue > 0 && headValue > 0;

  if (!usable) {
    return NextResponse.json(
      { error: "Provide q (flow) and h (head) as positive numbers. Optional qu: m3h|ls|lmin, hu: m|bar." },
      { status: 400 },
    );
  }

  const qM3h = toM3h(flowValue, flowUnit);
  const hM = toMeters(headValue, headUnit);
  const limits = catalogueLimits();
  const result = selectFromCatalogue({ qM3h, hM });

  const serializeCandidate = (c: (typeof result)["top"]) =>
    c && {
      family: c.family.code,
      productSlug: c.family.productSlug,
      variantCode: c.variant.code,
      headM: c.headM,
      headExcess: c.headExcess,
      bepDistance: c.bepDistance,
      zone: c.zone,
      etaPct: c.etaPct,
      npshM: c.npshM,
      hydraulicKw: c.hydraulicKw,
      shaftKw: c.shaftKw,
      motorLoad: c.motorLoad,
    };

  return NextResponse.json(
    {
      request: { qM3h, hM },
      limits,
      status: result.status,
      matchCount: result.matchCount,
      appliedCapPct: result.appliedCapPct,
      bestAvailableHeadM: result.bestAvailableHeadM,
      top: serializeCandidate(result.top),
      alternatives: result.alternatives.map(serializeCandidate),
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
