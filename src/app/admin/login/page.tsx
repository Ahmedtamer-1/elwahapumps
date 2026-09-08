import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";
import Logo from "@/components/Logo";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  // Already signed in — skip the form.
  if (await getCurrentUser()) redirect("/admin");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bone">
      <div className="w-full max-w-sm">
        {/* The same mark the public site uses. */}
        <div className="flex justify-center mb-8">
          <Logo variant="mark" x={18} />
        </div>

        {/* Square, on a hairline, opening on a brass rule — the masthead
            treatment every page on the public site uses, at the scale of a
            single card. */}
        <div className="bg-white p-8 border border-rule">
          <span className="spec-label">Account</span>
          <h1 className="text-h3 font-extrabold text-ink mt-2">Admin sign in</h1>
          <div className="h-[2px] w-12 bg-brass my-5" aria-hidden="true" />
          <p className="text-small text-stone mb-6">
            Staff access to the El Waha dashboard.
          </p>
          <Suspense fallback={<div className="h-64 animate-pulse bg-bone" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
