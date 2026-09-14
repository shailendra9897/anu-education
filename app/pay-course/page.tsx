import PayCoursePage from './PayCourseClient';

export const metadata = {
  title: "Course Payment | ANU Education",
  description:
    "Pay course fees for IELTS, PTE, German A1, French A1 at ANU Education via UPI. Payment accepted after demo class confirmation.",
  alternates: {
    canonical: "https://www.anuedu.in/pay-course",
  },
};

export default function Page() {
  return <PayCoursePage />;
}
