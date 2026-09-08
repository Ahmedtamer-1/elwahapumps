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
  /**
   * Which ground the form is sitting on.
   *
   * `ink` is the selector page's header band: no panel, the fields sitting
   * straight on the dark ground beside the headline. `bone` is the homepage
   * card — a paper panel, fields stacked, because it is 460px wide there and
   * a three-across row would crush the unit selects.
   *
   * Same markup, same GET, same names either way — only the surface changes.
   */
  tone?: "bone" | "ink";
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
  tone = "ink",
}: Props) {
  const onBone = tone === "bone";
  return (
    <form
      method="get"
      action={action}
      className={
        onBone
          ? "bg-bone border-t-[3px] border-brass p-8 sm:p-10"
          : "grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      }
    >
      {onBone && <div className="spec-label mb-5">{dict.dutyPoint}</div>}
      <Field
        label={dict.flowLabel}
        name="q"
        value={flow}
        placeholder={dict.flowPlaceholder}
        unitName="qu"
        unitValue={flowUnit}
        units={FLOW_UNITS.map((u) => ({ value: u.value, label: dict[u.key] }))}
        tone={tone}
      />
      <Field
        label={dict.headLabel}
        name="h"
        value={head}
        placeholder={dict.headPlaceholder}
        unitName="hu"
        unitValue={headUnit}
        units={HEAD_UNITS.map((u) => ({ value: u.value, label: dict[u.key] }))}
        tone={tone}
        className={onBone ? "mt-5" : undefined}
      />
      <button
        type="submit"
        className={
          onBone
            ? "mt-6 flex w-full items-center justify-center gap-2 bg-pine px-6 py-4 font-semibold text-bone transition-colors hover:bg-field"
            : "inline-flex h-[46px] items-center justify-center gap-2 bg-brass px-6 font-semibold text-ink transition hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
        }
      >
        <Search size={18} aria-hidden />
        {dict.submit}
      </button>
      {onBone && (
        <p className="mt-3.5 text-xs leading-5 text-stone">{dict.notAdvice}</p>
      )}
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
  tone = "ink",
  className,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  unitName: string;
  unitValue: string;
  units: { value: string; label: string }[];
  tone?: "bone" | "ink";
  className?: string;
}) {
  /* Ids must stay unique per document: the homepage renders this form while
     the header may already carry another, and a duplicate id would point the
     label at the wrong input. */
  const id = `selector-${tone}-${name}`;
  const onBone = tone === "bone";
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={
          onBone
            ? "mb-1.5 block text-xs font-semibold text-ink"
            : "mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-bone/55"
        }
      >
        {label}
      </label>
      <div
        className={`flex overflow-hidden border ${
          onBone
            ? "border-rule bg-white focus-within:border-pine"
            : "border-transparent bg-bone focus-within:border-brass"
        }`}
      >
        {/* Mono, because a duty point is a specification — the one job §05
            keeps the face for. */}
        <input
          id={id}
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          inputMode="decimal"
          type="text"
          autoComplete="off"
          className="h-[46px] w-full bg-transparent px-3 font-mono text-[15px] text-ink placeholder:text-stone-light focus:outline-none"
        />
        <select
          name={unitName}
          defaultValue={unitValue}
          aria-label={label}
          className="h-[46px] border-s border-rule bg-bone px-2 font-mono text-xs text-stone focus:outline-none"
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
