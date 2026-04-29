"use client";

import { useState } from "react";

export default function SCEGenerator() {
  const [form, setForm] = useState({
    school: "",
    village: "",
    taluka: "",
    district: "",
    teacher: "",
    date: "",
    className: "",
    totalStudents: "",
  });

  const [marks, setMarks] = useState({
    boys: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    girls: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  });

  const [casteMarks, setCasteMarks] = useState({
    SC: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    ST: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    OBC: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    OTHER: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  });

  // FORM
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // MARKS
  const handleMarksChange = (type: string, grade: string, value: string) => {
    setMarks({
      ...marks,
      [type]: {
        ...marks[type as keyof typeof marks],
        [grade]: Number(value),
      },
    });
  };

  // CASTE MARKS
  const handleCasteMarksChange = (type: string, grade: string, value: string) => {
    setCasteMarks({
      ...casteMarks,
      [type]: {
        ...casteMarks[type as keyof typeof casteMarks],
        [grade]: Number(value),
      },
    });
  };

  // TOTAL MARKS
  const total = {
    A: marks.boys.A + marks.girls.A,
    B: marks.boys.B + marks.girls.B,
    C: marks.boys.C + marks.girls.C,
    D: marks.boys.D + marks.girls.D,
    E: marks.boys.E + marks.girls.E,
  };

  // CASTE TOTAL
  const casteTotals = Object.fromEntries(
    Object.entries(casteMarks).map(([key, value]) => [
      key,
      Object.values(value).reduce((a, b) => a + b, 0),
    ])
  );

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold text-center">
        SCE Report Generator 📄
      </h1>

      {/* FORM - visible only on screen */}
      <div className="grid grid-cols-2 gap-4">
        <input name="school" placeholder="School Name" onChange={handleChange} className="border p-2 rounded" />
        <input name="village" placeholder="Village" onChange={handleChange} className="border p-2 rounded" />
        <input name="taluka" placeholder="Taluka" onChange={handleChange} className="border p-2 rounded" />
        <input name="district" placeholder="District" onChange={handleChange} className="border p-2 rounded" />
        <input name="teacher" placeholder="Teacher Name" onChange={handleChange} className="border p-2 rounded" />
        <input type="date" name="date" onChange={handleChange} className="border p-2 rounded" />
        <input name="className" placeholder="Class (Std)" onChange={handleChange} className="border p-2 rounded" />
        <input name="totalStudents" placeholder="Total Students in Class" onChange={handleChange} className="border p-2 rounded" />
      </div>

      {/* MARKS INPUT */}
      <div>
        <h2 className="font-bold">Student Performance</h2>

        <table className="w-full border mt-2 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Type</th>
              <th className="border p-2">A</th>
              <th className="border p-2">B</th>
              <th className="border p-2">C</th>
              <th className="border p-2">D</th>
              <th className="border p-2">E</th>
            </tr>
          </thead>

          <tbody>
            {["boys", "girls"].map((type) => (
              <tr key={type}>
                <td className="border p-2 capitalize">{type}</td>
                {["A", "B", "C", "D", "E"].map((grade) => (
                  <td key={grade} className="border p-2">
                    <input
                      type="number"
                      className="w-full border p-1"
                      onChange={(e) =>
                        handleMarksChange(type, grade, e.target.value)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CASTE INPUT */}
      <div>
        <h2 className="font-bold">Caste-wise Performance</h2>

        <table className="w-full border mt-2 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Category</th>
              <th className="border p-2">A</th>
              <th className="border p-2">B</th>
              <th className="border p-2">C</th>
              <th className="border p-2">D</th>
              <th className="border p-2">E</th>
            </tr>
          </thead>

          <tbody>
            {["SC", "ST", "OBC", "OTHER"].map((type) => (
              <tr key={type}>
                <td className="border p-2">{type}</td>
                {["A", "B", "C", "D", "E"].map((grade) => (
                  <td key={grade} className="border p-2">
                    <input
                      type="number"
                      className="w-full border p-1"
                      onChange={(e) =>
                        handleCasteMarksChange(type, grade, e.target.value)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========== PRINTABLE AREA with attractive border and signatures ========== */}
      <div id="print-area" className="border-4 border-gray-400 shadow-xl rounded-lg p-6 bg-white">

        <h2 className="text-center font-bold text-red-600 text-xl">
          શાળાકીય સર્વાંગી મૂલ્યાંકન (SCE)
        </h2>
<h3 className="text-center font-bold text-red-600 text-xl">
          પત્રક C વર્ષ 2025-26
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <p><span className="font-bold">School:</span> {form.school}</p>
          <p><span className="font-bold">Village:</span> {form.village}</p>
          <p><span className="font-bold">Taluka:</span> {form.taluka}</p>
          <p><span className="font-bold">District:</span> {form.district}</p>
          <p><span className="font-bold">Teacher:</span> {form.teacher}</p>
          <p><span className="font-bold">Date:</span> {form.date}</p>
          <p><span className="font-bold">Class:</span> {form.className}</p>
          <p><span className="font-bold">Total Students:</span> {form.totalStudents}</p>
        </div>

        {/* MARKS PREVIEW */}
        <table className="w-full border mt-4 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Type</th>
              <th className="border p-2">A</th>
              <th className="border p-2">B</th>
              <th className="border p-2">C</th>
              <th className="border p-2">D</th>
              <th className="border p-2">E</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border">Boys</td>
              <td className="border">{marks.boys.A}</td>
              <td className="border">{marks.boys.B}</td>
              <td className="border">{marks.boys.C}</td>
              <td className="border">{marks.boys.D}</td>
              <td className="border">{marks.boys.E}</td>
            </tr>

            <tr>
              <td className="border">Girls</td>
              <td className="border">{marks.girls.A}</td>
              <td className="border">{marks.girls.B}</td>
              <td className="border">{marks.girls.C}</td>
              <td className="border">{marks.girls.D}</td>
              <td className="border">{marks.girls.E}</td>
            </tr>

            <tr className="font-bold">
              <td className="border">Total</td>
              <td className="border">{total.A}</td>
              <td className="border">{total.B}</td>
              <td className="border">{total.C}</td>
              <td className="border">{total.D}</td>
              <td className="border">{total.E}</td>
            </tr>
          </tbody>
        </table>

        {/* CASTE PREVIEW */}
        <table className="w-full border mt-4 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Category</th>
              <th className="border p-2">A</th>
              <th className="border p-2">B</th>
              <th className="border p-2">C</th>
              <th className="border p-2">D</th>
              <th className="border p-2">E</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(casteMarks).map(([type, values]) => (
              <tr key={type}>
                <td className="border p-2">{type}</td>
                {Object.values(values).map((v, i) => (
                  <td key={i} className="border p-2">{v}</td>
                ))}
                <td className="border p-2 font-bold">{casteTotals[type]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER with signature boxes */}
        <div className="mt-8 border-t pt-4">
          <div className="flex justify-between items-end gap-4">
            {/* Class Teacher Sign */}
            <div className="text-center flex-1">
              <div className="border-b-2 border-black mb-1 h-12"></div>
              <p className="text-sm font-semibold">Class Teacher Sign</p>
            </div>
            {/* School Round Seal */}
            <div className="text-center flex-1">
              <div className="border-2 border-dashed border-gray-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-xs text-gray-500">
                Seal
              </div>
              <p className="text-sm font-semibold mt-1">School Round Seal</p>
            </div>
            {/* Principal Sign */}
            <div className="text-center flex-1">
              <div className="border-b-2 border-black mb-1 h-12"></div>
              <p className="text-sm font-semibold">Principal Sign</p>
            </div>
          </div>
        </div>

        {/* Original Footer Text */}
        <div className="mt-6 text-center text-sm border-t pt-3">
          <p>Powered by ANU Education 🎓</p>
          <p>FREE IELTS | PTE Classes</p>
          <p>www.anuedu.in</p>
        </div>

      </div>

      {/* PRINT BUTTON */}
      <div className="flex justify-center">
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          🖨️ Print 
        </button>
      </div>
<div className="print:hidden mt-6 text-center border-t pt-4">
  <p className="text-sm text-gray-600">
    Want to earn extra income during vacation?
  </p>

  <a
    href="https://wa.me/919428186817?text=Hi%20I%20am%20a%20teacher%20interested%20in%20collaboration"
    target="_blank"
    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
  >
    Become a Partner / Collaborate with ANU Education
  </a>
</div>
      {/* PRINT CSS: hide everything except #print-area */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            border: 2px solid #ccc !important;
            box-shadow: none !important;
          }
          button {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          .border-b-2 {
            border-bottom: 2px solid black !important;
          }
          .rounded-full {
            border: 2px dashed #666 !important;
          }
        }
      `}</style>

    </div>
  );
}