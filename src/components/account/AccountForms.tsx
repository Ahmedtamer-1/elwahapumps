"use client";

import React, { useActionState } from "react";
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
const label = "block text-xs font-semibold text-stone mb-1.5";
const hint = "mt-1 text-xs text-stone-light";

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
          defaultValue={state.values?.email ?? ""}
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="password">
          {dict.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          className={field}
        />
      </div>

      <Submit pending={pending}>{dict.signIn}</Submit>

      <p className="text-center text-sm text-stone">
        {dict.noAccount}{" "}
        <Link href={`/${lang}/account/register`} className="font-semibold text-pine underline underline-offset-4">
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
          defaultValue={state.values?.email ?? ""}
          className={field}
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
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            dir="ltr"
            className={field}
          />
          <p className={hint}>{dict.passwordHint}</p>
        </div>
        <div>
          <label className={label} htmlFor="confirm">
            {dict.confirmPassword}
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            dir="ltr"
            className={field}
          />
        </div>
      </div>

      <Submit pending={pending}>{dict.signUp}</Submit>

      <p className="text-center text-sm text-stone">
        {dict.haveAccount}{" "}
        <Link href={`/${lang}/account/login`} className="font-semibold text-pine underline underline-offset-4">
          {dict.signIn}
        </Link>
      </p>
    </form>
  );
}
