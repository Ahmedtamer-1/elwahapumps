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
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-bold text-neutral-500 uppercase mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-bold text-neutral-500 uppercase mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`w-full py-3 px-6 rounded-lg text-white font-bold text-sm shadow-md transition-all ${
          pending ? "bg-neutral-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
