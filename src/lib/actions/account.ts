"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createCustomerToken,
  CUSTOMER_SESSION_COOKIE,
  customerCookieOptions,
} from "@/lib/customer-session";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

/**
 * Customer accounts — sign up, sign in, sign out.
 *
 * Deliberately close to lib/actions/auth.ts, which does the same job for
 * staff: the same rate limiting on both axes, the same single error message
 * for "no such account" and "wrong password", and the same bcrypt cost paid
 * on the unknown-account path so the two cannot be told apart by timing.
 * What differs is which cookie is written and which table is read — a
 * customer signing in never touches User, and nothing here can mint a staff
 * session.
 */

/** A bcrypt hash of a random string nobody holds the input to. Compared
 *  against when the email is unknown, purely to spend the same ~100ms a real
 *  account spends. Not a credential — nothing verifies against it. */
const TIMING_EQUALISER_HASH = "$2b$10$UPbGbEw39z4vgBoGi5LNj.x.wB7noxTKoVaBcqk9dBxVPMmiLPWmy";

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
/** Sign-up is rarer than sign-in and costs a row, so it gets a tighter cap. */
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export interface AccountFormState {
  error?: string;
  /** Kept so a failed submit does not wipe what was typed. */
  values?: { name?: string; email?: string; phone?: string };
}

const isAr = (lang: string) => lang === "ar";

/**
 * An Egyptian mobile in the local 01XXXXXXXXX form, or null.
 *
 * Accepts what people actually type: spaces and dashes, a +20 or 0020 or bare
 * 20 country code, with or without the trunk zero after it. Everything the
 * site stores and dials is the local form, so this is where the variants
 * collapse into one.
 */
function egyptianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("20")) digits = digits.slice(2);
  if (!digits.startsWith("0")) digits = `0${digits}`;
  return /^01\d{9}$/.test(digits) ? digits : null;
}

const messages = {
  invalidEmail: { en: "Enter a valid email address", ar: "أدخل بريداً إلكترونياً صحيحاً" },
  nameRequired: { en: "Your name is required", ar: "الاسم مطلوب" },
  passwordShort: {
    en: "Password must be at least 8 characters",
    ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
  },
  passwordRequired: { en: "Password is required", ar: "كلمة المرور مطلوبة" },
  mismatch: { en: "The two passwords do not match", ar: "كلمتا المرور غير متطابقتين" },
  taken: {
    en: "An account already exists for this email. Sign in instead.",
    ar: "يوجد حساب بهذا البريد بالفعل. سجّل الدخول بدلاً من ذلك.",
  },
  invalid: { en: "Incorrect email or password", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
  throttled: {
    en: "Too many attempts. Try again in a few minutes.",
    ar: "محاولات كثيرة. حاول مرة أخرى بعد قليل.",
  },
  phoneInvalid: {
    en: "Enter an 11-digit Egyptian mobile, e.g. 01012345678",
    ar: "أدخل رقم موبايل مصري من 11 رقم، مثال 01012345678",
  },
} as const;

const say = (key: keyof typeof messages, lang: string) =>
  isAr(lang) ? messages[key].ar : messages[key].en;

/* ------------------------------------------------------------------ */
/* Sign up                                                             */
/* ------------------------------------------------------------------ */

export async function registerAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const lang = String(formData.get("lang") ?? "en");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  // Echoed back on every failure path so a rejected form still holds what
  // was typed. The password never is.
  const values = { name, email, phone: phoneRaw };

  if (!name) return { error: say("nameRequired", lang), values };
  if (!z.string().email().safeParse(email).success) {
    return { error: say("invalidEmail", lang), values };
  }
  if (password.length < 8) return { error: say("passwordShort", lang), values };
  if (password !== confirm) return { error: say("mismatch", lang), values };

  // Optional, but if given it has to be a real Egyptian mobile — this is the
  // number the office will call back on, and it is stored in the local form
  // every other phone on the site uses.
  const phone = phoneRaw ? egyptianMobile(phoneRaw) : null;
  if (phoneRaw && !phone) return { error: say("phoneInvalid", lang), values };

  const ip = clientIp(await headers());
  const capped = rateLimit(`register:ip:${ip}`, {
    limit: REGISTER_LIMIT,
    windowMs: REGISTER_WINDOW_MS,
  });
  if (!capped.ok) return { error: say("throttled", lang), values };

  const existing = await prisma.customerAccount.findUnique({ where: { email } });
  if (existing) return { error: say("taken", lang), values };

  /* Attach to the CRM record the office may already hold for this person.
     Staff enter customers from phone calls and leads long before anyone
     signs up, and opening a second record for the same email would split
     their history across two rows in the admin. Matched on email only:
     phone is entered too inconsistently to be an identity, and a wrong
     match would hand one customer another's inquiries. */
  const customer = await prisma.customer.findFirst({
    where: { email: { equals: email } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const passwordHash = await hashPassword(password);

  const account = await prisma.customerAccount.create({
    data: {
      email,
      passwordHash,
      customer: customer
        ? {
            connect: { id: customer.id },
            // Their own spelling of their name and their own number win over
            // whatever was typed for them on the phone.
          }
        : { create: { name, email, phone, source: "website-account" } },
    },
    select: { id: true, customerId: true },
  });

  if (customer) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { name, ...(phone ? { phone } : {}) },
    });
  }

  await startSession({ accountId: account.id, customerId: account.customerId, name, email });
  redirect(`/${lang}/account`);
}

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

export async function signIn(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const lang = String(formData.get("lang") ?? "en");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!z.string().email().safeParse(email).success) {
    return { error: say("invalidEmail", lang), values };
  }
  if (!password) return { error: say("passwordRequired", lang), values };

  // Both axes: the address stops one host grinding through many accounts,
  // the email stops a distributed attempt grinding through one account.
  const ip = clientIp(await headers());
  const throttled = { error: say("throttled", lang), values };
  if (!rateLimit(`account:ip:${ip}`, { limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS }).ok) {
    return throttled;
  }
  if (!rateLimit(`account:email:${email}`, { limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS }).ok) {
    return throttled;
  }

  const account = await prisma.customerAccount.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      customerId: true,
      customer: { select: { name: true } },
    },
  });

  const invalid = { error: say("invalid", lang), values };

  if (!account) {
    // Spend the same time a real comparison would; see the note above.
    await verifyPassword(password, TIMING_EQUALISER_HASH);
    return invalid;
  }

  if (!(await verifyPassword(password, account.passwordHash))) return invalid;

  resetRateLimit(`account:ip:${ip}`);
  resetRateLimit(`account:email:${email}`);

  await prisma.customerAccount.update({
    where: { id: account.id },
    data: { lastLoginAt: new Date() },
  });

  await startSession({
    accountId: account.id,
    customerId: account.customerId,
    name: account.customer.name,
    email,
  });

  // Only ever back into this locale's own account area — an open redirect
  // here would let a phishing link bounce a signed-in customer anywhere.
  const next = formData.get("next");
  const safeNext =
    typeof next === "string" && next.startsWith(`/${lang}/`) ? next : `/${lang}/account`;
  redirect(safeNext);
}

/* ------------------------------------------------------------------ */
/* Sign out                                                            */
/* ------------------------------------------------------------------ */

export async function signOut(formData: FormData) {
  const lang = String(formData.get("lang") ?? "en");
  const store = await cookies();
  store.delete(CUSTOMER_SESSION_COOKIE);
  redirect(`/${lang}`);
}

async function startSession(session: {
  accountId: string;
  customerId: string;
  name: string;
  email: string;
}) {
  const token = await createCustomerToken(session);
  const store = await cookies();
  store.set(CUSTOMER_SESSION_COOKIE, token, customerCookieOptions);
}
