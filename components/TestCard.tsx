// components/TestCard.tsx
interface TestCardProps {
  name: string;
  link: string;
}

export function TestCard({ name, link }: TestCardProps) {
  return (
    <a href={link} className="block bg-blue-50 border border-blue-200 rounded-xl p-4 text-center hover:bg-blue-100 transition">
      <h3 className="text-lg font-bold text-blue-700">{name}</h3>
    </a>
  );
}