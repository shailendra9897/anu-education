export const whatsappTemplates = [
  {
    name: "Teacher Collaboration",
    id: "teacher_collaboration_primary",
    category: "teacher",
    variables: [],
  },
  {
    name: "₹19 Demo Campaign",
    id: "student_class_19rs_1",
    category: "student",
    variables: ["name"],
  },
  {
    name: "College Faculty Program",
    id: "college_faculty_program_2026",
    category: "teacher",
    variables: [],
  },
  {
    name: "Consultant Collaboration",
    id: "consultant_collaboration_2026",
    category: "consultant",
    variables: [],
  },
  {
    name: "Free Classes + Counselling",
    id: "free_classes_counselling_2026",
    category: "student",
    variables: [],
  },
  {
    name: "College Students Demo",
    id: "college_students_demo_2026",
    category: "student",
    variables: ["name"],
  },
];


// ✅ WEBSITE WHATSAPP CTA MESSAGES

export const websiteWhatsAppMessages = {
  home:
    "Hi, I am interested in study abroad and language courses. Please guide me.",

  freeDemo:
    "Hi, I want to book a free demo class. Please share timings.",

  ieltsAhmedabad:
    "Hi, I want IELTS coaching in Ahmedabad. Please share fees, demo class and batch timings.",

  ieltsAcademic:
    "Hi, I am interested in IELTS Academic coaching. Please guide me about classes and fees.",

  pteAhmedabad:
  "Hi, I am interested in online PTE coaching for Ahmedabad students. Please share fees, demo class and batch timings.",
  german:
    "Hi, I want to learn German language. Please share course details and free demo information.",

  teacher:
    "Hi, I am a teacher interested in collaboration.",

  consultant:
    "Hi, I am interested in consultant partnership opportunities.",
    pte:
  "Hi, I am interested in PTE coaching. Please share details about fees, demo class and batch timings.",

  pteGandhinagar:
  "Hi, I am interested in your online PTE coaching for Gandhinagar students. Please guide me about fees, demo class and batch timings.",
};


// ✅ GLOBAL LINK GENERATOR

export const getWhatsAppLink = (message: string) => {
  return `https://wa.me/919428186817?text=${encodeURIComponent(message)}`;
};