import BlogPage from './BlogPageClient';

export const metadata = {
  title: "Study Abroad Blog | IELTS, PTE, German & Visa Tips | ANU Education",
  description:
    "Expert insights on IELTS, PTE, German & French language courses, study abroad preparation, visas, and international education from ANU Education.",
  alternates: {
    canonical: "https://www.anuedu.in/blog",
  },
};

export default function Page() {
  return <BlogPage />;
}
