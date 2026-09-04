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
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import Logo from "@/components/Logo";

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
    <nav className="py-5 flex flex-col">
      {navItems.map(({ href, label, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`px-6 py-[12px] font-semibold text-[13px] transition-colors border-l-[3px] ${
            isActive(href, exact)
              ? "text-bone bg-bone/10 border-brass"
              : "text-bone/70 border-transparent hover:text-bone hover:bg-bone/5"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-auto px-6 pt-5 border-t border-bone/15 pb-6">
      <div className="font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-bone/50">
        Signed in as
      </div>
      <div className="mt-2 font-semibold text-[13px] text-bone truncate">{userName}</div>
      <div className="mt-[3px] font-normal text-[11px] font-mono text-bone/60">
        {role === "ADMIN" ? "Administrator" : "Staff"}
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="mt-4 text-left font-medium text-[10.5px] font-mono tracking-[0.14em] uppercase text-brass hover:text-bone transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-pine border-b border-bone/15 px-4 h-14">
        <Logo variant="lockup" x={14} reversed />
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="p-2 text-bone hover:text-brass transition-colors"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-pine border-r border-bone/15 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 border-b border-bone/15 flex justify-between items-center">
          <Logo variant="lockup" x={14} reversed />
          <button onClick={() => setOpen(false)} className="text-bone/50 hover:text-bone">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] bg-pine pt-[26px] pb-6 flex-col">
        <div className="px-6 pb-6 border-b border-bone/15">
          <Logo variant="lockup" x={14} reversed />
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>
    </>
  );
}
