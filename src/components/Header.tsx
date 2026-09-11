"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Globe, ChevronDown, User } from "lucide-react";
import CartButton from "@/components/cart/CartButton";
import Logo from "@/components/Logo";
import type { Dictionary } from "../app/[lang]/dictionaries";
import { PHONE_SALES } from "@/lib/company";

interface HeaderProps {
  lang: string;
  dict: Dictionary;
}

export default function Header({ lang, dict }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTriggerRef = React.useRef<HTMLAnchorElement>(null);
  /** Set by Escape so returning focus to the trigger doesn't reopen the menu. */
  const megaDismissedRef = React.useRef(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const drawerCloseRef = React.useRef<HTMLButtonElement>(null);
  const menuToggleRef = React.useRef<HTMLButtonElement>(null);

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

  /*
    Mobile drawer behaviour (S6-T04). It previously had none of this: no
    Escape, no scroll lock, no focus management, and `aria-hidden` on a
    container whose links stayed focusable — the focusable-but-hidden
    trap, where a keyboard user tabs into a menu they cannot see. The
    container now uses `inert` when closed, which removes it from both
    the tab order and the accessibility tree, and this effect handles the
    rest while it is open.
  */
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Captured now, not read in cleanup — by then the ref may point
    // somewhere else.
    const toggle = menuToggleRef.current;
    drawerCloseRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const root = drawerRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Back to whatever opened it. Falling back to the toggle matters
      // because some browsers do not focus a button on mouse-down, which
      // would otherwise leave document.body as the restore target and
      // drop focus to the top of the page.
      const restoreTo =
        previouslyFocused && previouslyFocused !== document.body
          ? previouslyFocused
          : toggle;
      restoreTo?.focus();
    };
  }, [isOpen]);

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
            ? "bg-white border-b-2 border-brass"
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
            {/* Logo — the calligraphic mark alone, no wordmark: green with the
                brass alif on light grounds, white with brass reversed over
                the hero. One drawing in two colourways rather than three
                PNGs in three different greens (§1.2b). */}
            {/* One element, sized in CSS (S4-T08).
                This used to be two <Logo>s in `hidden sm:block` /
                `block sm:hidden` wrappers. `display:none` hides an image but
                does not stop it loading, and the two asked for different
                `sizes` (42px and 37px), so the browser fetched two separate
                optimised variants of the same drawing on every page — one of
                which was never shown.

                The height comes from a custom property rather than a utility
                class because Logo writes width/height as inline styles, which
                beat any class; `style` is merged last, so a var set on the
                wrapper is the one thing that can win a media query here.
                68px / 76px is the mark a quarter up from the 54px / 60px it
                stood at, which were the rendered heights of the old x=16 /
                x=18. `x` is now inert here — the inline height wins. */}
            {/* The rule that used to sit under the mark is gone — the
                artwork already carries its own brass accent, and a second
                one drawn to the logo's width read as an underline on a
                link rather than as part of the mark. The wrapper stays a
                `w-fit` box so the link’s hit area is the mark and nothing
                more. */}
            <Link
              href={`/${lang}`}
              aria-label="El Waha"
              className="flex w-fit min-w-0 [--logo-h:68px] sm:[--logo-h:76px]"
            >
              <Logo
                variant="mark"
                x={18}
                reversed={isTransparent}
                preload
                style={{ height: "var(--logo-h)", width: "auto" }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href || pathname === `${link.href}/`;
                const isProducts = link.href === `/${lang}/products`;

                if (isProducts) {
                  /*
                    The menu names equipment types, not individual models. A
                    buyer scanning it is deciding what kind of unit they need;
                    the brand names belong on the category page, where they can
                    be compared side by side. Every type links to its category.
                  */
                  const types = dict.productsPage.types;
                  const productCategories = [
                    {
                      id: "pumps",
                      label: dict.productsPage.pumps,
                      // Submersible and surface pumps are one category. Both
                      // types still get named here — a buyer scans for the
                      // words, not the slug — and both land on the same page,
                      // the way Electrical and Spare Parts already do.
                      items: [
                        { label: types.submersiblePumps, category: "pumps" },
                        { label: types.surfacePumps, category: "pumps" },
                      ],
                    },
                    {
                      id: "motors",
                      label: dict.productsPage.motors,
                      items: [{ label: types.submersibleMotors, category: "motors" }],
                    },
                    {
                      id: "electrical",
                      label: dict.productsPage.electrical,
                      items: [
                        { label: types.inverter, category: "electrical" },
                        { label: types.controlPanels, category: "electrical" },
                      ],
                    },
                    {
                      id: "pipes",
                      label: dict.productsPage.pipes,
                      items: [{ label: types.pipes, category: "pipes" }],
                    },
                    {
                      id: "spare-parts",
                      label: dict.productsPage.spareParts,
                      items: [
                        { label: types.thrustBearings, category: "spare-parts" },
                        { label: types.wires, category: "spare-parts" },
                      ],
                    },
                    {
                      id: "cables",
                      label: dict.productsPage.cables,
                      items: [{ label: types.cables, category: "cables" }],
                    },
                  ];

                  return (
                    /*
                      Open state is React state rather than `group-hover`
                      alone. The panel is `invisible` when closed, which
                      takes its links out of the tab order, so with a
                      hover-only trigger a keyboard user could never reach
                      the catalogue at all — and `aria-expanded` had
                      nothing to report (S6-T03). Focus entering the group
                      opens it, focus leaving closes it, and Escape closes
                      it and hands focus back to the trigger.
                    */
                    <div
                      key={idx}
                      className="group py-6 -my-6 flex items-center"
                      onMouseEnter={() => {
                        megaDismissedRef.current = false;
                        setMegaOpen(true);
                      }}
                      onMouseLeave={() => setMegaOpen(false)}
                      onFocus={() => {
                        // Escape hands focus back to the trigger, which
                        // fires this very handler — without the guard the
                        // menu closed and reopened in the same tick and
                        // Escape appeared to do nothing.
                        if (megaDismissedRef.current) return;
                        setMegaOpen(true);
                      }}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                          // Focus has left the trigger and the panel, so
                          // re-arm: tabbing back in should open it again.
                          megaDismissedRef.current = false;
                          setMegaOpen(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape" && megaOpen) {
                          e.stopPropagation();
                          megaDismissedRef.current = true;
                          setMegaOpen(false);
                          megaTriggerRef.current?.focus();
                        }
                      }}
                    >
                      <Link
                        href={link.href}
                        ref={megaTriggerRef}
                        aria-haspopup="true"
                        aria-expanded={megaOpen}
                        className={`flex items-center gap-1 font-semibold text-sm transition-colors duration-150 relative ${
                          isActive
                            ? `${activeColor} after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5`
                            : textColor
                        }`}
                      >
                        {link.label}
                        <ChevronDown
                          className={`w-4 h-4 opacity-70 transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </Link>

                      {/* Mega Menu Dropdown */}
                      <div
                        // transition-opacity, not transition-all: `all`
                        // animates `visibility` too, and because that is a
                        // discrete property it only flips once the 300ms
                        // transition ends. That made the panel's links
                        // unfocusable for the whole transition, and left
                        // them unfocusable indefinitely anywhere
                        // transitions are throttled or disabled — while
                        // aria-expanded already said "true". Visibility
                        // now switches immediately; only the fade animates.
                        className={`absolute top-[100%] left-0 w-full transition-opacity duration-300 z-50 ${
                          megaOpen ? "opacity-100 visible" : "opacity-0 invisible"
                        }`}
                      >
                        {/* Full width glass background */}
                        <div className="w-full bg-white pb-6 border-t-2 border-brass">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                              {productCategories.map(category => (
                                <div key={category.id} className="flex flex-col">
                                  {/* Column heads sit on a pine rule, the
                                      report's section-head treatment. A `p`,
                                      not a heading — this menu renders on
                                      every page ahead of the page's own h1,
                                      so six of these as h3 put six headings
                                      before the actual page content. */}
                                  <p className="font-extrabold text-[15px] leading-6 mb-4 pt-2 text-pine border-t-2 border-pine">
                                    {category.label}
                                  </p>
                                  <ul className="space-y-2.5">
                                    {category.items.map((item: { label: string; category: string }) => (
                                      <li key={item.label}>
                                        <Link
                                          href={`/${lang}/products/category/${item.category}`}
                                          className="text-[13px] leading-5 transition-colors block text-stone hover:text-pine"
                                        >
                                          {item.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
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
                                // Brass on white is 2.16:1 and the brand doc
                                // rules it out outright, so the hover darkens
                                // and underlines instead of going gold.
                                className="font-mono text-[11px] font-medium tracking-[0.16em] uppercase flex items-center gap-2 transition-colors text-pine hover:text-ink hover:underline underline-offset-4"
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

              {/* Always points at /account. The header is a client component
                  with no sight of the session, and rendering "sign in" or the
                  customer's name here would either mismatch on hydration or
                  force the whole header dynamic. The account page itself
                  sends a signed-out visitor to the sign-in form, which is the
                  same destination by a shorter route. */}
              <Link
                href={`/${lang}/account`}
                aria-label={dict.nav.account}
                title={dict.nav.account}
                className={`p-2 transition-colors ${
                  isTransparent ? "text-bone hover:text-brass" : "text-ink hover:text-pine"
                }`}
              >
                <User className="w-5 h-5" aria-hidden="true" />
              </Link>

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
                href={`tel:${PHONE_SALES}`}
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
                href={`/${lang}/account`}
                aria-label={dict.nav.account}
                className={`p-2 transition-colors ${
                  isTransparent ? "text-bone hover:text-brass" : "text-pine hover:text-ink"
                }`}
              >
                <User className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href={toggleLanguage()}
                className={`p-2 transition-colors ${
                  isTransparent ? "text-bone hover:text-brass" : "bg-bone text-pine hover:bg-pine hover:text-bone"
                }`}
                aria-label="Change Language"
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                ref={menuToggleRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 transition-colors ${
                  isTransparent ? "text-bone hover:text-brass" : "bg-bone text-pine hover:bg-pine hover:text-bone"
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
        className={`fixed inset-0 z-30 bg-pine/40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Drawer Container */}
      <div
        id="mobile-nav"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "ar" ? "قائمة التنقل" : "Navigation menu"}
        // `inert`, not `aria-hidden`: aria-hidden left every link inside
        // still focusable, so Tab walked into an off-screen menu.
        inert={!isOpen}
        className={`fixed inset-y-0 start-0 z-40 w-72 max-w-full bg-white border-e-2 border-brass p-6 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div>
          {/* Header Inside Drawer — the real mark, not "EL WAHA" faked in a
              monospace face (§1.2a). */}
          <div className="flex items-center justify-between pb-5 border-b border-rule">
            <Logo variant="mark" x={16} />
            <button
              type="button"
              ref={drawerCloseRef}
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone hover:text-pine transition-colors"
              aria-label={lang === "ar" ? "إغلاق القائمة" : "Close menu"}
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
            href={`tel:${PHONE_SALES}`}
            className="flex items-center justify-center gap-2 w-full bg-pine hover:bg-emerald-700 text-bone py-3 font-semibold text-sm transition-colors"
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span>{dict.nav.callNow}</span>
          </a>
          {/* Western digits everywhere, including the Arabic site (§5.2
              rule 5) — numbers get copied across both languages. */}
          <span dir="ltr" className="font-mono text-[11px] tracking-[0.16em] text-stone block text-center mt-3">
            +20 106 668 5532
          </span>
        </div>
      </div>
    </>
  );
}
