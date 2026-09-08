"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/ar" || pathname === "/en";

  // The home page's hero sits *under* the transparent header by design;
  // every other page has to clear it. --header-h is defined once in
  // globals.css — see the note there (S5-T01).
  return (
    <div
      className="flex flex-col min-h-screen bg-white animate-page-in"
      style={isHome ? undefined : { paddingTop: "var(--header-h)" }}
    >
      {children}
    </div>
  );
}
