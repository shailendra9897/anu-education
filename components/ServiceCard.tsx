// components/ServiceCard.tsx
interface ServiceCardProps {
  title: string;
  link: string;
}

export function ServiceCard({ title, link }: ServiceCardProps) {
  return (
    <a href={link} className="block bg-green-50 border border-green-200 rounded-xl p-4 text-center hover:bg-green-100 transition">
      <h3 className="text-lg font-bold text-green-700">{title}</h3>
    </a>
  );
}