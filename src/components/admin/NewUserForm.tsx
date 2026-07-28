"use client";

import React, { useActionState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";
import { createUser, type UserFormState } from "@/lib/actions/users";

export default function NewUserForm() {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(createUser, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
          {state.success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>
        <Field label="Role">
          <select name="role" defaultValue="STAFF" className={inputClass}>
            <option value="STAFF">Staff — leads, customers, products</option>
            <option value="ADMIN">Admin — everything, including staff accounts</option>
          </select>
        </Field>
      </div>

      <SubmitButton type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create staff account"}
      </SubmitButton>
    </form>
  );
}
