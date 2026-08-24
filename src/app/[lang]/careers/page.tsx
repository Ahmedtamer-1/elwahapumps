import React from "react";
import Link from "next/link";
import { getDictionary, Locale } from "../dictionaries";
import {
  applyByEmail,
  applyByWhatsApp,
  daysSincePosted,
  postedAgeLabel,
  HR_EMAIL,
} from "@/data/jobs";
import { getPublishedJobs, type JobView } from "@/lib/jobs";
import { yearsOfService } from "@/lib/company";
import {
  Briefcase,
  Check,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Users,
  Wrench,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

/**
 * Careers, built to the same shape as the Kurlar careers page the client
 * asked us to match: hero with a jump link, "why us" benefit cards, the open
 * positions list, then a general-application panel for people who did not
 * find their role.
 *
 * Two deliberate departures from that reference. Its Apply and Details
 * buttons are wired to nothing at all, and every advert claims it was posted
 * "2 days ago" regardless of when it went up. Here both buttons open a real
 * pre-addressed application — email or WhatsApp — and the age of each advert
 * is computed from its own posting date.
 */

/**
 * Recomputed hourly so "posted N days ago" cannot go stale on a built page.
 * Publishing from /admin/jobs revalidates this path directly, so a new advert
 * does not wait out the hour.
 */
export const revalidate = 3600;

function JobCard({ job, lang }: { job: JobView; lang: string }) {
  const isAr = lang === "ar";
  // Fall back to the other language rather than rendering a blank line: an
  // advert half-translated in the admin should still read on both sides.
  const t = (v: { en: string; ar: string }) =>
    (isAr ? v.ar || v.en : v.en || v.ar);
  const days = daysSincePosted(job.postedOn);

  return (
    <article className="border border-rule bg-white p-6 transition-colors duration-300 hover:border-pine md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-ink">{t(job.title)}</h3>
            <span className="spec-label bg-bone px-2 py-1 text-pine">
              {t(job.department)}
            </span>
          </div>

          {/* Type, place and age of the advert — the three things a candidate
              checks before they read the body. */}
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-stone">
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t(job.type)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t(job.location)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {postedAgeLabel(days, lang)}
            </span>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-stone">
            {t(job.description)}
          </p>

          {/* An advert may legitimately carry no bullet list; the heading is
              dropped with it rather than left standing over nothing. */}
          {job.requirements.length > 0 && (
            <div>
              <h4 className="spec-label mb-3 text-pine">
                {isAr ? "المؤهلات المطلوبة" : "Requirements"}
              </h4>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-pine"
                      aria-hidden="true"
                    />
                    <span>{t(req)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Both routes are live. The reference page's equivalents are dead
            buttons; a candidate who taps one and gets nothing does not tap
            twice. */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-52">
          <a
            href={applyByEmail(job, lang)}
            className="inline-flex items-center justify-center gap-2 bg-pine px-5 py-3 text-[13px] font-semibold text-bone transition-colors hover:bg-field"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {isAr ? "تقدّم بالبريد" : "Apply by email"}
          </a>
          <a
            href={applyByWhatsApp(job, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-pine px-5 py-3 text-[13px] font-semibold text-pine transition-colors hover:bg-pine hover:text-bone"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {isAr ? "واتساب" : "WhatsApp"}
          </a>
        </div>
      </div>
    </article>
  );
}

export default async function CareersPage({ params }: PageProps) {
  const { lang } = await params;
  const [dict, jobs] = await Promise.all([
    getDictionary(lang as Locale),
    getPublishedJobs(),
  ]);
  const isAr = lang === "ar";
  const years = yearsOfService();

  const benefits = [
    {
      icon: Users,
      title: isAr ? "فريق تسنده الخبرة" : "A team that backs you",
      desc: isAr
        ? "تعمل بجانب فنيين ومهندسين قضوا سنوات في الآبار ومراكز الصيانة، ويُسلّمون ما تعلّموه."
        : "You work beside technicians and engineers who have spent years on wells and benches, and who pass on what they know.",
    },
    {
      icon: GraduationCap,
      title: isAr ? "تدريب على معدات المصنّع" : "Training on the real equipment",
      desc: isAr
        ? "تدريب على منتجات الوكالات التي نمثّلها، من الطلمبات والمواتير حتى مغيرات التردد."
        : "Hands-on training on the products of the agencies we represent, from pumps and motors through to variable frequency drives.",
    },
    {
      icon: Wrench,
      title: isAr ? "مراكز صيانة وأدوات مجهّزة" : "Equipped workshops",
      desc: isAr
        ? "مراكز صيانة ولف مجهزة بالكامل وأسطول صيانة متنقل — أدوات تعمل بها لا تبحث عنها."
        : "Fully equipped rewinding and service workshops with a mobile maintenance fleet — tools you work with, not tools you hunt for.",
    },
    {
      icon: ShieldCheck,
      title: isAr ? "عمل مستقر" : "Steady work",
      desc: isAr
        ? `شركة قائمة على عقود صيانة سنوية — ${years} سنة من العمل المتصل في السوق.`
        : `A company built on annual maintenance contracts — ${years} years of continuous work in the market.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. Hero. Flat pine — §03.5 allows pine, bone or white only, so no
             stock photograph behind it (§06 rules out other people's). */}
      <section className="bg-pine pt-32 pb-16 text-bone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="spec-label text-brass">
            {dict.nav.career || (isAr ? "الوظائف" : "Careers")}
          </span>

          <h1 className="mt-3 max-w-3xl text-h1 font-extrabold text-bone sm:text-display">
            {isAr
              ? "ابنِ مستقبلك مع من يُشغّل مياه مصر"
              : "Build your career with the people who keep Egypt's water moving"}
          </h1>

          <div className="brass-rule mt-6" aria-hidden="true" />

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-bone/75">
            {isAr
              ? "انضم لفريق الواحة — فنيون ومهندسون يوردون ويركّبون ويصونون الطلمبات والمواتير في الآبار والمحطات على مستوى الجمهورية. نحتاج مهارتك وانضباطك."
              : "Join the El Waha team — technicians and engineers who supply, install and maintain pumps and motors on wells and stations across Egypt. We need your skill and your discipline."}
          </p>

          {jobs.length > 0 && (
            // A plain anchor: html has scroll-behavior:smooth globally, so
            // this needs no client-side JavaScript to glide.
            <a
              href="#positions"
              className="mt-8 inline-flex items-center justify-center bg-brass px-6 py-3.5 text-[13px] font-bold text-pine transition-opacity hover:opacity-90"
            >
              {isAr ? "استعرض الوظائف المتاحة" : "View open positions"}
            </a>
          )}
        </div>
      </section>

      {/* 2. Why work here. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 border-t-2 border-pine pt-3">
          <h2 className="text-h3 font-extrabold text-pine sm:text-h2">
            {isAr ? "لماذا الواحة؟" : "Why El Waha?"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone">
            {isAr
              ? "ما نقدّمه فعلياً لمن يعمل معنا — بلا مبالغات."
              : "What we actually offer the people who work here — no superlatives."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="border border-rule bg-bone p-6 transition-colors duration-300 hover:border-pine"
              >
                <Icon
                  className="h-6 w-6 text-pine"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                <h3 className="mt-4 text-[15px] font-semibold text-ink">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-[13px] leading-5 text-stone">
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Open positions. Dropped entirely when there are none, rather than
             left as an empty heading — §1.3 counts empty shells as part of
             what makes a site read unattended. */}
      {jobs.length > 0 && (
        <section id="positions" className="scroll-mt-28 bg-bone py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-t-2 border-pine pt-3">
              <div>
                <h2 className="text-h3 font-extrabold text-pine sm:text-h2">
                  {isAr ? "الوظائف المتاحة" : "Open positions"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone">
                  {isAr
                    ? "راجع الإعلانات الحالية وتقدّم للوظيفة المناسبة لخبرتك."
                    : "Review our current adverts and apply for the role that fits your experience."}
                </p>
              </div>
              <span className="spec-label shrink-0">
                {isAr
                  ? `${jobs.length} وظيفة متاحة`
                  : `${jobs.length} position${jobs.length === 1 ? "" : "s"} available`}
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. General application, for people whose role is not listed. */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-t-2 border-pine bg-bone p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <span className="spec-label text-pine">
              {isAr
                ? "لم تجد الوظيفة التي تبحث عنها؟"
                : "Didn't find the position you were looking for?"}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {isAr
                ? "أرسل سيرتك الذاتية وسنحتفظ بها؛ نتواصل معك عند توفر وظيفة تناسب خبرتك."
                : "Send us your CV and we will keep it on file, and contact you when a role that fits your experience opens."}
            </p>
            <p className="mt-3 font-mono text-[11px] leading-4 text-stone-light" dir="ltr">
              {HR_EMAIL}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href={applyByEmail(null, lang)}
              className="inline-flex items-center justify-center gap-2 bg-pine px-5 py-3 text-[13px] font-semibold text-bone transition-colors hover:bg-field"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {isAr ? "تقديم عام" : "General application"}
            </a>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center border border-pine px-5 py-3 text-[13px] font-semibold text-pine transition-colors hover:bg-pine hover:text-bone"
            >
              {isAr ? "تواصل معنا" : "Contact us"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
