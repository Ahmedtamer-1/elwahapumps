import { EMAIL } from "@/lib/company";

/**
 * Emails a human when a lead or cart inquiry arrives.
 *
 * Before this, both public forms (api/leads, api/inquiries) wrote a row to
 * SQLite and stopped — nothing told anyone a lead had come in, so it was
 * seen only if a staff member happened to open /admin/leads. This sends a
 * plain email via SMTP after the DB write; it never blocks or fails the
 * visitor's request (see notifyNewLead's callers), and if SMTP isn't
 * configured it logs a warning and no-ops rather than throwing — a
 * misconfigured mail server should not turn a real enquiry into a 500.
 *
 * Configure via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. Optional:
 * SMTP_FROM (defaults to SMTP_USER), LEAD_NOTIFY_TO (defaults to
 * lib/company.ts's EMAIL — confirm that mailbox is actually staffed before
 * relying on this in production; the live site currently advertises a
 * different, typo'd address).
 */

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
}

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    user,
    pass,
    from: process.env.SMTP_FROM || user,
    to: process.env.LEAD_NOTIFY_TO || EMAIL,
  };
}

async function sendMail(subject: string, text: string): Promise<void> {
  const config = readSmtpConfig();
  if (!config) {
    console.warn(
      "[notify] SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — skipping lead notification email.",
    );
    return;
  }

  // Imported lazily so the (fairly heavy) nodemailer module is never pulled
  // into a request that doesn't need it — e.g. a request where SMTP isn't
  // configured, which returns above before this line runs.
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });

  await transport.sendMail({
    from: config.from,
    to: config.to,
    subject,
    text,
  });
}

interface NewLeadDetails {
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string | null;
}

/**
 * Fire-and-forget from the route handler: `void notifyNewLead(...)` after
 * the DB write, never `await`ed into the response. A slow or failing mail
 * server must never delay or fail the visitor's submission.
 */
export async function notifyNewLead(lead: NewLeadDetails): Promise<void> {
  try {
    await sendMail(
      `New enquiry: ${lead.subject || "General enquiry"} — ${lead.name}`,
      [
        `Name: ${lead.name}`,
        `Phone: ${lead.phone}`,
        lead.email ? `Email: ${lead.email}` : null,
        lead.subject ? `Subject: ${lead.subject}` : null,
        lead.message ? `\nMessage:\n${lead.message}` : null,
        "\n— sent from the website contact form",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } catch (error) {
    // Logged, not thrown — see the module comment. The lead is already
    // safely in the database by the time this runs.
    console.error("[notify] Failed to send lead notification email:", error);
  }
}

interface NewCartInquiryDetails {
  id: string;
  name: string | null;
  phone: string | null;
  itemCount: number;
  totalEstimate: number | null;
}

export async function notifyNewCartInquiry(inquiry: NewCartInquiryDetails): Promise<void> {
  try {
    await sendMail(
      `New cart enquiry from ${inquiry.name || "a visitor"} (${inquiry.itemCount} item${inquiry.itemCount === 1 ? "" : "s"})`,
      [
        `Name: ${inquiry.name || "(not given)"}`,
        `Phone: ${inquiry.phone || "(not given)"}`,
        `Items: ${inquiry.itemCount}`,
        inquiry.totalEstimate ? `Estimated total: ${inquiry.totalEstimate}` : null,
        `\nSee /admin/inquiries for the itemised list (id: ${inquiry.id}).`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } catch (error) {
    console.error("[notify] Failed to send cart inquiry notification email:", error);
  }
}
