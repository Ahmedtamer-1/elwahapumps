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

/**
 * Badge styling. Every badge also renders its label, so colour never carries
 * meaning alone.
 *
 * The pipeline used to be a rainbow — sky, indigo and amber alongside the
 * greens — which is four hues the brand does not own, on the one screen staff
 * look at all day. §04 allows a status red and a status green and nothing
 * else, so the states are separated by *weight* instead of hue: a tint, then
 * an outline, then a brass fill at the point money is on the table, then a
 * solid pine when it lands. That reads as a progression, which a set of
 * unrelated colours never did, and it survives the greyscale print-out
 * someone inevitably takes into a meeting.
 */
export const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  NEW: "bg-primary-container text-pine border-emerald-200",
  CONTACTED: "bg-bone text-ink border-ink/30",
  QUALIFIED: "bg-white text-pine border-pine",
  QUOTED: "bg-brass text-ink border-brass",
  WON: "bg-pine text-bone border-pine",
  LOST: "bg-bone text-stone border-rule",
};

export const INQUIRY_STATUS_STYLE: Record<InquiryStatus, string> = {
  NEW: "bg-primary-container text-pine border-emerald-200",
  CONTACTED: "bg-white text-pine border-pine",
  CONVERTED: "bg-pine text-bone border-pine",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  CONTACT_FORM: "Contact form",
  WHATSAPP_CART: "WhatsApp cart",
  MANUAL: "Added manually",
};

export function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
