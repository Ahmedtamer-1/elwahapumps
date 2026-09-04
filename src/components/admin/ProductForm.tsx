"use client";

import React, { useActionState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";
import { saveProduct, type ProductFormState } from "@/lib/actions/products";

export interface ProductFormValues {
  id: string;
  slug: string;
  categorySlug: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  sku: string;
  currency: string;
  price: string;
  stock: string;
  images: string;
  specChips: string;
  isActive: boolean;
}

interface ProductFormProps {
  categories: { slug: string; nameEn: string }[];
  product?: ProductFormValues;
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});

  return (
    <form action={formAction} className="space-y-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name (English)">
          <input name="nameEn" required defaultValue={product?.nameEn ?? ""} className={inputClass} />
        </Field>
        <Field label="Name (Arabic)">
          <input
            name="nameAr"
            required
            dir="rtl"
            defaultValue={product?.nameAr ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="URL slug" hint="Public address: /en/products/your-slug">
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={product?.slug ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Category">
          <select
            name="categorySlug"
            defaultValue={product?.categorySlug ?? categories[0]?.slug}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nameEn}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Field label="Price" hint="Leave blank for 'Price on request'">
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Currency">
          <input name="currency" required defaultValue={product?.currency ?? "EGP"} className={inputClass} />
        </Field>
        <Field label="Stock" hint="Blank = not tracked">
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="SKU">
          <input name="sku" defaultValue={product?.sku ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Description (English)">
          <textarea
            name="descEn"
            rows={5}
            defaultValue={product?.descEn ?? ""}
            className={`${inputClass} resize-y`}
          />
        </Field>
        <Field label="Description (Arabic)">
          <textarea
            name="descAr"
            rows={5}
            dir="rtl"
            defaultValue={product?.descAr ?? ""}
            className={`${inputClass} resize-y`}
          />
        </Field>
      </div>

      <Field label="Image URLs" hint="One per line, e.g. /images/products/pump-kurlar.webp">
        <textarea
          name="images"
          rows={3}
          defaultValue={product?.images ?? ""}
          className={`${inputClass} resize-y font-mono text-xs`}
        />
      </Field>

      <Field label="Spec chips" hint="Short highlights shown on the product card — one per line">
        <textarea
          name="specChips"
          rows={3}
          defaultValue={product?.specChips ?? ""}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.isActive ?? true}
          className="w-4 h-4 accent-emerald-600"
        />
        <span className="text-sm font-semibold text-neutral-700">
          Visible on the public website
        </span>
      </label>

      <SubmitButton type="submit" disabled={pending}>
        {pending ? "Saving…" : product?.id ? "Save changes" : "Create product"}
      </SubmitButton>
    </form>
  );
}
