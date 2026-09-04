"use client";

import React, { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "@/lib/actions/auth";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col">
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold rounded-none">
          {state.error}
        </div>
      )}

      <label htmlFor="email" className="block font-semibold text-[12px] text-ink mb-[7px]">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="username"
        className="w-full px-[15px] py-[15px] border border-rule/25 focus:border-pine outline-none text-[13.5px] font-mono text-stone-light focus:text-ink bg-transparent rounded-none transition-colors mb-5"
        placeholder="name@company.com"
      />

      <label htmlFor="password" className="block font-semibold text-[12px] text-ink mb-[7px]">
        Password
      </label>
      <div className="relative mb-[16px]">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-[15px] py-[15px] border border-rule/25 focus:border-pine outline-none text-[15px] font-mono text-ink tracking-[0.2em] bg-transparent rounded-none transition-colors"
          placeholder="••••••••••"
        />
        <span className="absolute right-[15px] top-1/2 -translate-y-1/2 font-medium text-[10.5px] font-mono tracking-[0.14em] uppercase text-stone cursor-pointer select-none hover:text-ink">
          Show
        </span>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-[9px] cursor-pointer group">
          <div className="relative w-[15px] h-[15px] border border-ink/35 bg-pine transition-colors"></div>
          <span className="font-normal text-[12.5px] text-ink group-hover:text-pine transition-colors">Keep me signed in</span>
        </label>
        <span className="font-semibold text-[12.5px] text-pine cursor-pointer hover:text-field transition-colors">
          Forgot password?
        </span>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`mt-[26px] w-full py-[17px] px-4 bg-pine text-bone font-semibold text-[13.5px] text-center rounded-none transition-colors ${
          pending ? "opacity-70 cursor-not-allowed" : "hover:bg-field"
        }`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div className="mt-[28px] border-t border-rule-light pt-[20px] font-normal text-[13px] leading-[22px] text-stone">
        No account yet? Raise an enquiry and we will open one for you, or{" "}
        <span className="text-pine font-semibold cursor-pointer hover:text-field transition-colors">request access</span>.
      </div>
      
      <div className="mt-[18px] font-normal text-[11px] leading-[18px] font-mono text-stone-light">
        Staff accounts sign in at the same door and land in the CRM instead.
      </div>
    </form>
  );
}
