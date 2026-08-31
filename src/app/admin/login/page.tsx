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
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100">
      <div className="w-full max-w-sm">
        {/* The same mark the public site uses. */}
        <div className="flex justify-center mb-8">
          <Logo variant="mark" x={18} />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h1 className="text-xl font-bold text-neutral-900 mb-1">Admin sign in</h1>
          <p className="text-sm text-neutral-500 mb-6">Staff access to the El Waha dashboard.</p>
          <Suspense fallback={<div className="h-64 animate-pulse bg-neutral-100 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
