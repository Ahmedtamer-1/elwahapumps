"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { lineKey } from "./cartStore";
import { priceOnRequestLabel } from "@/lib/price";
import { WHATSAPP_SALES } from "@/lib/company";

const WHATSAPP_PHONE = WHATSAPP_SALES;

export default function CartView({
  lang,
  defaultName,
  defaultPhone,
}: {
  lang: string;
  /** Pre-filled for a signed-in customer; both undefined when signed out. */
  defaultName?: string;
  defaultPhone?: string;
}) {
  const { items, count, ready, setQty, remove, clear } = useCart();
  // Seeded once, then owned by the field: someone sending on behalf of a
  // colleague must be able to type over what we filled in.
  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [sending, setSending] = useState(false);
  const isAr = lang === "ar";

  const buildMessage = () => {
    const header = isAr
      ? "مرحباً شركة الواحة، أود طلب عرض سعر للمنتجات التالية:"
      : "Hello El Waha, I would like a quote for the following items:";

    const lines = items.map(
      (i, idx) =>
        `${idx + 1}. ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""}` +
        ` — ${isAr ? "الكمية" : "Qty"}: ${i.qty}`,
    );

    const contact = [
      name ? `\n${isAr ? "الاسم" : "Name"}: ${name}` : "",
      phone ? `\n${isAr ? "الهاتف" : "Phone"}: ${phone}` : "",
    ].join("");

    return `${header}\n\n${lines.join("\n")}${contact}`;
  };

  const handleSend = async () => {
    if (items.length === 0) return;
    setSending(true);

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(buildMessage())}`;
    // Open synchronously-ish before the await so the browser still attributes
    // the popup to the click; the logging call then runs in the background.
    const win = window.open(url, "_blank", "noopener,noreferrer");

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          phone: phone || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.variantLabel ? `${i.name} (${i.variantLabel})` : i.name,
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
        }),
      });
    } catch {
      // The WhatsApp hand-off already happened; a failed log shouldn't block the user.
    }

    if (!win) window.location.href = url;
    setSending(false);
  };

  if (!ready) {
    return <div className="h-64 animate-pulse bg-bone" />;
  }

  if (count === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="w-12 h-12 text-bone/75 mx-auto mb-4" />
        <p className="text-stone mb-6">
          {isAr ? "سلة الطلب فارغة." : "Your request cart is empty."}
        </p>
        <Link
          href={`/${lang}/products`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-bold text-sm transition-colors"
        >
          {isAr ? "تصفح المنتجات" : "Browse products"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div
            key={lineKey(item)}
            className="flex gap-4 bg-white border border-rule p-4"
          >
            <Link
              href={`/${lang}/products/${item.slug}`}
              className="relative w-20 h-20 shrink-0 bg-bone overflow-hidden"
            >
              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-2" />
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/${lang}/products/${item.slug}`}
                className="font-bold text-ink hover:text-emerald-600 line-clamp-2 text-sm"
              >
                {item.name}
              </Link>
              {item.variantLabel && (
                <p className="text-xs text-stone mt-0.5">{item.variantLabel}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-rule">
                  <button
                    onClick={() => setQty(lineKey(item), item.qty - 1)}
                    aria-label={isAr ? "إنقاص" : "Decrease quantity"}
                    className="p-1.5 text-stone hover:text-ink"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-bold tabular-nums">{item.qty}</span>
                  <button
                    onClick={() => setQty(lineKey(item), item.qty + 1)}
                    aria-label={isAr ? "زيادة" : "Increase quantity"}
                    className="p-1.5 text-stone hover:text-ink"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => remove(lineKey(item))}
                  aria-label={isAr ? "حذف" : "Remove"}
                  className="p-1.5 text-stone hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={clear}
          className="text-xs font-semibold text-stone hover:text-red-600 transition-colors"
        >
          {isAr ? "إفراغ السلة" : "Clear cart"}
        </button>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white border border-rule p-6 sticky top-28">
          <h2 className="font-bold text-ink mb-4">
            {isAr ? "ملخص الطلب" : "Request summary"}
          </h2>

          <dl className="space-y-2 text-sm mb-5 pb-5 border-b border-rule-light">
            <div className="flex justify-between">
              <dt className="text-stone">{isAr ? "عدد القطع" : "Items"}</dt>
              <dd className="font-semibold text-ink tabular-nums">{count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">{isAr ? "السعر" : "Price"}</dt>
              <dd className="font-bold text-ink">
                {priceOnRequestLabel(lang)}
              </dd>
            </div>
          </dl>

          {/* Real labels, not placeholders. A placeholder is not an
              accessible name, and it disappears the moment someone starts
              typing — so a screen reader announced these two as unlabelled
              text boxes (S6-T06). */}
          <div className="space-y-3 mb-5">
            <div>
              <label htmlFor="cart-name" className="block text-xs font-semibold text-stone mb-1">
                {isAr ? "الاسم (اختياري)" : "Your name (optional)"}
              </label>
              <input
                id="cart-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-rule focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div>
              <label htmlFor="cart-phone" className="block text-xs font-semibold text-stone mb-1">
                {isAr ? "رقم الهاتف (اختياري)" : "Phone number (optional)"}
              </label>
              <input
                id="cart-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-rule focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            // Was white on WhatsApp green (#25D366) at 1.98:1. The glyph
            // still says WhatsApp; the button now uses the site's own
            // primary pairing, bone on pine, at 13.1:1.
            className="w-full flex items-center justify-center gap-2 bg-pine hover:bg-emerald-700 disabled:bg-stone-light text-bone font-bold py-3.5 transition-colors"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {sending
              ? isAr
                ? "جارٍ الإرسال…"
                : "Sending…"
              : isAr
                ? "إرسال الطلب عبر واتساب"
                : "Send request via WhatsApp"}
          </button>

          <p className="text-[11px] text-stone mt-3 text-center leading-relaxed">
            {isAr
              ? "سيتم فتح واتساب بقائمة منتجاتك، وسيتواصل معك فريق المبيعات لتأكيد السعر النهائي."
              : "WhatsApp opens with your item list. Our sales team will confirm final pricing."}
          </p>
        </div>
      </div>
    </div>
  );
}
