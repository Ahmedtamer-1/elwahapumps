import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerToken,
  type CustomerSession,
} from "./customer-session";

/** Reads and verifies the customer cookie. Returns null when signed out. */
export async function getCurrentCustomer(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

/**
 * Guard for the account pages.
 *
 * Takes the locale because a customer signed out of /ar/account belongs on the
 * Arabic sign-in page, not the English one — the admin never has this problem
 * because the admin is English-only.
 */
export async function requireCustomer(lang: string): Promise<CustomerSession> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/${lang}/account/login`);
  return customer;
}
