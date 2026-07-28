/** Shared CRM vocabulary — kept in one place so the admin UI and the API agree. */

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTED",
  "WON",
  "LOST",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Statuses that still need someone to act on them. */
export const OPEN_LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "QUOTED"];

export const LEAD_SOURCES = ["CONTACT_FORM", "WHATSAPP_CART", "MANUAL"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const INQUIRY_STATUSES = ["NEW", "CONTACTED", "CONVERTED"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const ACTIVITY_TYPES = ["NOTE", "CALL", "EMAIL", "STATUS_CHANGE"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Badge styling. Every badge also renders its label, so color never carries meaning alone. */
export const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  NEW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONTACTED: "bg-sky-50 text-sky-700 border-sky-200",
  QUALIFIED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  QUOTED: "bg-amber-50 text-amber-800 border-amber-200",
  WON: "bg-emerald-600 text-white border-emerald-600",
  LOST: "bg-neutral-100 text-neutral-600 border-neutral-300",
};

export const INQUIRY_STATUS_STYLE: Record<InquiryStatus, string> = {
  NEW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONTACTED: "bg-sky-50 text-sky-700 border-sky-200",
  CONVERTED: "bg-emerald-600 text-white border-emerald-600",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  CONTACT_FORM: "Contact form",
  WHATSAPP_CART: "WhatsApp cart",
  MANUAL: "Added manually",
};

export function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
