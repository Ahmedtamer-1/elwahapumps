import React from "react";
import { Search } from "lucide-react";

/**
 * Duty-point input.
 *
 * A plain GET form, deliberately: it needs no client JavaScript, the result is a
 * shareable URL an engineer can send to a customer, and the browser's own history
 * gives back/forward through past selections for free.
 */

interface Props {
  dict: Record<string, string>;
  flow: string;
  flowUnit: string;
  head: string;
  headUnit: string;
  action: string;
}

const FLOW_UNITS = [
  { value: "m3h", key: "unitM3h" },
  { value: "ls", key: "unitLs" },
  { value: "lmin", key: "unitLmin" },
];

const HEAD_UNITS = [
  { value: "m", key: "unitM" },
  { value: "bar", key: "unitBar" },
];

export default function SelectorForm({
  dict,
  flow,
  flowUnit,
  head,
  headUnit,
  action,
}: Props) {
  return (
    <form
      method="get"
      action={action}
      className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <Field
        label={dict.flowLabel}
        name="q"
        value={flow}
        placeholder={dict.flowPlaceholder}
        unitName="qu"
        unitValue={flowUnit}
        units={FLOW_UNITS.map((u) => ({ value: u.value, label: dict[u.key] }))}
      />
      <Field
        label={dict.headLabel}
        name="h"
        value={head}
        placeholder={dict.headPlaceholder}
        unitName="hu"
        unitValue={headUnit}
        units={HEAD_UNITS.map((u) => ({ value: u.value, label: dict[u.key] }))}
      />
      <button
        type="submit"
        className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 font-semibold text-black transition hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        <Search size={18} aria-hidden />
        {dict.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  placeholder,
  unitName,
  unitValue,
  units,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  unitName: string;
  unitValue: string;
  units: { value: string; label: string }[];
}) {
  const id = `selector-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-300">
        {label}
      </label>
      <div className="flex overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 focus-within:border-sky-500">
        <input
          id={id}
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          inputMode="decimal"
          type="text"
          autoComplete="off"
          className="h-[46px] w-full bg-transparent px-3 text-white placeholder:text-neutral-600 focus:outline-none"
        />
        <select
          name={unitName}
          defaultValue={unitValue}
          aria-label={label}
          className="h-[46px] border-s border-neutral-700 bg-neutral-800 px-2 text-sm text-neutral-200 focus:outline-none"
        >
          {units.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
