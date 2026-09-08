"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Package,
  ShoppingCart,
  Shield,
  Briefcase,
  MapPin,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/inquiries", label: "Cart Inquiries", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: UserRound },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/distributors", label: "Distributors", icon: MapPin },
];

interface AdminNavProps {
  userName: string;
  role: "ADMIN" | "STAFF";
}

export default function AdminNav({ userName, role }: AdminNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = role === "ADMIN" ? [...links, { href: "/admin/users", label: "Staff", icon: Shield }] : links;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          /* Active state is a pine block with a brass edge, the same marker
             the public header uses for the current section — not a mint
             wash. */
          className={`flex items-center gap-3 px-3 py-2.5 text-small font-semibold transition-colors border-s-[3px] ${
 isActive(href, exact)
 ?"bg-pine text-bone border-brass"
              : "text-stone border-transparent hover:bg-bone hover:text-pine"
          }`}
        >
          <Icon className="w-4.5 h-4.5 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-rule pt-4 mt-4">
      <div className="px-3 mb-3">
        <p className="text-small font-bold text-ink truncate">{userName}</p>
        <p className="spec-label mt-0.5">{role === "ADMIN" ? "Administrator" : "Staff"}</p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2.5 text-small font-semibold text-stone hover:bg-error-container hover:text-error transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-rule px-4 h-14">
        <span className="font-mono text-sm font-medium uppercase tracking-[0.16em] text-pine">El Waha</span>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="p-2 hover:bg-bone text-stone"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-ink/50" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-e border-rule p-4 flex flex-col transition-transform duration-300 ${
 open ?"translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 px-3">
          <span className="font-mono text-sm font-medium uppercase tracking-[0.16em] text-pine">El Waha</span>
          <button onClick={() => setOpen(false)} className="p-1 text-stone">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-e border-rule p-4 flex-col">
        <div className="px-3 py-4 mb-2">
          <span className="font-mono text-base font-medium uppercase tracking-[0.16em] text-pine">
            El Waha
          </span>
          <p className="spec-label mt-1">Admin Dashboard</p>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>
    </>
  );
}
