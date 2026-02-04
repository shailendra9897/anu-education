'use client';

import { useState } from 'react';

const COURSE_FEES: Record<string, number> = {
  IELTS: 9999,
  PTE: 8000,
  'German A1': 12000,
  'French A1': 10000,
};

export default function PayCoursePage() {
  const [course, setCourse] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const baseAmount = course ? COURSE_FEES[course] : 0;
  const finalAmount = baseAmount - discount;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'ANU10') {
      setDiscount(Math.round(baseAmount * 0.1));
    } else {
      alert('Invalid or expired coupon');
      setDiscount(0);
    }
  };

  const upiLink = `upi://pay?pa=9428186817@axl&pn=ANU%20Education&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(
    course + ' Course Fee'
  )}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center">
        Course Payment – ANU Education
      </h1>

      <p className="text-center text-gray-600">
        Payment accepted only after demo class confirmation
      </p>

      {/* Course Select */}
      <select
        value={course}
        onChange={(e) => {
          setCourse(e.target.value);
          setDiscount(0);
        }}
        className="w-full border rounded-lg px-4 py-2"
      >
        <option value="">Select Course</option>
        <option value="IELTS">IELTS</option>
        <option value="PTE">PTE</option>
        <option value="German A1">German A1</option>
        <option value="French A1">French A1</option>
      </select>

      {/* Price */}
      {course && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p>
            Course Fee: <strong>₹{baseAmount}</strong>
          </p>

          {discount > 0 && (
            <p className="text-green-600">
              Discount Applied: −₹{discount}
            </p>
          )}

          <p className="text-lg font-semibold">
            Payable Amount: ₹{finalAmount}
          </p>
        </div>
      )}

      {/* Coupon */}
      {course && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Coupon Code (After Demo)"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
          <button
            onClick={applyCoupon}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Apply Coupon
          </button>

          <p className="text-xs text-gray-500 text-center">
            Coupon valid only after demo class • One-time use
          </p>
        </div>
      )}

      {/* Pay Button */}
      {finalAmount > 0 && (
        <>
          {/* Mobile UPI */}
          <a
            href={upiLink}
            className="block text-center bg-green-600 text-white py-3 rounded-lg text-lg hover:bg-green-700 md:hidden"
          >
            Pay ₹{finalAmount} via UPI App
          </a>

          {/* Desktop QR */}
          <div className="hidden md:block text-center space-y-3">
            <p className="font-semibold">Scan to Pay ₹{finalAmount}</p>

            <img
              src="/upi/anu-upi-qr.png"
              alt="ANU Education UPI QR Code"
              className="mx-auto w-48 h-48"
            />

            <p className="text-sm text-gray-600">
              UPI ID: <strong>9428186817@axl</strong>
            </p>

            <a
              href={`https://wa.me/919428186817?text=${encodeURIComponent(
                `Hi ANU Education, I have paid ₹${finalAmount} for ${course}. Please confirm.`
              )}`}
              target="_blank"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Confirm Payment on WhatsApp
            </a>
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 text-center">
        UPI ID: 9428186817@axl
      </p>
    </div>
  );
}