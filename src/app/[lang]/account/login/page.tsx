import React from "react";
import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, Locale } from "../../dictionaries";
import AuthShell from "@/components/account/AuthShell";
import { SignInForm } from "@/components/account/AccountForms";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { localizedAlternates } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.account.signIn,
    description: dict.account.loginSubtitle,
    alternates: localizedAlternates(lang, "/account/login"),
    // Nothing here belongs in an index: it is a form, and the two account
    // pages behind it are private by definition.
    robots: { index: false, follow: true },
  };
}

export default async function LoginPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Already signed in — there is nothing to do on this page.
  if (await getCurrentCustomer()) redirect(`/${lang}/account`);

  const { next } = await searchParams;
  const dict = await getDictionary(lang as Locale);

  return (
    <AuthShell lang={lang} dict={dict.account} title={dict.account.signIn} fullscreen>
      <SignInForm lang={lang} dict={dict.account} next={next} />
    </AuthShell>
  );
}
