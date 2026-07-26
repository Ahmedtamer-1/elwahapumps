import React from "react";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { getDictionary, hasLocale, Locale } from "./dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SplashScreen from "@/components/SplashScreen";
import "../globals.css";

// Load Google Fonts
const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export async function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  const isAr = lang === "ar";
  return {
    title: {
      template: isAr 
        ? "%s | شركة الواحة لخدمات الآبار والطلمبات" 
        : "%s | El Waha Pumps & Wells Services",
      default: isAr
        ? "شركة الواحة لخدمات الآبار والطلمبات | توريد وصيانة طلمبات ومواتير"
        : "El Waha Pumps & Wells Services | Supply & Maintenance",
    },
    description: isAr
      ? "شركة الواحة لخدمات الآبار والطلمبات بمصر، خبرة 20 عاماً في حفر الآبار وتوريد وصيانة الطلمبات الغاطسة، المحركات، لوحات التشغيل الكهربائية ومنظمات الجهد."
      : "El Waha Pumps Company in Egypt, 20+ years of experience in drilling wells, supply, and maintenance of submersible pumps, motors, and electrical panels.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  // Narrow type or trigger 404
  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = ibmPlex.variable;

  return (
    <html lang={lang} dir={dir} className={fontClass}>
      <body className="bg-white text-neutral-900 antialiased font-sans flex flex-col min-h-screen">
        <SplashScreen />
        <Header lang={lang} dict={dict} />
        
        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer lang={lang} dict={dict} />
        <WhatsAppButton lang={lang} />
      </body>
    </html>
  );
}
