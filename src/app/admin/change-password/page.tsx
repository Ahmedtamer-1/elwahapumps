import React from "react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import Logo from "@/components/Logo";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata = { title: "Change password" };

/**
 * Deliberately outside the (dashboard) route group.
 *
 * The dashboard layout redirects flagged accounts *to* this page, so if it
 * lived inside that group the redirect would loop.
 */
export default async function ChangePasswordPage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { mustChangePassword: true },
  });

  const forced = user?.mustChangePassword ?? false;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo variant="mark" x={18} />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h1 className="text-xl font-bold text-neutral-900 mb-1">
            {forced ? "Set your own password" : "Change password"}
          </h1>
          <p className="text-sm text-neutral-600 mb-6">
            {forced
              ? "This account still uses the password shipped with the install, which is published in the README. Choose your own before continuing."
              : "Choose a new password for your account."}
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
