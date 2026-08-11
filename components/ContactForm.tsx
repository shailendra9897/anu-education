'use client';

export default function ContactForm() {
  return (
    <form
      className="space-y-4 max-w-lg mx-auto"
      onSubmit={(e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const course = (form.elements.namedItem('course') as HTMLSelectElement).value;

        const message = `Hi ANU Education 👋
Name: ${name}
Mobile: ${phone}
Email: ${email || 'Not provided'}
Interested in: ${course}

Please contact me.`;

        window.open(
          `https://wa.me/919428186817?text=${encodeURIComponent(message)}`,
          '_blank'
        );
      }}
    >
      <input
        type="text"
        name="name"
        placeholder="Your Full Name"
        required
        className="w-full px-4 py-2 border rounded-lg"
      />

      <input
        type="tel"
        name="phone"
        placeholder="Mobile Number"
        required
        className="w-full px-4 py-2 border rounded-lg"
      />

      <input
        type="email"
        name="email"
        placeholder="Email Address (Optional)"
        className="w-full px-4 py-2 border rounded-lg"
      />

      <select
        name="course"
        required
        className="w-full px-4 py-2 border rounded-lg"
      >
        <option value="">Select Course / Service</option>
        <option value="IELTS">IELTS</option>
        <option value="PTE">PTE</option>
        <option value="German Language">German Language</option>
        <option value="French Language">French Language</option>
        <option value="Study Abroad Counselling">Study Abroad Counselling</option>
      </select>

      <div className="flex items-start gap-2 text-sm text-gray-600">
        <input type="checkbox" required className="mt-1" />
        <p>
          I consent to receiving <strong>RCS, WhatsApp, Email or SMS</strong> from
          <strong> ANU Education</strong> and I agree to the{" "}
          <a href="/terms-and-conditions" className="text-blue-600 underline">
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="text-blue-600 underline">
            Privacy Policy
          </a>.
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
      >
        Submit Enquiry
      </button>
    </form>
  );
}