import React from "react";

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
    <div className="bg-white border-b border-rule p-[22px_40px] flex items-center justify-between mb-8 -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div>
        <div className="font-medium text-[10.5px] font-mono tracking-[0.16em] uppercase text-stone-light">
          {subtitle || "Account overview"}
        </div>
        <h1 className="mt-[8px] font-extrabold text-[24px] leading-[28px] tracking-[-0.02em] text-ink">
          {title}
        </h1>
      </div>
      {action && <div className="flex gap-3">{action}</div>}
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
    <section className={`bg-white border border-rule ${className}`}>
      {title && (
        <div className="p-[20px_26px] border-b border-rule flex items-center justify-between">
          <div>
            <h2 className="m-0 font-extrabold text-[16px] text-ink">{title}</h2>
            {subtitle && <p className="text-[11px] font-mono text-stone mt-1">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-[20px_26px]">{children}</div>
    </section>
  );
}

export function Badge({ label, className }: { label: string; className: string }) {
  // Let parent pass custom coloring, but we apply the core layout and typography for badges
  return (
    <span
      className={`inline-flex items-center px-2 py-1 border font-medium text-[9.5px] font-mono tracking-[0.14em] uppercase whitespace-nowrap rounded-none ${className}`}
    >
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-sm text-stone">{message}</div>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-pine hover:bg-field text-bone",
    ghost: "bg-white border border-rule hover:border-pine text-ink",
    danger: "bg-white border border-red-200 hover:bg-red-50 text-red-600",
  }[variant];

  return (
    <button
      {...props}
      className={`px-5 py-3 font-semibold text-[12.5px] transition-colors rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export const inputClass =
  "w-full px-[15px] py-[15px] border border-rule/25 focus:border-pine outline-none text-[13.5px] font-mono text-stone-light focus:text-ink bg-transparent rounded-none transition-colors";

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
      <span className="block text-[12px] font-semibold text-ink mb-[7px]">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-stone mt-2">{hint}</span>}
    </label>
  );
}
