"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartButton({
  lang,
  isTransparent,
}: {
  lang: string;
  isTransparent: boolean;
}) {
  const { count, ready } = useCart();

  return (
    <Link
      href={`/${lang}/cart`}
      aria-label={lang === "ar" ? "سلة الطلب" : "Request cart"}
      className={`relative flex items-center justify-center p-2 transition-colors ${
          isTransparent
          ? "bg-white/10 text-bone hover:bg-white/20"
          : "bg-bone text-stone hover:text-emerald-600"
      }`}
    >
      <ShoppingCart className={`w-5 h-5 ${isTransparent ? "text-bone" : "text-emerald-600"}`} />
      {ready && count > 0 && (
        /* Square, like everything else. This was the last rounded-full on the
           public site, and a pill badge on a site with no radius anywhere
           reads as a control borrowed from a different kit. Mono figures
           because it is a count. */
        <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 min-w-4.5 h-4.5 px-1 grid place-items-center bg-brass text-ink font-mono text-[10px] font-medium tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
