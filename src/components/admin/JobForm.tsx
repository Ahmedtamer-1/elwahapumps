"use client";

import React, { useActionState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";
import { saveJob, type JobFormState } from "@/lib/actions/jobs";

export interface JobFormValues {
  id: string;
  titleEn: string;
  titleAr: string;
  departmentEn: string;
  departmentAr: string;
  typeEn: string;
  typeAr: string;
  locationEn: string;
  locationAr: string;
  descEn: string;
  descAr: string;
  /** One requirement per line, already paired by index with the Arabic list. */
  requirementsEn: string;
  requirementsAr: string;
  /** yyyy-mm-dd, for the date input. */
  postedOn: string;
  sortOrder: string;
  isActive: boolean;
}

/** Today in yyyy-mm-dd, so a new advert defaults to being posted now. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JobForm({ job }: { job?: JobFormValues }) {
  const [state, formAction, pending] = useActionState<JobFormState, FormData>(saveJob, {});

  return (
    <form action={formAction} className="space-y-5">
      {job?.id && <input type="hidden" name="id" value={job.id} />}

      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Job title (English)">
          <input name="titleEn" required defaultValue={job?.titleEn ?? ""} className={inputClass} />
        </Field>
        <Field label="Job title (Arabic)">
          <input
            name="titleAr"
            required
            dir="rtl"
            defaultValue={job?.titleAr ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Department (English)" hint="Shown as a tag beside the title, e.g. Maintenance">
          <input
            name="departmentEn"
            required
            defaultValue={job?.departmentEn ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Department (Arabic)">
          <input
            name="departmentAr"
            required
            dir="rtl"
            defaultValue={job?.departmentAr ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Employment type (English)" hint="e.g. Full time">
          <input name="typeEn" required defaultValue={job?.typeEn ?? ""} className={inputClass} />
        </Field>
        <Field label="Employment type (Arabic)" hint="مثال: دوام كامل">
          <input
            name="typeAr"
            required
            dir="rtl"
            defaultValue={job?.typeAr ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Location (English)" hint="e.g. 6th of October workshop">
          <input
            name="locationEn"
            required
            defaultValue={job?.locationEn ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Location (Arabic)">
          <input
            name="locationAr"
            required
            dir="rtl"
            defaultValue={job?.locationAr ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Description (English)">
          <textarea
            name="descEn"
            rows={4}
            required
            defaultValue={job?.descEn ?? ""}
            className={`${inputClass} resize-y`}
          />
        </Field>
        <Field label="Description (Arabic)">
          <textarea
            name="descAr"
            rows={4}
            required
            dir="rtl"
            defaultValue={job?.descAr ?? ""}
            className={`${inputClass} resize-y`}
          />
        </Field>
      </div>

      {/* The two lists are paired line by line, so line 3 on the left is the
          same requirement as line 3 on the right. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Requirements (English)"
          hint="One per line. Line 1 here pairs with line 1 in Arabic."
        >
          <textarea
            name="requirementsEn"
            rows={6}
            defaultValue={job?.requirementsEn ?? ""}
            className={`${inputClass} resize-y`}
          />
        </Field>
        <Field label="Requirements (Arabic)" hint="سطر لكل شرط، بنفس ترتيب القائمة الإنجليزية">
          <textarea
            name="requirementsAr"
            rows={6}
            dir="rtl"
            defaultValue={job?.requirementsAr ?? ""}
            className={`${inputClass} resize-y`}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Posted on" hint="Drives the “posted N days ago” line on the site">
          <input
            name="postedOn"
            type="date"
            required
            defaultValue={job?.postedOn ?? today()}
            className={inputClass}
          />
        </Field>
        <Field label="Display order" hint="Lower shows first. Leave 0 for newest-first.">
          <input
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={job?.sortOrder ?? "0"}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={job?.isActive ?? true}
          className="w-4 h-4 accent-emerald-600"
        />
        <span className="text-sm font-semibold text-neutral-700">
          Published on the careers page
        </span>
      </label>

      <SubmitButton type="submit" disabled={pending}>
        {pending ? "Saving…" : job?.id ? "Save changes" : "Publish job"}
      </SubmitButton>
    </form>
  );
}
