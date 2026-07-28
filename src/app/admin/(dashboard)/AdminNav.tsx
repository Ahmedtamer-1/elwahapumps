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
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            isActive(href, exact)
              ? "bg-emerald-50 text-emerald-700"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          <Icon className="w-4.5 h-4.5 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-neutral-200 pt-4 mt-4">
      <div className="px-3 mb-3">
        <p className="text-sm font-bold text-neutral-900 truncate">{userName}</p>
        <p className="text-xs text-neutral-500">{role === "ADMIN" ? "Administrator" : "Staff"}</p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
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
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-neutral-200 px-4 h-14">
        <span className="font-black text-emerald-600 font-mono text-sm">EL WAHA</span>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 p-4 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 px-3">
          <span className="font-black text-emerald-600 font-mono">EL WAHA</span>
          <button onClick={() => setOpen(false)} className="p-1 text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 p-4 flex-col">
        <div className="px-3 py-4 mb-2">
          <span className="font-black text-emerald-600 font-mono text-lg">EL WAHA</span>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
            Admin Dashboard
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>
    </>
  );
}
