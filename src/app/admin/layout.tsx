import React from "react";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | El Waha Admin",
    default: "El Waha Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={ibmPlex.variable}>
      <body className="bg-neutral-100 text-neutral-900 antialiased font-sans">{children}</body>
    </html>
  );
}
