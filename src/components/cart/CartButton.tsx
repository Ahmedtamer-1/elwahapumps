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
      className={`relative flex items-center justify-center p-2 rounded-lg transition-colors ${
        isTransparent
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-neutral-100 text-neutral-600 hover:text-emerald-600"
      }`}
    >
      <ShoppingCart className={`w-5 h-5 ${isTransparent ? "text-white" : "text-emerald-600"}`} />
      {ready && count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 grid place-items-center rounded-full bg-emerald-600 text-white text-[10px] font-bold tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
