"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Globe, ChevronDown } from "lucide-react";
import CartButton from "@/components/cart/CartButton";
import Logo from "@/components/Logo";

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

  // Pine on white and bone on pine are the two approved pairings for nav
  // text (§04 Fig. 7). Brass marks the active item — an accent on a rule,
  // well under the 10% ceiling.
  const textColor = isTransparent ? "text-bone/85 hover:text-bone" : "text-ink hover:text-pine";
  const activeColor = isTransparent
    ? "text-bone after:bg-brass"
    : "text-pine after:bg-brass";

  const navLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/selector`, label: dict.nav.pumpSelector || "Pump Selector" },
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
            ? "bg-white shadow-sm border-b-2 border-brass"
            : isHome
              ? "bg-transparent border-b border-bone/10"
              : "bg-white border-b border-rule"
        }`}
      >
        {/* Topbar — secondary links, set as spec labels: mono, wide, small.
            The one place mono is allowed outside a spec plate (§05). */}
        <div className={`hidden lg:block border-b transition-colors duration-300 ${isTransparent ? 'border-bone/10' : 'border-rule-light bg-bone'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-9 gap-7">
              {topLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  // No force-caps here: these labels come from the dictionary,
                  // so on the Arabic site the global rule drops the uppercase
                  // and the tracking (§5.2 rules 3 and 4).
                  className={`font-mono text-[11px] leading-4 font-medium tracking-[0.16em] uppercase transition-colors duration-150 ${
                    isTransparent ? "text-bone/70 hover:text-brass" : "text-stone hover:text-pine"
                  }`}
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
            {/* Logo — direction A, drawn from tokens rather than loaded as
                three PNGs in three different greens (§1.2b). Reversed over
                the hero, pine once the header goes solid. The full lockup
                carries the descriptor; below 120px the short one drops it
                rather than shrinking it (§3.3). */}
            {/* Responsive switch lives on these wrappers, not on Logo:
                Logo sets its own `display` inline, which would beat a
                `hidden` utility class and render both variants at once. */}
            <Link href={`/${lang}`} aria-label="El Waha" className="flex items-center min-w-0">
              <span className="hidden sm:block">
                <Logo
                  variant="full"
                  x={18}
                  reversed={isTransparent}
                  descriptor="PUMPS & WELLS SERVICES"
                />
              </span>
              <span className="block sm:hidden">
                <Logo variant="short" x={16} reversed={isTransparent} />
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
                    { id: "spare-parts", label: dict.productsPage.spareParts },
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
                        <div className="w-full bg-white shadow-lg pb-6 border-t-2 border-brass">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                              {productCategories.map(category => {
                                const categoryProducts = products.filter(p => p.category === category.id);
                                if (categoryProducts.length === 0) return null;
                                return (
                                  <div key={category.id} className="flex flex-col">
                                    {/* Column heads sit on a pine rule, the
                                        report's section-head treatment. */}
                                    <h3 className="font-extrabold text-[15px] leading-6 mb-4 pt-2 text-pine border-t-2 border-pine">
                                      {category.label}
                                    </h3>
                                    <ul className="space-y-2.5">
                                      {categoryProducts.map(product => (
                                        <li key={product.id}>
                                          <Link
                                            href={`/${lang}/products/${product.id}`}
                                            className="text-[13px] leading-5 transition-colors block text-stone hover:text-pine"
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

                            {/* Bottom banner — §07 voice: name the scope
                                instead of calling it "industrial solutions". */}
                            <div className="mt-8 pt-5 border-t border-rule flex flex-wrap gap-4 items-center justify-between">
                              <div className="text-[13px] leading-5 text-stone">
                                {lang === "ar"
                                  ? "طلمبات ومواتير ولوحات تشغيل ومواسير وكابلات — من مصدر واحد."
                                  : "Pumps, motors, control panels, pipe and cable — from one supplier."}
                              </div>
                              <Link
                                href={`/${lang}/products`}
                                className="font-mono text-[11px] font-medium tracking-[0.16em] uppercase flex items-center gap-2 transition-colors text-pine hover:text-brass"
                              >
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

              {/* Language Switcher. Square corners throughout — the system
                  is built like a machine plate, not a soft UI kit. */}
              <Link
                href={toggleLanguage()}
                className={`flex items-center gap-1.5 px-3 py-2 border text-[13px] font-semibold transition-colors ${
                  isTransparent
                    ? "border-bone/25 text-bone hover:border-brass hover:text-brass"
                    : "border-rule bg-bone text-ink hover:border-pine hover:text-pine"
                }`}
                aria-label="Change Language"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>{lang === "ar" ? "English" : "العربية"}</span>
              </Link>

              {/* Call Now — the one solid button. §2.4 value 04: the number
                  is not a badge to display, it is a number that gets
                  answered, so it stays a real tel: link. */}
              <a
                href="tel:+201066685532"
                className="flex items-center gap-2 bg-pine hover:bg-emerald-700 text-bone px-4 py-2 text-[13px] font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>{dict.nav.callNow}</span>
              </a>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3 lg:hidden">
              <CartButton lang={lang} isTransparent={isTransparent} />
              <Link
                href={toggleLanguage()}
                className={`p-2 transition-colors ${
                  isTransparent ? "text-bone hover:text-brass" : "bg-bone text-pine hover:text-brass"
                }`}
                aria-label="Change Language"
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 transition-colors ${
                  isTransparent ? "text-bone hover:text-brass" : "bg-bone text-pine hover:text-brass"
                }`}
                aria-label="Toggle Menu"
                aria-expanded={isOpen}
                aria-controls="mobile-nav"
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
        id="mobile-nav"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 start-0 z-40 w-72 max-w-full bg-white border-e-2 border-brass shadow-xl p-6 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div>
          {/* Header Inside Drawer — the real short lockup, not "EL WAHA"
              faked in a monospace face (§1.2a). */}
          <div className="flex items-center justify-between pb-5 border-b border-rule">
            <Logo variant="short" x={16} />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone hover:text-pine transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="space-y-0.5 mb-6">
              {navLinks.map((link, idx) => {
                return (
                  <Link
                    key={idx}
                    href={link.href || "#"}
                    onClick={() => setIsOpen(false)}
                    className="block text-ink hover:text-pine font-semibold text-[15px] py-2 border-b border-rule-light"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 space-y-1">
              <span className="spec-label block mb-3">
                {lang === "ar" ? "روابط أخرى" : "More"}
              </span>
              {topLinks.map((link, idx) => {
                return (
                  <Link
                    key={idx}
                    href={link.href || "#"}
                    onClick={() => setIsOpen(false)}
                    className="block text-stone hover:text-pine text-[13px] py-1.5"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Call to Action at Bottom of Drawer */}
        <div className="mt-8 pt-5 border-t border-rule">
          <a
            href="tel:+201066685532"
            className="flex items-center justify-center gap-2 w-full bg-pine hover:bg-emerald-700 text-bone py-3 font-semibold text-sm transition-colors"
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span>{dict.nav.callNow}</span>
          </a>
          {/* Western digits everywhere, including the Arabic site (§5.2
              rule 5) — numbers get copied across both languages. */}
          <span className="font-mono text-[11px] tracking-[0.16em] text-stone block text-center mt-3">
            +20 106 668 5532
          </span>
        </div>
      </div>
    </>
  );
}
