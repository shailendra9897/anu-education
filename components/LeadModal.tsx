'use client';

import { useEffect, useState } from 'react';

export default function LeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    course: '',
    country: '',
    email: '',
  });

  // ✅ Auto open after 5 seconds (once per session)
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ SUBMIT HANDLER (UPDATED WITH TRACKING)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    /* ===============================
       🔥 GA4 / GTM TRACKING (FORM)
    =============================== */
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'lead_form_submit',
        course: formData.course,
        country: formData.country,
      });
    }

    // ✅ Google Form Submit (no redirect)
    const formUrl =
      'https://docs.google.com/forms/d/e/1FAIpQLSfcTM7TBVDB2xjnCRZvcm4Sw_S2VkJnyLYoWFdCeVNgjhKlRA/formResponse';

    const formDataEncoded = new URLSearchParams({
      'entry.665770361': formData.name,
      'entry.1214678329': '9999999999',
      'entry.621978958': formData.email || '',
      'entry.13793569': formData.course,
      'entry.266166212': formData.country,
      'entry.349170966': 'Website',
    });

    fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formDataEncoded.toString(),
    });

    /* ===============================
       🔥 GA4 / GTM TRACKING (WHATSAPP)
    =============================== */
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'whatsapp_click',
        source: 'lead_modal',
      });
    }

    // ✅ WhatsApp Redirect
    const message = `Hi ANU Education 👋
My name is ${formData.name}.
Preferred course: ${formData.course}.
Target country: ${formData.country}.
${formData.email ? `Email: ${formData.email}` : ''}
Please guide me further.`;

    const waUrl = `https://wa.me/919428186817?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    setFormData({
      name: '',
      course: '',
      country: '',
      email: '',
    });

    setIsOpen(false);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Floating CTA Button */}
      <button
        onClick={toggleModal}
        className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition"
        aria-label="Get Free Guidance"
      >
        Get Free Guidance
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            
            {/* Close */}
            <button
              onClick={toggleModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl"
              aria-label="Close form"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-2 text-center">
              Get Free Study Abroad Guidance
            </h2>

            <p className="text-sm text-gray-600 text-center mb-2">
              🎓 Skill India Certified Career Counsellor
            </p>

            <p className="text-sm text-gray-600 text-center mb-4">
              IELTS • German • France • Canada • Germany
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <select
                name="course"
                required
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Preferred Course / Test</option>
                <option value="IELTS">IELTS</option>
                <option value="PTE">PTE</option>
                <option value="German Language">German Language</option>
                <option value="French Language">French Language</option>
                <option value="Spoken English">Spoken English</option>
              </select>

              <select
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Target Country</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Dubai">Dubai</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="email"
                name="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
              >
                {isSubmitting ? 'Please wait…' : 'Get Free Guidance on WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}