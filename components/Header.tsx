'use client';

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const navItems = [
    { label: "About", href: "/about" },
    {
      label: "Study Abroad",
      children: [
        { label: "Canada", href: "/study-in/canada" },
        { label: "UK", href: "/study-in/uk" },
        { label: "USA", href: "/study-in/usa" },
        { label: "Australia", href: "/study-in/australia" },
        { label: "Germany", href: "/study-in/germany" },
        { label: "Dubai", href: "/study-in/dubai" },
        { label: "France", href: "/study-in/france" },
      ],
    },
    {
      label: "Test Prep",
      children: [
        { label: "IELTS Academic", href: "/test-prep/ielts-academic" },
        { label: "IELTS General", href: "/test-prep/ielts-general" },
        { label: "TOEFL", href: "/test-prep/toefl" },
        { label: "PTE", href: "/test-prep/pte" },
        { label: "Duolingo", href: "/test-prep/duolingo" },
        { label: "SAT", href: "/test-prep/sat" },
        { label: "GRE", href: "/test-prep/gre" },
        { label: "GMAT", href: "/test-prep/gmat" },
      ],
    },
    {
      label: "Services",
      children: [
        { label: "Scholarships", href: "/services/scholarship" },
        { label: "SOP Writing", href: "/services/sop-writing" },
        { label: "Accommodation", href: "/services/accommodation" },
        { label: "SIM Card", href: "/services/sim-card" },
        { label: "Visa Assistance", href: "/services/visa-assistance" },
        { label: "Air Tickets", href: "/services/air-tickets" },
        { label: "Travel Insurance", href: "/services/travel-insurance" },
        { label: "Know Your Score", href: "/services/know-your-score" },
      ],
    },
    {
      label: "Finance",
      children: [
        { label: "Education Loan", href: "/finance/education-loan" },
        { label: "Forex", href: "/finance/forex" },
      ],
    },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="w-full px-4 py-3 bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xl font-bold text-blue-600">
          <Link href="/">ANU Education</Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          {navItems.map((item) =>
            !item.children ? (
              <Link key={item.label} href={item.href!}>
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="relative group">
                <span className="cursor-pointer">{item.label}</span>
              </div>
            )
          )}
        </nav>

        {/* Hamburger */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-2 bg-white shadow-md rounded-lg px-4 py-3 text-gray-800 font-medium space-y-3">
          {navItems.map((item) =>
            !item.children ? (
              <Link
                key={item.label}
                href={item.href!}
                onClick={toggleMenu}
                className="block"
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label}>
                <button
                  className="flex justify-between items-center w-full"
                  onClick={() => toggleDropdown(item.label)}
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      openDropdown === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === item.label && (
                  <ul className="pl-4 mt-2 space-y-2 text-sm text-gray-600">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={toggleMenu}
                          className="block"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          )}
        </div>
      )}
    </header>
  );
}