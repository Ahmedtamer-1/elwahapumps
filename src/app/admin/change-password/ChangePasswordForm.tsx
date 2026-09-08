"use client";

import React, { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "@/lib/actions/change-password";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ChangePasswordState, FormData>(
    changePassword,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div role="status" aria-live="polite">
        {state.error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm font-semibold">
            {state.error}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="currentPassword" className="block text-xs font-bold text-neutral-600 uppercase mb-1">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-colors"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-xs font-bold text-neutral-600 uppercase mb-1">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          aria-describedby="newPassword-hint"
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-colors"
        />
        <p id="newPassword-hint" className="mt-1 text-xs text-neutral-600">
          At least 12 characters.
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-bold text-neutral-600 uppercase mb-1">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white font-bold text-sm transition-colors"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
