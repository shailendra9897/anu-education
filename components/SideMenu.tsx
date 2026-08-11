"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
};

export default function SidebarMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    {
      label: "Study Abroad",
      children: [
        { label: "Canada", href: "/study-in/canada", icon: "canada.png" },
        { label: "UK", href: "/study-in/uk", icon: "uk.png" },
        { label: "USA", href: "/study-in/usa", icon: "usa.png" },
        { label: "Australia", href: "/study-in/australia", icon: "australia.png" },
        { label: "Germany", href: "/study-in/germany", icon: "germany.png" },
        { label: "Dubai", href: "/study-in/dubai", icon: "uae.png" },
        { label: "France", href: "/study-in/france", icon: "france.png" },
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
    { label: "Blog", href: "/blog" },
    { label: "Reviews", href: "/reviews" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ];

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2">
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-lg z-50 p-4 space-y-4">
          {navItems.map((item, i) => (
            <div key={i}>
              {item.href && (
                <Link
                  href={item.href}
                  className={`block font-medium text-gray-800 py-1 ${
                    pathname === item.href ? "text-blue-600" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )}

              {item.children?.map((child, j) => (
                <Link
                  key={j}
                  href={child.href ?? "#"}
                  className={`flex items-center gap-2 pl-4 text-gray-600 py-1 ${
                    pathname === child.href ? "text-blue-600 font-semibold" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {child.icon && (
                    <Image
                      src={`/icons/${child.icon}`}
                      alt={child.label}
                      width={20}
                      height={14}
                    />
                  )}
                  {child.label}
                </Link>
              ))}
            </div>
          ))}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">Follow Us:</p>
            <div className="flex gap-4 mt-2 text-blue-600">
              <a
                href="https://instagram.com/anuoverseas"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}