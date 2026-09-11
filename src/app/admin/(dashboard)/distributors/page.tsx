import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader, SubmitButton } from "@/components/admin/ui";
import { toggleDistributorActive } from "@/lib/actions/distributors";
import { REGION_LABELS, REGION_ORDER, type Region } from "@/data/distributors";

export const metadata = { title: "Distributors" };
export const dynamic = "force-dynamic";

export default async function DistributorsAdminPage() {
  await requireUser();

  const distributors = await prisma.distributor.findMany({
    orderBy: [{ region: "asc" }, { sortOrder: "asc" }, { nameEn: "asc" }],
  });

  const liveCount = distributors.filter((d) => d.isActive).length;

  // Grouped the same way the public page groups them, so the admin sees the
  // list in the shape the site renders it.
  const groups = REGION_ORDER.map((region) => ({
    region,
    items: distributors.filter((d) => d.region === region),
  })).filter((g) => g.items.length > 0);

  // Anything with an unrecognised region would vanish from the groups above;
  // collect it so a typo can never hide a row from the person fixing it.
  const known = new Set<string>(REGION_ORDER);
  const orphans = distributors.filter((d) => !known.has(d.region));

  return (
    <>
      <PageHeader
        title="Distributors"
        subtitle={
          distributors.length === 0
            ? "The stockist map and list on the public locations page."
            : `${liveCount} of ${distributors.length} shown on the public locations page.`
        }
        action={
          <Link href="/admin/distributors/new">
            <SubmitButton type="button">New distributor</SubmitButton>
          </Link>
        }
      />

      {distributors.length === 0 ? (
        <Card>
          <EmptyState message="No distributors yet. The locations page shows only the head-office panel until you add one." />
        </Card>
      ) : (
        <div className="space-y-6">
          {[...groups, ...(orphans.length ? [{ region: "" as Region, items: orphans }] : [])].map(
            (group) => (
              <Card
                key={group.region || "unknown"}
                title={
                  group.region
                    ? REGION_LABELS[group.region].en
                    : "Unrecognised region — fix these"
                }
                subtitle={`${group.items.length} distributor${group.items.length === 1 ? "" : "s"}`}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto -mx-5 -mb-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold text-stone uppercase border-b border-rule">
                        <th className="px-5 py-3">Distributor</th>
                        <th className="px-5 py-3 hidden md:table-cell">City</th>
                        <th className="px-5 py-3 hidden lg:table-cell">Pin</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule-light">
                      {group.items.map((d) => (
                        <tr key={d.id} className="hover:bg-bone transition-colors">
                          <td className="px-5 py-3">
                            <Link
                              href={`/admin/distributors/${d.id}`}
                              className="font-semibold text-ink hover:text-emerald-700 block"
                            >
                              {d.nameEn}
                            </Link>
                            <p className="text-xs text-stone" dir="rtl">
                              {d.nameAr}
                            </p>
                            <p className="text-xs text-stone-light font-mono" dir="ltr">
                              {d.phone}
                            </p>
                          </td>
                          <td className="px-5 py-3 hidden md:table-cell text-stone">
                            <span dir="rtl" className="block">
                              {d.cityAr}
                            </span>
                            <span className="text-xs text-stone-light">{d.cityEn}</span>
                          </td>
                          <td className="px-5 py-3 hidden lg:table-cell text-stone font-mono text-xs tabular-nums whitespace-nowrap" dir="ltr">
                            {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                          </td>
                          <td className="px-5 py-3">
                            <form action={toggleDistributorActive}>
                              <input type="hidden" name="id" value={d.id} />
                              <button type="submit" title="Toggle whether this distributor is shown">
                                <Badge
                                  label={d.isActive ? "Live" : "Hidden"}
                                  className={
                                    d.isActive
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-bone text-stone border-rule"
                                  }
                                />
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </>
  );
}
