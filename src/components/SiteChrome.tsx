"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Renders the site header, footer and floating buttons on every page except
 * the ones meant to stand alone full-screen (currently sign-in).
 *
 * The header and footer stay server components: the layout builds them and
 * passes them in as nodes, and this only decides whether to place them.
 */
const STANDALONE = [/^\/(ar|en)\/account\/login\/?$/];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (STANDALONE.some((re) => re.test(pathname))) return null;
  return <>{children}</>;
}
