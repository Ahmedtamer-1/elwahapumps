import React from "react";
import { requireUser } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <AdminNav userName={user.name} role={user.role} />
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
