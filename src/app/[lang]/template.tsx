"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/ar" || pathname === "/en";

  return (
    <div
      className={`flex flex-col min-h-screen bg-white animate-page-in ${isHome ? "" : "pt-[72px] sm:pt-[80px]"}`}
    >
      {children}
    </div>
  );
}
