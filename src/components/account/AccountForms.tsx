"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import {
  registerAccount,
  signIn,
  type AccountFormState,
} from "@/lib/actions/account";
import type { Dictionary } from "../../app/[lang]/dictionaries";

/**
 * The customer sign-in and sign-up forms.
 *
 * Both are plain server-action forms — `useActionState` only so the error
 * comes back into the page rather than onto a URL, and so the fields keep
 * what was typed when a submit is rejected. With JavaScript off they still
 * post and still work.
 */

const field =
  "w-full border border-rule bg-white px-4 py-3 text-body text-ink outline-none transition-colors focus:border-pine focus:ring-2 focus:ring-pine/20";
const label = "block text-sm font-semibold text-ink mb-2";
const hint = "mt-1 text-xs text-stone-light";
const footer = "mt-8 border-t border-rule-light pt-6 text-sm text-stone";
const footerLink = "font-semibold text-pine hover:underline underline-offset-4";

/**
 * Password input with a Show/Hide toggle inside the field. The toggle comes
 * after the input in tab order and is labelled with what it will do next.
 */
function PasswordField({
  id,
  name,
  autoComplete,
  minLength,
  dict,
}: {
  id: string;
  name: string;
  autoComplete: string;
  minLength?: number;
  dict: Dictionary["account"];
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        dir="ltr"
        className={`${field} pe-20`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-controls={id}
        aria-pressed={visible}
        className="spec-label absolute inset-y-0 end-0 px-4 text-stone hover:text-pine"
      >
        {visible ? dict.hidePassword : dict.showPassword}
      </button>
    </div>
  );
}

function Submit({ children, pending }: { children: React.ReactNode; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-pine px-8 py-4 text-sm font-semibold text-bone transition-colors hover:bg-field disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function ErrorBox({ message }: { message?: string }) {
  if (!message) return null;
  return (
    // `role="alert"` so the message is announced when it replaces the form's
    // previous state, not only seen.
    <p
      role="alert"
      className="border border-error/30 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container"
    >
      {message}
    </p>
  );
}

export function SignInForm({
  lang,
  dict,
  next,
}: {
  lang: string;
  dict: Dictionary["account"];
  next?: string;
}) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {next && <input type="hidden" name="next" value={next} />}

      <ErrorBox message={state.error} />

      <div>
        <label className={label} htmlFor="email">
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          placeholder={dict.emailPlaceholder}
          defaultValue={state.values?.email ?? ""}
          className={`${field} placeholder:font-mono placeholder:text-sm placeholder:text-stone-light`}
        />
      </div>

      <div>
        <label className={label} htmlFor="password">
          {dict.password}
        </label>
        <PasswordField id="password" name="password" autoComplete="current-password" dict={dict} />
      </div>

      <div className="pt-1">
        <Submit pending={pending}>{dict.signIn}</Submit>
      </div>

      <p className={footer}>
        {dict.noAccount}{" "}
        <Link href={`/${lang}/account/register`} className={footerLink}>
          {dict.signUp}
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ lang, dict }: { lang: string; dict: Dictionary["account"] }) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(
    registerAccount,
    {},
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />

      <ErrorBox message={state.error} />

      <div>
        <label className={label} htmlFor="name">
          {dict.name}
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          defaultValue={state.values?.name ?? ""}
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="email">
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          placeholder={dict.emailPlaceholder}
          defaultValue={state.values?.email ?? ""}
          className={`${field} placeholder:font-mono placeholder:text-sm placeholder:text-stone-light`}
        />
      </div>

      <div>
        <label className={label} htmlFor="phone">
          {dict.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          placeholder="01012345678"
          defaultValue={state.values?.phone ?? ""}
          className={field}
        />
        <p className={hint}>{dict.phoneHint}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="password">
            {dict.password}
          </label>
          <PasswordField id="password" name="password" autoComplete="new-password" minLength={8} dict={dict} />
          <p className={hint}>{dict.passwordHint}</p>
        </div>
        <div>
          <label className={label} htmlFor="confirm">
            {dict.confirmPassword}
          </label>
          <PasswordField id="confirm" name="confirm" autoComplete="new-password" minLength={8} dict={dict} />
        </div>
      </div>

      <div className="pt-1">
        <Submit pending={pending}>{dict.signUp}</Submit>
      </div>

      <p className={footer}>
        {dict.haveAccount}{" "}
        <Link href={`/${lang}/account/login`} className={footerLink}>
          {dict.signIn}
        </Link>
      </p>
    </form>
  );
}
