"use client";

import React, { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, type CartItem } from "./CartContext";

interface AddToCartButtonProps {
  item: Omit<CartItem, "qty">;
  lang: string;
  className?: string;
}

export default function AddToCartButton({ item, lang, className = "" }: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const isAr = lang === "ar";

  const handleClick = () => {
    add(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3.5 transition-colors ${
      added ? "bg-emerald-700 text-bone" : "bg-emerald-600 hover:bg-emerald-700 text-bone"
      } ${className}`}
    >
      {added ? <Check className="w-4.5 h-4.5" /> : <ShoppingCart className="w-4.5 h-4.5" />}
      {added
        ? isAr
          ? "تمت الإضافة"
          : "Added to cart"
        : isAr
          ? "أضف إلى الطلب"
          : "Add to cart"}
    </button>
  );
}
