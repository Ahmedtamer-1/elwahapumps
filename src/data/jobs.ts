/**
 * Where a job application goes, and how the advert's age reads.
 *
 * The adverts themselves live in the database and are managed from
 * /admin/jobs — see `lib/jobs.ts` for the read side. Only the things that are
 * the same for every advert live here.
 *
 * Applications route to a real inbox and a real phone rather than to a form
 * that posts into a table nobody is watching (§2.4 value 04: not a badge to
 * display, a number that gets answered).
 */

import { EMAIL, WHATSAPP_SALES } from "@/lib/company";

export const HR_EMAIL = EMAIL;
export const HR_WHATSAPP = WHATSAPP_SALES;

/** The only part of an advert these helpers need. */
interface JobTitled {
  title: { en: string; ar: string };
}

/** Whole days since the advert went up. Never negative. */
export function daysSincePosted(postedOn: string, now: Date = new Date()): number {
  const posted = new Date(postedOn).getTime();
  if (Number.isNaN(posted)) return 0;
  const days = Math.floor((now.getTime() - posted) / 86_400_000);
  return days > 0 ? days : 0;
}

/**
 * "Posted N days ago", in a form each language actually uses.
 *
 * Arabic counts in four shapes, not two: one takes the singular, two takes
 * the dual, 3–10 take the plural, and 11 upwards return to the singular in
 * the accusative. Formatting it as `منذ ${n} يوم` throughout — the naive
 * port of the English — is wrong for every value except 1.
 */
export function postedAgeLabel(days: number, lang: string): string {
  if (lang !== "ar") {
    if (days === 0) return "Posted today";
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (days === 0) return "نُشرت اليوم";
  if (days === 1) return "منذ يوم واحد";
  if (days === 2) return "منذ يومين";
  if (days <= 10) return `منذ ${days} أيام`;
  return `منذ ${days} يوماً`;
}

/** Pre-addressed application email, so nothing depends on a form. */
export function applyByEmail(job: JobTitled | null, lang: string): string {
  const isAr = lang === "ar";
  const role = job ? (isAr ? job.title.ar : job.title.en) : null;

  const subject = role
    ? isAr
      ? `تقديم لوظيفة: ${role}`
      : `Application: ${role}`
    : isAr
      ? "تقديم عام للتوظيف"
      : "General application";

  const body = isAr
    ? `السلام عليكم،\n\nأرغب في التقديم${role ? ` لوظيفة ${role}` : ""} بشركة الواحة.\n\nالاسم:\nسنوات الخبرة:\nمحل الإقامة:\n\nمرفق السيرة الذاتية.\n`
    : `Hello,\n\nI would like to apply${role ? ` for the ${role} position` : ""} at El Waha.\n\nName:\nYears of experience:\nLocation:\n\nMy CV is attached.\n`;

  return `mailto:${HR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Same application, on the phone people actually answer. */
export function applyByWhatsApp(job: JobTitled | null, lang: string): string {
  const isAr = lang === "ar";
  const role = job ? (isAr ? job.title.ar : job.title.en) : null;

  const text = role
    ? isAr
      ? `مرحباً، أرغب في التقديم لوظيفة ${role}.`
      : `Hello, I would like to apply for the ${role} position.`
    : isAr
      ? "مرحباً، أرغب في التقديم للعمل بشركة الواحة."
      : "Hello, I would like to apply for a job at El Waha.";

  return `https://wa.me/${HR_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
