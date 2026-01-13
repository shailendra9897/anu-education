'use client';

import { useEffect, useState } from 'react';

export default function LeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', course: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Auto open after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000); // 3,000 ms = 3 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const waMessage = `Hi ANU Team! My name is ${formData.name}. I'm interested in ${formData.course}. Please assist me.`;
      const waUrl = `https://wa.me/919428186817?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank');

      setFormData({ name: '', phone: '', course: '' });
      setIsOpen(false);
    } catch (err) {
      console.error('Form submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleModal}
        className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition"
      >
        Get Started
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
          {/* Modal Box */}
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative shadow-xl animate-fade-in-up">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">Get Started with ANU</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                required
                value={formData.phone}
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
                <option value="">Select Course</option>
                <option value="IELTS Academic">IELTS Academic</option>
                <option value="FRENCH Basic A1-A2">FRENCH Basic A1-A2</option>
                <option value="Spoken English Free Demo">Spoken English Free Demo</option>
                <option value="PTE">PTE</option>
                <option value="GRE">GRE</option>
                <option value="GMAT">GMAT</option>
              </select>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
              >
                {isSubmitting ? 'Submitting...' : 'Submit & WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}