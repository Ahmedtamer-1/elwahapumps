import { prisma } from "@/lib/prisma";

/**
 * Job adverts, as the public careers page consumes them.
 *
 * The database stores each field twice (En/Ar) and the requirement list as a
 * JSON blob, mirroring how Product stores its images and specs. This module is
 * the one place that shape is turned into the `{ en, ar }` pairs the page
 * renders, so no page component ever parses the blob itself.
 */

export interface JobText {
  en: string;
  ar: string;
}

export interface JobView {
  id: string;
  title: JobText;
  department: JobText;
  type: JobText;
  location: JobText;
  description: JobText;
  requirements: JobText[];
  /** ISO date the advert went up. */
  postedOn: string;
}

/** Tolerant parse: a hand-edited or half-written blob must not 500 the page. */
function parseRequirements(raw: string): JobText[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        en: typeof item?.en === "string" ? item.en : "",
        ar: typeof item?.ar === "string" ? item.ar : "",
      }))
      // A row blank in both languages is a stray newline from the form.
      .filter((item) => item.en || item.ar);
  } catch {
    return [];
  }
}

type JobRow = {
  id: string;
  titleEn: string;
  titleAr: string;
  departmentEn: string;
  departmentAr: string;
  typeEn: string;
  typeAr: string;
  locationEn: string;
  locationAr: string;
  descEn: string;
  descAr: string;
  requirements: string;
  postedOn: Date;
};

function toView(job: JobRow): JobView {
  return {
    id: job.id,
    title: { en: job.titleEn, ar: job.titleAr },
    department: { en: job.departmentEn, ar: job.departmentAr },
    type: { en: job.typeEn, ar: job.typeAr },
    location: { en: job.locationEn, ar: job.locationAr },
    description: { en: job.descEn, ar: job.descAr },
    requirements: parseRequirements(job.requirements),
    postedOn: job.postedOn.toISOString(),
  };
}

/**
 * Live adverts for the careers page, in display order.
 *
 * Returns an empty array when nothing is published — the page drops its
 * "open positions" section entirely rather than showing an empty heading.
 */
export async function getPublishedJobs(): Promise<JobView[]> {
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { postedOn: "desc" }],
  });

  return jobs.map(toView);
}
