"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Globe, ChevronDown } from "lucide-react";
import CartButton from "@/components/cart/CartButton";

/** Just enough of a product to build the mega-menu. */
export interface HeaderProduct {
  id: string;
  title: string;
  category: string;
}

interface HeaderProps {
  lang: string;
  dict: any;
  products: HeaderProduct[];
}

export default function Header({ lang, dict, products }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute language toggle link
  const toggleLanguage = () => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    // path is /[lang]/...
    if (segments.length > 1) {
      segments[1] = lang === "ar" ? "en" : "ar";
      return segments.join("/");
    }
    return lang === "ar" ? "/en" : "/ar";
  };

  const isHome = pathname === "/" || pathname === "/ar" || pathname === "/en";
  const isTransparent = isHome && !isScrolled;

  const textColor = isTransparent ? "text-white/90 hover:text-white" : "text-neutral-700 hover:text-emerald-600";
  const activeColor = isTransparent ? "text-white after:bg-white" : "text-emerald-600 after:bg-emerald-500";

  const navLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/agents`, label: dict.nav.localDealer || "Local Dealer" },
    { href: `/${lang}/careers`, label: dict.nav.career || "Career" },
  ];

  const topLinks = [
    { href: `/${lang}/catalogues`, label: dict.nav.catalogues || "Catalogues" },
    { href: `/${lang}/locations`, label: dict.nav.locations || "Locations" },
    { href: `/${lang}/events`, label: dict.nav.events || "Events" },
    { href: `/${lang}/support`, label: dict.nav.afterSales || "Aftersales Support" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 flex flex-col ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b-3 border-emerald-500"
            : isHome 
              ? "bg-transparent border-b border-white/10"
              : "bg-white/90 backdrop-blur-xs border-b border-neutral-100"
        }`}
      >
        {/* Topbar for Secondary Links */}
        <div className={`hidden lg:block border-b transition-colors duration-300 ${isTransparent ? 'border-white/10' : 'border-neutral-100 bg-neutral-50/70'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-9 gap-6 text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              {topLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className={`transition-colors duration-150 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-neutral-500 hover:text-emerald-600'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={`w-full transition-all duration-300 ${isScrolled ? 'py-3' : isHome ? 'py-5' : 'py-5'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={`/${lang}`} className="flex items-center gap-3">
              <Image
                src="/images/brand/elwaha-logo-h.png"
                alt={lang === "ar" ? "شعار شركة الواحة لخدمات الآبار والطلمبات" : "El Waha for Well & Pump Services logo"}
                width={609}
                height={183}
                priority
                className={`h-10 sm:h-12 w-auto transition-all duration-300 ${isTransparent ? 'brightness-0 invert' : ''}`}
              />
              <span className={`text-sm font-medium border-s ps-3 hidden sm:inline transition-colors duration-300 ${isTransparent ? 'border-white/30 text-white/80' : 'border-neutral-200 text-neutral-500'}`}>
                {lang === "ar" ? "للآبار والطلمبات" : "Pumps & Wells"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href || pathname === `${link.href}/`;
                const isProducts = link.href === `/${lang}/products`;

                if (isProducts) {
                  const productCategories = [
                    { id: "pumps", label: dict.productsPage.pumps },
                    { id: "motors", label: dict.productsPage.motors },
                    { id: "electrical", label: dict.productsPage.electrical },
                    { id: "pipes", label: dict.productsPage.pipes },
                    { id: "thrust-bearings", label: dict.productsPage.thrustBearings },
                    { id: "cables", label: dict.productsPage.cables },
                  ];

                  return (
                    <div key={idx} className="group py-6 -my-6 flex items-center">
                      <Link
                        href={link.href}
                        className={`flex items-center gap-1 font-semibold text-sm transition-colors duration-150 relative ${
                          isActive 
                            ? `${activeColor} after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5` 
                            : textColor
                        }`}
                      >
                        {link.label}
                        <ChevronDown className="w-4 h-4 opacity-70 transition-transform duration-300 group-hover:rotate-180" />
                      </Link>

                      {/* Mega Menu Dropdown */}
                      <div className="absolute top-[100%] left-0 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        {/* Full width glass background */}
                        <div className="w-full bg-white/95 backdrop-blur-2xl shadow-2xl pb-6 border-t border-neutral-100">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                              {productCategories.map(category => {
                                const categoryProducts = products.filter(p => p.category === category.id);
                                if (categoryProducts.length === 0) return null;
                                return (
                                  <div key={category.id} className="flex flex-col">
                                    <h3 className="font-bold text-base mb-4 border-b pb-2 text-neutral-900 border-neutral-200">
                                      {category.label}
                                    </h3>
                                    <ul className="space-y-3">
                                      {categoryProducts.map(product => (
                                        <li key={product.id}>
                                          <Link
                                            href={`/${lang}/products/${product.id}`}
                                            className="text-sm font-medium transition-colors block text-neutral-600 hover:text-emerald-600"
                                          >
                                            {product.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Bottom Banner */}
                            <div className="mt-8 pt-6 border-t flex items-center justify-between border-neutral-100">
                              <div className="text-sm text-neutral-500">
                                {lang === "ar" ? "اكتشف مجموعتنا الكاملة من المعدات الصناعية" : "Discover our complete range of industrial equipment"}
                              </div>
                              <Link href={`/${lang}/products`} className="font-bold text-sm flex items-center gap-2 transition-colors text-emerald-600 hover:text-emerald-700">
                                {dict.productsPage.all}
                                <span aria-hidden="true" className="rtl:rotate-180 inline-block">&rarr;</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={idx}
                    href={link.href || "#"}
                    className={`font-semibold text-sm transition-colors duration-150 relative ${
                      isActive 
                        ? `${activeColor} after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5` 
                        : textColor
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <CartButton lang={lang} isTransparent={isTransparent} />

              {/* Language Switcher */}
              <Link
                href={toggleLanguage()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  isTransparent 
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40" 
                    : "border-neutral-200 hover:border-emerald-500 bg-neutral-50 text-neutral-700 hover:text-emerald-600"
                }`}
                aria-label="Change Language"
              >
                <Globe className={`w-4.5 h-4.5 ${isTransparent ? 'text-white' : 'text-emerald-600'}`} />
                <span>{lang === "ar" ? "English" : "العربية"}</span>
              </Link>

              {/* Call Now */}
              <a
                href="tel:+201066685532"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{dict.nav.callNow}</span>
              </a>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3 lg:hidden">
              <CartButton lang={lang} isTransparent={isTransparent} />
              <Link
                href={toggleLanguage()}
                className={`p-2 rounded-lg transition-colors ${
                  isTransparent ? "bg-white/10 text-white hover:bg-white/20" : "bg-neutral-100 text-neutral-600 hover:text-emerald-600"
                }`}
                aria-label="Change Language"
              >
                <Globe className={`w-5 h-5 ${isTransparent ? 'text-white' : 'text-emerald-600'}`} />
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-colors outline-none ${
                  isTransparent ? "bg-white/10 text-white hover:bg-white/20" : "bg-neutral-100 text-neutral-600 hover:text-emerald-600"
                }`}
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Drawer Container */}
      <div
        className={`fixed inset-y-0 start-0 z-40 w-72 max-w-full bg-white border-r border-neutral-200 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div>
          {/* Header Inside Drawer */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
            <span className="text-xl font-black text-neutral-900">
              <span className="text-emerald-600 font-extrabold font-mono">EL WAHA</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="space-y-1 mb-6">
              {navLinks.map((link, idx) => {
                return (
                  <Link
                    key={idx}
                    href={link.href || "#"}
                    onClick={() => setIsOpen(false)}
                    className="block text-neutral-800 hover:text-emerald-600 font-bold text-sm py-2"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="border-t border-neutral-100 pt-4 space-y-1">
              <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">More Links</span>
              {topLinks.map((link, idx) => {
                return (
                  <Link
                    key={idx}
                    href={link.href || "#"}
                    onClick={() => setIsOpen(false)}
                    className="block text-neutral-600 hover:text-emerald-600 font-semibold text-sm py-1.5"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Call to Action at Bottom of Drawer */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <a
            href="tel:+201066685532"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-md"
          >
            <Phone className="w-5 h-5" />
            <span>{dict.nav.callNow}</span>
          </a>
        </div>
      </div>
    </>
  );
}
