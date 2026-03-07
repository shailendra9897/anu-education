'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeadModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    country: '',
    email: '',
  });

  // Disable on free demo page
  if (pathname === '/free-demo') return null;

  // Auto open after 5 sec
  useEffect(() => {
    if (!sessionStorage.getItem('leadModalShown')) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('leadModalShown', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // GTM event
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'lead_form_submit',
        course: formData.course,
        country: formData.country,
      });
    }

    // Google Form submission
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfcTM7TBVDB2xjnCRZvcm4Sw_S2VkJnyLYoWFdCeVNgjhKlRA/formResponse';
    const formDataEncoded = new URLSearchParams({
      'entry.665770361': formData.name,
      'entry.1214678329': '9999999999',
      'entry.621978958': formData.email || '',
      'entry.13793569': formData.course,
      'entry.266166212': formData.country,
      'entry.349170966': 'Website',
    });

    try {
      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDataEncoded.toString(),
      });
    } catch (error) {
      console.log('Google Form submission failed:', error);
    }

    // WhatsApp message
    const message = `Hi ANU Education 👋

My name is ${formData.name}.
Preferred course: ${formData.course}.
Target country: ${formData.country}.
${formData.email ? `Email: ${formData.email}` : ''}

Please guide me further.`;

    const waUrl = `https://wa.me/919428186817?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    // Reset form
    setFormData({ name: '', course: '', country: '', email: '' });
    setIsOpen(false);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Floating CTA Button */}
      <motion.button
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleModal}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 text-white px-6 py-4 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 border-2 border-white/20 backdrop-blur-sm flex items-center gap-3 font-bold text-lg transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Free Guidance
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8"
            onClick={toggleModal}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleModal}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors"
              >
                ×
              </motion.button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-3">
                  Free Study Abroad Guidance
                </h2>
                <p className="text-lg text-emerald-700 font-semibold">
                  Get personalized roadmap in 2 mins
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    👤 Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-lg placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl hover:border-emerald-300 peer"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-green-500/0 -inset-px opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                </div>

                {/* Course */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    🎯 Preferred Course *
                  </label>
                  <select
                    name="course"
                    required
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-lg appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl hover:border-emerald-300 peer cursor-pointer"
                  >
                    <option value="">Choose your course...</option>
                    <option value="IELTS">IELTS (Academic/General)</option>
                    <option value="PTE">PTE (Fast Results)</option>
                    <option value="German Language">German Language (A1-B2)</option>
                    <option value="French Language">French Language (A1-B2)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-green-500/0 -inset-px opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                </div>

                {/* Country */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    🌍 Target Country *
                  </label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-lg appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl hover:border-emerald-300 peer cursor-pointer"
                  >
                    <option value="">Select destination...</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="UK">🇬🇧 UK</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-green-500/0 -inset-px opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                </div>

                {/* Email */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    ✉️ Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-lg placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl hover:border-emerald-300 peer"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-green-500/0 -inset-px opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.course || !formData.country}
                  className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-emerald-500/50 border-2 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wide"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connecting to WhatsApp...
                    </>
                  ) : (
                    <>
                      🚀 Get Free Guidance Instantly
                    </>
                  )}
                </motion.button>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1000+ Students Helped
                </div>
                <div>•</div>
                <div className="flex items-center gap-1">
                  🔒 100% Secure
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}