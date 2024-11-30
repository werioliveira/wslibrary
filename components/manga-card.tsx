import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface MangaCardProps {
  name: string;
  image: string;
  chapter: number;
  lastUpdate: string;
  website: string;
  linkToWebsite: string;
  id: string;
}

export function MangaCard({
  id,
  name,
  image,
  chapter,
  website,
}: MangaCardProps) {
  return (
    <Link href={`/manga/${id}`} className="block group">
      <Card className="bg-zinc-950 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-zinc-800/30 border-zinc-800 flex flex-col h-full">
        <div className="relative pt-[133%] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-3 bg-zinc-950 flex-grow">
          <h2 className="font-medium text-sm text-white leading-tight line-clamp-2 mb-1">
            {name}
          </h2>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-400">Cap. {chapter}</span>
            <span className="text-xs text-zinc-500 truncate">{website}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
