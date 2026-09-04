import React from "react";
import { requireUser } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav userName={user.name} role={user.role} />
      <div className="lg:pl-[248px]">
        {/* We remove max-w-7xl and let page.tsx handle inner padding/cards matching the brutalist design */}
        <main className="w-full bg-bone min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
