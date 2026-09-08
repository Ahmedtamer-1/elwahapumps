import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // A seeded account whose password is still the documented default cannot
  // reach any dashboard page until it sets its own (S7-T05). Checked here
  // rather than in the session token so that clearing the flag takes effect
  // immediately, instead of when a seven-day token happens to expire.
  const account = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { mustChangePassword: true },
  });
  if (account?.mustChangePassword) redirect("/admin/change-password");

  return (
    <div className="min-h-screen">
      <AdminNav userName={user.name} role={user.role} />
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
