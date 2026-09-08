"use client";

import React, { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "@/lib/actions/auth";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <div className="p-3 bg-error-container border border-error/40 text-on-error-container text-small font-semibold">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="spec-label block mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          /* Mono, because credentials are strings to be read character by
             character — the one job §05 keeps the face for. No outline-none:
             the brass :focus-visible ring in globals.css stays. */
          className="w-full px-4 py-3 border border-rule focus:border-pine font-mono text-small text-ink bg-white transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="spec-label block mb-1.5">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          /* Mono, because credentials are strings to be read character by
             character — the one job §05 keeps the face for. No outline-none:
             the brass :focus-visible ring in globals.css stays. */
          className="w-full px-4 py-3 border border-rule focus:border-pine font-mono text-small text-ink bg-white transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`w-full py-4 px-6 text-bone font-semibold text-small transition-colors ${
 pending ?"bg-stone cursor-not-allowed" : "bg-pine hover:bg-field"
        }`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
