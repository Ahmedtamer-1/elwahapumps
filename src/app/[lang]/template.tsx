"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/ar" || pathname === "/en";
  // Sign-in renders without the header (see SiteChrome), so there is
  // nothing to clear.
  const isStandalone = /^\/(ar|en)\/account\/login\/?$/.test(pathname ?? "");

  // The home page's hero sits *under* the transparent header by design;
  // every other page has to clear it. --header-h is defined once in
  // globals.css — see the note there (S5-T01).
  //
  // No `min-h-screen` on this wrapper. It forced every page to a full
  // viewport whatever it held, so a short one — the maintenance tab, three
  // cards — ended in a band of empty white between the last card and the
  // footer. The footer is held down by layout.tsx instead: body is a
  // min-h-screen flex column and <main> is flex-grow, which fills the
  // viewport on a short page without adding height to a long one.
  return (
    <div
      className="flex flex-col bg-white animate-page-in"
      style={isHome || isStandalone ? undefined : { paddingTop: "var(--header-h)" }}
    >
      {children}
    </div>
  );
}
