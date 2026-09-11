import React from "react";
import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, Locale } from "../../dictionaries";
import PageHeader from "@/components/PageHeader";
import { RegisterForm } from "@/components/account/AccountForms";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { localizedAlternates } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.account.signUp,
    description: dict.account.registerSubtitle,
    alternates: localizedAlternates(lang, "/account/register"),
    robots: { index: false, follow: true },
  };
}

export default async function RegisterPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  if (await getCurrentCustomer()) redirect(`/${lang}/account`);

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        eyebrow={dict.nav.account}
        title={dict.account.registerTitle}
        subtitle={dict.account.registerSubtitle}
      />
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 md:py-16">
        <RegisterForm lang={lang} dict={dict.account} />
      </div>
    </div>
  );
}
