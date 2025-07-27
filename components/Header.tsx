export function Header() {
  return (
    <header className="w-full p-4 bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-blue-700">ANU Education</a>
        <nav className="space-x-4 hidden md:flex">
          <a href="/study-in/canada">Study Abroad</a>
          <a href="/test-prep/ielts-academic">Test Prep</a>
          <a href="/services/scholarship">Services</a>
          <a href="/finance/education-loan">Finance</a>
          <a href="/contact">Contact</a>
          import SidebarMenu from "@/components/SidebarMenu";
        </nav>
      </div>
    </header>
  );
}