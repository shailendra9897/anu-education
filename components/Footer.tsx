import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center space-y-4">
        
        {/* Brand */}
        <p className="text-lg font-semibold text-blue-700">
          ANU Education
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <Link href="/about" className="hover:text-blue-600">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-blue-600">
            Contact
          </Link>
          <Link href="/privacy-policy" className="hover:text-blue-600">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-blue-600">
            Terms & Conditions
          </Link>
        </div>

        {/* Contact Info */}
        <div className="text-sm text-gray-600">
          <p>
            📞 <a href="tel:+917016497087" className="hover:text-blue-600">+91 7016497087</a>
            {" | "}
            💬 <a
              href="https://wa.me/919428186817"
              target="_blank"
              className="hover:text-green-600"
            >
              WhatsApp
            </a>
          </p>
          <p>
            ✉️ <a href="mailto:info@anuedu.in" className="hover:text-blue-600">
              info@anuedu.in
            </a>
          </p>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-500">
          ©️ {new Date().getFullYear()} ANU Education. All rights reserved.
        </p>
      </div>
    </footer>
  );
}