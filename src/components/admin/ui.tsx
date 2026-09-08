import React from "react";

/**
 * The admin primitives, on the brand system.
 *
 * These were the last components on the site still wearing the default kit —
 * rounded-2xl cards, neutral greys, soft shadows, a mint focus ring. That was
 * defensible while the dashboard was internal-only, but it is the same
 * company, the same typefaces are already loaded, and staff move between the
 * CRM and the public site all day. Nothing here changes what a component does;
 * it changes what it is made of: square corners, the five colours, rules
 * instead of shadows, and mono kept for labels and figures.
 *
 * Every admin screen composes from this file, so correcting it here corrects
 * the dashboard wholesale rather than page by page.
 */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    /* Opens on a pine rule, the way every section on the public site does. */
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6 border-t-2 border-pine pt-4">
      <div>
        <h1 className="text-h3 font-extrabold text-pine">{title}</h1>
        {subtitle && <p className="text-small text-stone mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    /* A hairline, not a shadow. §03.5 allows flat pine, bone or white — a
       drop shadow is a sixth surface treatment the identity does not have. */
    <section className={`bg-white border border-rule ${className}`}>
      {title && (
        <div className="px-5 pt-5 pb-3 border-b border-rule-light">
          <h2 className="text-small font-bold text-ink">{title}</h2>
          {subtitle && <p className="text-xs text-stone mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Badge({ label, className }: { label: string; className: string }) {
  return (
    /* Mono, because a status badge is a label — §05's one job for the face. */
    <span
      className={`inline-flex items-center px-2 py-0.5 border font-mono text-[11px] font-medium uppercase tracking-[0.1em] ${className}`}
    >
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-12 text-small text-stone">{message}</div>;
}

export function SubmitButton({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    /* Field on hover, not a darker pine: the ramp maps emerald-500 and -600
       both to Pine, so the old hover moved the button to the colour it
       already was. */
    primary: "bg-pine hover:bg-field text-bone",
    ghost: "bg-white border border-rule hover:border-pine text-ink",
    danger: "bg-white border border-error/40 hover:bg-error-container text-error",
  }[variant];

  return (
    <button
      {...props}
      className={`px-4 py-2 text-small font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

/* No `outline-none` here on purpose. globals.css sets a brass :focus-visible
   ring for the whole site; suppressing it locally — as the mint focus ring
   this replaces did — would leave keyboard users with only a 1px border
   change to go on. The border darkens to pine as well, so the field reads as
   active with or without the ring. */
export const inputClass =
  "w-full px-3 py-2.5 border border-rule focus:border-pine text-small transition-colors bg-white text-ink placeholder:text-stone-light";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="spec-label block mb-1.5">{label}</span>
      {children}
      {hint && <span className="block font-mono text-[11px] text-stone-light mt-1">{hint}</span>}
    </label>
  );
}
