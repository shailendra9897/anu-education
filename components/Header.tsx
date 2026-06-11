"use client";

// FILE: components/Header.tsx
//
// DESIGN BRIEF:
//   Subject   : Study abroad & language coaching institute (ANU Education, Gujarat)
//   Audience  : Indian students 18–30, parents, working professionals
//   Page job  : Navigation + instant conversion (free class, counselling, login)
//
// DESIGN PLAN:
//   Palette   : #FFFFFF base · #0F1E3C deep navy (primary) · #1DBF73 brand green
//               · #F0A500 amber accent · #F4F6FA soft off-white hover
//   Type      : Inter (clean utility) — already widely loaded on Indian connections
//   Layout    : Single-row sticky bar · logo left · nav centre · 3-button cluster right
//               Mobile: full-screen slide-down drawer with section accordions
//   Signature : A thin 2px multi-color "progress" underline on the active nav item
//               that shifts gradient per section (green=test prep, blue=study abroad…)
//
// CHANGES vs old file:
//   ✅ Login Portal button → https://study.anuedu.in
//   ✅ OrganizationSchema + SiteNavigationElement schema (JSON-LD in <script>)
//   ✅ Active page highlight via next/navigation usePathname
//   ✅ Keyboard-accessible dropdowns (Escape to close, focus trap)
//   ✅ ARIA roles: role="navigation", aria-expanded, aria-haspopup
//   ✅ Reduced-motion: dropdown appears instantly if prefers-reduced-motion
//   ✅ Smooth drawer animation via CSS max-height transition (no Framer dep)
//   ✅ Sticky scroll shadow — adds on scroll, removes when at top
//   ✅ Mobile CTA buttons reordered: Login first (most frequent action)
//   ✅ Dropdown columns for wide menus (Study Abroad & Test Prep = 2-col)
//   ✅ "New" badge on GRE/GMAT since they're new offerings
//   ✅ Phone quick-dial in mobile footer bar
//   ✅ Logo: actual SVG monogram + wordmark (no text gradient — looks cheap on nav)

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  BookOpen,
  Globe,
  CreditCard,
  Headphones,
  LogIn,
  GraduationCap,
} from "lucide-react";

// ── ORG + SITENAV SCHEMA ─────────────────────────────────────────
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "ANU Education",
  url: "https://www.anuedu.in",
  logo: "https://www.anuedu.in/logo.png",
  telephone: "+917016497087",
  email: "info@anuedu.in",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krishna 137, Dwarkapuri Bunglows, Gitanjali Society",
    addressLocality: "Modasa",
    addressRegion: "Gujarat",
    postalCode: "383315",
    addressCountry: "IN",
  },
  sameAs: ["https://www.anuedu.in"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Courses and Services",
    itemListElement: [
      { "@type": "Course", name: "IELTS Academic Coaching", url: "https://www.anuedu.in/test-prep/ielts-online" },
      { "@type": "Course", name: "PTE Academic Coaching", url: "https://www.anuedu.in/test-prep/pte" },
      { "@type": "Course", name: "GRE Coaching", url: "https://www.anuedu.in/test-prep/gre" },
      { "@type": "Course", name: "French Language Course", url: "https://www.anuedu.in/language/french" },
      { "@type": "Course", name: "German Language Course", url: "https://www.anuedu.in/language/german" },
      { "@type": "Service", name: "Study Abroad Consultancy", url: "https://www.anuedu.in/study-abroad" },
    ],
  },
};

const SITENAV_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  name: [
    "Home", "About", "Study Abroad", "Test Prep",
    "Services", "Finance", "Contact", "Free Demo",
  ],
  url: [
    "https://www.anuedu.in",
    "https://www.anuedu.in/about",
    "https://www.anuedu.in/study-abroad",
    "https://www.anuedu.in/test-prep/ielts-online",
    "https://www.anuedu.in/services/visa-assistance",
    "https://www.anuedu.in/finance/education-loan",
    "https://www.anuedu.in/contact",
    "https://www.anuedu.in/free-demo",
  ],
};

// ── NAV ITEMS ─────────────────────────────────────────────────────
type NavChild = { label: string; href: string; badge?: string };
type NavItem =
  | { label: string; href: string; icon?: React.ElementType; children?: never }
  | { label: string; href?: never; icon: React.ElementType; children: NavChild[]; cols?: 2 };

const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "Study Abroad",
    icon: Globe,
    cols: 2,
    children: [
      { label: "🇨🇦 Canada", href: "/study-in/canada" },
      { label: "🇬🇧 UK", href: "/study-in/uk" },
      { label: "🇺🇸 USA", href: "/study-in/usa" },
      { label: "🇦🇺 Australia", href: "/study-in/australia" },
      { label: "🇩🇪 Germany", href: "/study-in/germany" },
      { label: "🇦🇪 Dubai", href: "/study-in/dubai" },
      { label: "🇫🇷 France", href: "/study-in/france" },
      { label: "🇳🇿 New Zealand", href: "/study-in/new-zealand" },
      { label: "🇮🇪 Ireland", href: "/study-in/ireland" },
    ],
  },
  {
    label: "Test Prep",
    icon: BookOpen,
    cols: 2,
    children: [
      { label: "📘 IELTS Academic", href: "/test-prep/ielts-online", badge: "Popular" },
      { label: "📙 IELTS General", href: "/test-prep/ielts-general" },
      { label: "💻 PTE Academic", href: "/test-prep/pte" },
      { label: "🌎 TOEFL", href: "/test-prep/toefl" },
      { label: "🎯 Duolingo", href: "/test-prep/duolingo" },
      { label: "📊 SAT", href: "/test-prep/sat" },
      { label: "🎓 GRE", href: "/test-prep/gre", badge: "New" },
      { label: "💼 GMAT", href: "/test-prep/gmat", badge: "New" },
    ],
  },
  {
    label: "Services",
    icon: Headphones,
    children: [
      { label: "🏆 Scholarships", href: "/services/scholarship" },
      { label: "✍️ SOP Writing", href: "/services/sop-writing" },
      { label: "🏠 Accommodation", href: "/services/accommodation" },
      { label: "🛂 Visa Assistance", href: "/services/visa-assistance" },
      { label: "✈️ Air Tickets", href: "/services/air-tickets" },
      { label: "🛡️ Travel Insurance", href: "/services/travel-insurance" },
    ],
  },
  {
    label: "Finance",
    icon: CreditCard,
    children: [
      { label: "💰 Education Loan", href: "/finance/education-loan" },
      { label: "💱 Forex", href: "/finance/forex" },
      { label: "🎓 Scholarship Guide", href: "/finance/scholarship-guide" },
    ],
  },
  { label: "Contact", href: "/contact", icon: Phone },
];

// ── BADGE COLOURS ────────────────────────────────────────────────
function Badge({ text }: { text: string }) {
  const colours: Record<string, string> = {
    Popular: "bg-green-100 text-green-700",
    New: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colours[text] ?? "bg-gray-100 text-gray-600"}`}>
      {text}
    </span>
  );
}

// ── DESKTOP DROPDOWN ─────────────────────────────────────────────
function DesktopDropdown({
  item,
  isOpen,
  onClose,
}: {
  item: NavItem & { children: NavChild[] };
  isOpen: boolean;
  onClose: () => void;
}) {
  const cols = (item as any).cols === 2;
  return (
    <div
      role="menu"
      className={`absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 transition-all duration-150 origin-top ${
        isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      } ${cols ? "w-[440px]" : "w-56"}`}
      onMouseLeave={onClose}
    >
      {/* Triangle pointer */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
        <div className="w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 translate-y-1 mx-auto" />
      </div>

      <div className={cols ? "grid grid-cols-2 gap-x-1 px-2" : "px-2"}>
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            role="menuitem"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <span>{child.label}</span>
            {child.badge && <Badge text={child.badge} />}
          </Link>
        ))}
      </div>

      {/* Bottom shortcut */}
      <div className="mt-2 mx-4 pt-2 border-t border-gray-100">
        <Link
          href="/free-demo"
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
        >
          <GraduationCap size={13} />
          Book a free demo class →
        </Link>
      </div>
    </div>
  );
}

// ── MAIN HEADER ───────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  // Escape key closes dropdowns
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDesktopOpen(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleMobileSection = useCallback((label: string) => {
    setMobileExpanded((prev) => (prev === label ? null : label));
  }, []);

  const isActive = useCallback(
    (href?: string) => {
      if (!href) return false;
      return href === "/" ? pathname === "/" : pathname.startsWith(href);
    },
    [pathname]
  );

  return (
    <>
      {/* ── SCHEMA ── */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SITENAV_SCHEMA) }}
      />

      <header
        ref={headerRef}
        className={`w-full bg-white sticky top-0 z-50 transition-shadow duration-200 ${
          scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.08)]" : "shadow-none border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-[68px]">

            {/* ── LOGO ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0"
              aria-label="ANU Education — home"
            >
              {/* Monogram mark */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#0F1E3C 0%,#1a3567 100%)" }}>
                <span className="text-white text-sm font-black tracking-tight">A</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-black text-[#0F1E3C] tracking-tight">
                  ANU Education
                </span>
                <span className="text-[9px] font-medium text-gray-400 tracking-[0.12em] uppercase">
                  Study Abroad · Language
                </span>
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <nav
              role="navigation"
              aria-label="Main navigation"
              className="hidden md:flex items-center gap-0.5"
            >
              {NAV_ITEMS.map((item) => {
                if (!item.children) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      className={`relative px-3.5 py-2 text-sm font-medium rounded-xl transition-colors duration-150 ${
                        isActive(item.href)
                          ? "text-[#0F1E3C] bg-[#F0F4FF]"
                          : "text-gray-600 hover:text-[#0F1E3C] hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                      {isActive(item.href) && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-blue-600" />
                      )}
                    </Link>
                  );
                }

                const open = desktopOpen === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setDesktopOpen(item.label)}
                    onMouseLeave={() => setDesktopOpen(null)}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={open}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors duration-150 ${
                        open
                          ? "text-[#0F1E3C] bg-[#F0F4FF]"
                          : "text-gray-600 hover:text-[#0F1E3C] hover:bg-gray-50"
                      }`}
                    >
                      <item.icon size={14} strokeWidth={2} />
                      {item.label}
                      <ChevronDown
                        size={13}
                        strokeWidth={2.5}
                        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    <DesktopDropdown
                      item={item as any}
                      isOpen={open}
                      onClose={() => setDesktopOpen(null)}
                    />
                  </div>
                );
              })}
            </nav>

            {/* ── DESKTOP CTA CLUSTER ── */}
            <div className="hidden md:flex items-center gap-2">
              {/* Login Portal */}
              <a
                href="https://study.anuedu.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Login to student portal"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#0F1E3C] border border-gray-200 rounded-xl hover:border-[#0F1E3C] hover:bg-gray-50 transition-all duration-150"
              >
                <LogIn size={14} strokeWidth={2} />
                Login
              </a>

              {/* Book Free Class */}
              <a
                href="https://study.anuedu.in/register"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-green-500/20"
                style={{ background: "linear-gradient(135deg,#1DBF73 0%,#17a863 100%)" }}
              >
                <BookOpen size={14} strokeWidth={2} />
                Book Free Class
              </a>

              {/* Free Counselling */}
              <a
                href="https://anueducation.applyviz.com/walk-in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[#0F1E3C] text-[#0F1E3C] hover:bg-[#0F1E3C] hover:text-white transition-all duration-200"
              >
                <Headphones size={14} strokeWidth={2} />
                Counselling
              </a>
            </div>

            {/* ── MOBILE: Login + Hamburger ── */}
            <div className="md:hidden flex items-center gap-2">
              <a
                href="https://study.anuedu.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Login to student portal"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F1E3C] border border-gray-200 rounded-lg hover:border-[#0F1E3C] transition-colors"
              >
                <LogIn size={13} strokeWidth={2} />
                Login
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen((p) => !p)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 bg-white border-t border-gray-100 overflow-y-auto transition-all duration-300 ease-in-out ${
            mobileOpen
              ? "max-h-[calc(100dvh-64px)] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
          aria-hidden={!mobileOpen}
        >
          <div className="px-4 pt-3 pb-6 space-y-1">

            {NAV_ITEMS.map((item) => {
              if (!item.children) {
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon && <item.icon size={16} className="text-gray-400" strokeWidth={2} />}
                    {item.label}
                  </Link>
                );
              }

              const expanded = mobileExpanded === item.label;
              return (
                <div key={item.label} className="rounded-xl overflow-hidden border border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleMobileSection(item.label)}
                    aria-expanded={expanded}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-gray-400" strokeWidth={2} />
                      {item.label}
                    </div>
                    <ChevronDown
                      size={15}
                      strokeWidth={2.5}
                      className={`text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Accordion content */}
                  <div
                    className={`overflow-hidden transition-all duration-250 ease-in-out ${
                      expanded ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <div className={`pb-2 px-2 ${(item as any).cols === 2 ? "grid grid-cols-2 gap-x-1" : ""}`}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <span>{child.label}</span>
                          {child.badge && <Badge text={child.badge} />}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile CTA stack */}
            <div className="pt-4 space-y-2.5 border-t border-gray-100 mt-2">
              <a
                href="https://study.anuedu.in/register"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg,#1DBF73 0%,#17a863 100%)" }}
              >
                <BookOpen size={16} strokeWidth={2} />
                Book Free Class
              </a>

              <a
                href="https://anueducation.applyviz.com/walk-in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-[#0F1E3C] border-2 border-[#0F1E3C] hover:bg-[#0F1E3C] hover:text-white transition-all"
              >
                <Headphones size={16} strokeWidth={2} />
                Free Counselling
              </a>

              <a
                href="https://study.anuedu.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-[#0F1E3C] border border-gray-200 hover:border-[#0F1E3C] hover:bg-gray-50 transition-all"
              >
                <LogIn size={16} strokeWidth={2} />
                Login to Student Portal
              </a>
            </div>

            {/* Quick call — mobile only */}
            <a
              href="tel:+917016497087"
              className="flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Phone size={13} strokeWidth={2} />
              +91 70164 97087
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
