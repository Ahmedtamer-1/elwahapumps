import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, LogOut } from "lucide-react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import PageHeader from "@/components/PageHeader";
import { requireCustomer } from "@/lib/customer-auth";
import { signOut } from "@/lib/actions/account";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export const metadata = { robots: { index: false, follow: false } };

/** Nothing here may be cached or prerendered — it is one customer's own data. */
export const dynamic = "force-dynamic";

interface InquiryItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number | null;
}

/** The stored items blob, which is written by the API and never by a person. */
function readItems(json: string): InquiryItem[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as InquiryItem[]) : [];
  } catch {
    return [];
  }
}

export default async function AccountPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await requireCustomer(lang);
  const dict = await getDictionary(lang as Locale);
  const t = dict.account;
  const isAr = lang === "ar";

  const [customer, inquiries] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.customerId },
      select: { name: true, email: true, phone: true },
    }),
    // Scoped to this customer's own id, never to a value off the request.
    prisma.cartInquiry.findMany({
      where: { customerId: session.customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        items: true,
        totalEstimate: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const statusLabel: Record<string, string> = {
    NEW: t.statusNew,
    CONTACTED: t.statusContacted,
    CONVERTED: t.statusConverted,
  };

  const dateFormat = new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white min-h-screen">
      <PageHeader eyebrow={dict.nav.account} title={session.name} subtitle={session.email} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="spec-label text-stone">{t.details}</h2>
            {/* A form, not a link: signing out changes state, and a link that
                changes state is one a browser may follow while prefetching. */}
            <form action={signOut}>
              <input type="hidden" name="lang" value={lang} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-rule px-4 py-2 text-sm font-semibold text-stone transition-colors hover:border-pine hover:text-pine"
              >
                <LogOut className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                {t.signOut}
              </button>
            </form>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 border-y border-rule">
            {[
              { label: t.name, value: customer?.name ?? session.name, ltr: false },
              // Latin either way, so they are spelled out left-to-right even
              // on the Arabic page.
              { label: t.email, value: customer?.email ?? session.email, ltr: true },
              { label: t.phone, value: customer?.phone ?? "—", ltr: true },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`py-3 sm:flex-1 sm:min-w-0 ${
                  i === 0 ? "sm:pe-6" : "border-t border-rule sm:border-t-0 sm:border-s sm:px-6"
                }`}
              >
                <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-stone-light">
                  {row.label}
                </dt>
                <dd
                  className="mt-1 text-[13px] font-semibold text-ink"
                  dir={row.ltr ? "ltr" : undefined}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="spec-label text-stone mb-5">{t.myInquiries}</h2>

          {inquiries.length === 0 ? (
            <div className="border border-rule px-6 py-12 text-center">
              <Package className="mx-auto mb-3 h-6 w-6 text-stone-light" aria-hidden="true" />
              <p className="text-body text-stone">{t.noInquiries}</p>
              <Link
                href={`/${lang}/products`}
                className="mt-4 inline-block text-sm font-semibold text-pine underline underline-offset-4"
              >
                {t.browseProducts}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {inquiries.map((inquiry) => {
                const items = readItems(inquiry.items);
                return (
                  <li key={inquiry.id} className="border border-rule p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone-light">
                        {t.sentOn} {dateFormat.format(inquiry.createdAt)}
                      </p>
                      <span className="border border-rule bg-bone px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-stone">
                        {statusLabel[inquiry.status] ?? inquiry.status}
                      </span>
                    </div>

                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li key={`${item.productId}-${i}`} className="flex gap-3 text-body text-ink">
                          <span className="font-mono text-stone-light tabular-nums">
                            {item.qty}×
                          </span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Item count, not a total. The site quotes no prices —
                        every enquiry is priced by phone — so a figure here
                        would be the only number on the site pretending to be
                        one. */}
                    <p className="mt-4 border-t border-rule-light pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-stone-light">
                      {items.length} {t.inquiryItems}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
