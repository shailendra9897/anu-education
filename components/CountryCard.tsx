// components/CountryCard.tsx
import Image from 'next/image';

interface CountryCardProps {
  name: string;
  image: string;
  link: string;
}

export function CountryCard({ name, image, link }: CountryCardProps) {
  return (
    <a href={link} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all border">
      <div className="relative h-40 w-full">
        <Image src={image} alt={name} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">{name}</h3>
      </div>
    </a>
  );
}