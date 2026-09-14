import React from "react";
import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, Locale } from "../../dictionaries";
import AuthShell from "@/components/account/AuthShell";
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
    <AuthShell lang={lang} dict={dict.account} title={dict.account.signUp}>
      <RegisterForm lang={lang} dict={dict.account} />
    </AuthShell>
  );
}
