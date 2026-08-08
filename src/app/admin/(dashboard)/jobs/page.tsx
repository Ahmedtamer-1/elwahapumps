import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader, SubmitButton } from "@/components/admin/ui";
import { toggleJobActive } from "@/lib/actions/jobs";

export const metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

/** Bullets stored as JSON; the count is all this listing needs. */
function requirementCount(raw: string): number {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default async function JobsAdminPage() {
  await requireUser();

  const jobs = await prisma.job.findMany({
    orderBy: [{ sortOrder: "asc" }, { postedOn: "desc" }],
  });

  const liveCount = jobs.filter((j) => j.isActive).length;

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle={
          jobs.length === 0
            ? "Adverts on the public careers page."
            : `${liveCount} of ${jobs.length} published on the public careers page.`
        }
        action={
          <Link href="/admin/jobs/new">
            <SubmitButton type="button">New job</SubmitButton>
          </Link>
        }
      />

      <Card className="overflow-hidden">
        {jobs.length === 0 ? (
          <EmptyState message="No jobs posted yet. The careers page shows only the general-application panel until you add one." />
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-neutral-500 uppercase border-b border-neutral-200">
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3 hidden md:table-cell">Department</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Location</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Posted</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="font-semibold text-neutral-900 hover:text-emerald-700 block"
                      >
                        {job.titleEn}
                      </Link>
                      <p className="text-xs text-neutral-400 truncate" dir="rtl">
                        {job.titleAr}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {job.typeEn} · {requirementCount(job.requirements)} requirements
                      </p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-neutral-600">
                      {job.departmentEn}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-neutral-600">
                      {job.locationEn}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-neutral-600 tabular-nums whitespace-nowrap">
                      {job.postedOn.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-5 py-3">
                      <form action={toggleJobActive}>
                        <input type="hidden" name="id" value={job.id} />
                        <button type="submit" title="Toggle whether this advert is published">
                          <Badge
                            label={job.isActive ? "Live" : "Draft"}
                            className={
                              job.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-neutral-100 text-neutral-500 border-neutral-300"
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
        )}
      </Card>
    </>
  );
}
