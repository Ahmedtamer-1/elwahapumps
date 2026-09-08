"use client";

import React, { useActionState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";
import {
  saveDistributor,
  type DistributorFormState,
} from "@/lib/actions/distributors";
import { REGIONS, REGION_LABELS } from "@/data/distributors";

export interface DistributorFormValues {
  id: string;
  name: string;
  phone: string;
  cityAr: string;
  cityEn: string;
  region: string;
  lat: string;
  lng: string;
  mapUrl: string;
  sortOrder: string;
  isActive: boolean;
}

export default function DistributorForm({
  distributor,
}: {
  distributor?: DistributorFormValues;
}) {
  const [state, formAction, pending] = useActionState<
    DistributorFormState,
    FormData
  >(saveDistributor, {});

  return (
    <form action={formAction} className="space-y-5">
      {distributor?.id && <input type="hidden" name="id" value={distributor.id} />}

      {state.error && (
        <div className="p-3 bg-error-container border border-error/30 text-on-error-container text-sm font-semibold">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" hint="Person or trading name, as it should appear">
          <input
            name="name"
            required
            defaultValue={distributor?.name ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Phone" hint="11 digits, e.g. 01012345678">
          <input
            name="phone"
            required
            inputMode="numeric"
            dir="ltr"
            placeholder="01012345678"
            defaultValue={distributor?.phone ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="City (Arabic)">
          <input
            name="cityAr"
            required
            dir="rtl"
            defaultValue={distributor?.cityAr ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="City (English)">
          <input
            name="cityEn"
            required
            defaultValue={distributor?.cityEn ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Region" hint="Which group they appear under in the list">
          <select
            name="region"
            defaultValue={distributor?.region ?? REGIONS[0]}
            className={inputClass}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r].en}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Display order" hint="Lower shows first within its region">
          <input
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={distributor?.sortOrder ?? "0"}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Getting a real pin is the fiddly part of adding a distributor, so
          the instructions live next to the fields rather than in a manual. */}
      <div className="border border-rule bg-bone p-4">
        <p className="text-xs font-bold text-stone uppercase mb-1">
          Map pin
        </p>
        <p className="text-[11px] text-stone mb-4 leading-relaxed">
          On Google Maps, right-click the exact spot and click the numbers at
          the top of the menu — that copies{" "}
          <span className="font-mono">latitude, longitude</span> in that order.
          Paste the first number into Latitude and the second into Longitude.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Latitude" hint="Egypt is roughly 21.5 to 32.0">
            <input
              name="lat"
              required
              inputMode="decimal"
              dir="ltr"
              placeholder="30.0333"
              defaultValue={distributor?.lat ?? ""}
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Longitude" hint="Egypt is roughly 24.5 to 37.0">
            <input
              name="lng"
              required
              inputMode="decimal"
              dir="ltr"
              placeholder="31.1000"
              defaultValue={distributor?.lng ?? ""}
              className={`${inputClass} font-mono`}
            />
          </Field>
        </div>
      </div>

      <Field
        label="Map link"
        hint="Optional. Leave blank and we build a Google Maps search from the Arabic city name."
      >
        <input
          name="mapUrl"
          type="url"
          dir="ltr"
          placeholder="https://www.google.com/maps/..."
          defaultValue={distributor?.mapUrl ?? ""}
          className={`${inputClass} font-mono text-xs`}
        />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={distributor?.isActive ?? true}
          className="w-4 h-4 accent-emerald-600"
        />
        <span className="text-sm font-semibold text-ink">
          Shown on the public locations page
        </span>
      </label>

      <SubmitButton type="submit" disabled={pending}>
        {pending
          ? "Saving…"
          : distributor?.id
            ? "Save changes"
            : "Add distributor"}
      </SubmitButton>
    </form>
  );
}
