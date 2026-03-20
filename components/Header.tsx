'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Phone, BookOpen, Globe, CreditCard, Headphones } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  // Close mobile dropdown when clicking outside (optional)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDesktopDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "About", href: "/about" },
    {
      label: "Study Abroad",
      icon: Globe,
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
      children: [
        { label: "📘 IELTS Academic", href: "/test-prep/ielts-academic", badge: "Most Popular" },
        { label: "📙 IELTS General", href: "/test-prep/ielts-general" },
        { label: "🌎 TOEFL", href: "/test-prep/toefl" },
        { label: "💻 PTE", href: "/test-prep/pte" },
        { label: "🎯 Duolingo", href: "/test-prep/duolingo" },
        { label: "📊 SAT", href: "/test-prep/sat" },
        { label: "🎓 GRE", href: "/test-prep/gre" },
        { label: "💼 GMAT", href: "/test-prep/gmat" },
      ],
    },
    {
      label: "Services",
      icon: Headphones,
      children: [
        { label: "🏆 Scholarships", href: "/services/scholarship" },
        { label: "✍️ SOP Writing", href: "/services/sop-writing" },
        { label: "🏠 Accommodation", href: "/services/accommodation" },
        { label: "📱 SIM Card", href: "/services/sim-card" },
        { label: "🛂 Visa Assistance", href: "/services/visa-assistance" },
        { label: "✈️ Air Tickets", href: "/services/air-tickets" },
        { label: "🛡️ Travel Insurance", href: "/services/travel-insurance" },
        { label: "📊 Know Your Score", href: "/services/know-your-score" },
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

  return (
    <header className="w-full px-4 py-3 bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="flex items-center justify-between max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all">
          ANU Education
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-1 text-gray-700 font-medium">
          {navItems.map((item) =>
            !item.children ? (
              <Link
                key={item.label}
                href={item.href!}
                className="px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDesktopDropdown(item.label)}
                onMouseLeave={() => setActiveDesktopDropdown(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 ${
                    activeDesktopDropdown === item.label ? "bg-gray-50 text-blue-600" : ""
                  }`}
                >
                  {item.icon && <item.icon size={16} />}
                  <span>{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDesktopDropdown === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {activeDesktopDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-up">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://study.anuedu.in/register"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <BookOpen size={16} />
            <span>Book Free Class</span>
          </a>

          <a
            href="https://anueducation.applyviz.com/walk-in"
            target="_blank"
            rel="noopener noreferrer"
            className="group border-2 border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center gap-2"
          >
            <Headphones size={16} />
            <span>Free Counselling</span>
          </a>
        </div>

        {/* Hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-[72px] bg-white shadow-xl rounded-b-2xl transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible overflow-hidden"
        }`}
      >
        <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-72px)] overflow-y-auto">
          {navItems.map((item) =>
            !item.children ? (
              <Link
                key={item.label}
                href={item.href!}
                onClick={toggleMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {item.icon && <item.icon size={18} className="text-gray-500" />}
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              <div key={item.label} className="border-b border-gray-100 pb-2">
                <button
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => toggleDropdown(item.label)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon size={18} className="text-gray-500" />}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      openDropdown === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === item.label && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={toggleMenu}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* Mobile CTA Buttons */}
          <div className="pt-6 pb-4 space-y-3">
            <a
              href="https://study.anuedu.in/register"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <BookOpen size={18} />
              Book Free Class
            </a>

            <a
              href="https://anueducation.applyviz.com/walk-in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 py-3.5 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all"
            >
              <Headphones size={18} />
              Free Counselling
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-up {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}