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

  // ✅ Auto open after 7 seconds (once per session)
  useEffect(() => {
    if (!sessionStorage.getItem('leadModalShown')) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('leadModalShown', 'true');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const message = `Hi ANU Education 👋
My name is ${formData.name}.
Preferred course: ${formData.course}.
Target country: ${formData.country}.
${formData.email ? `Email: ${formData.email}` : ''}
Please guide me further.`;

    const waUrl = `https://wa.me/919428186817?text=${encodeURIComponent(
      message
    )}`;

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
      {/* Floating CTA */}
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
                {isSubmitting ? 'Please wait…' : 'Get Free Guidance'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}