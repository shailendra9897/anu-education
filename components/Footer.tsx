import Link from "next/link";
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              ANU Education
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              India's trusted study abroad & test preparation consultant. 
              Helping students achieve their global education dreams since 2018.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-3 border-l-4 border-blue-500 pl-2">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-white hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline">Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-gray-300 hover:text-white hover:underline">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Coaching Services */}
          <div>
            <h4 className="font-semibold text-lg mb-3 border-l-4 border-green-500 pl-2">Coaching</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/test-prep/ielts-online" className="text-gray-300 hover:text-white hover:underline">IELTS Online Coaching</Link></li>
              <li><Link href="/test-prep/pte" className="text-gray-300 hover:text-white hover:underline">PTE Coaching</Link></li>
              <li><Link href="/test-prep/ielts-coaching-modasa" className="text-gray-300 hover:text-white hover:underline">IELTS Coaching in Modasa</Link></li>
              <li><Link href="/test-prep/german" className="text-gray-300 hover:text-white hover:underline">German Language Classes</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-3 border-l-4 border-yellow-500 pl-2">Get in Touch</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span>📞</span> 
                <a href="tel:+917016497087" className="hover:text-white">+91 7016497087</a>
              </li>
              <li className="flex items-center gap-2">
                <span>💬</span> 
                <a href="https://wa.me/919428186817" target="_blank" className="hover:text-green-400">WhatsApp</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span> 
                <a href="mailto:info@anuedu.in" className="hover:text-white">info@anuedu.in</a>
              </li>
              <li className="flex items-start gap-2">
                <span>📍</span> 
                <span>Modasa, Gujarat – India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400">
            ©️ {new Date().getFullYear()} ANU Education. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            🌐 Study Abroad | IELTS | PTE | German | French | Visa Guidance
          </p>
        </div>
      </div>
    </footer>
  );
}