import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip" // Supondo que você tenha um componente de Tooltip

interface NewChapter {
  chapter: number;
  source: string;
  link: string;
}
interface MangaCardProps {
  name: string;
  secondName?: string;
  image: string;
  chapter: number;
  lastUpdate: string;
  website: string;
  linkToWebsite: string;
  id: string;
  hasNewChapter: boolean;
  newChapter: NewChapter,
}

export function MangaCard({
  id,
  name,
  secondName,
  image,
  chapter,
  website,
  hasNewChapter,
  newChapter
}: MangaCardProps) {
  return (
    <Link href={`/manga/${id}`} className="block group">
      <Card className="bg-zinc-950 rounded-xl overflow-hidden transition-all ease-in-out duration-500 group-hover:shadow-lg group-hover:shadow-zinc-800/30 border-zinc-800 flex flex-col h-full">
        <div className="relative pt-[133%] overflow-hidden">
          <img
            src={image ? image : "/defaultmanga.webp"}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Badge de novo capítulo */}
        {hasNewChapter && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-sm font-extrabold px-3 py-1.5 rounded-md shadow-lg pulse-animation drop-shadow-2xl">
            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">New Chapter</span>
          </div>
        )}
        </div>
        <CardContent className="p-3 bg-zinc-950 flex-grow flex flex-col justify-between">
        <div className="flex flex-col gap-0.5">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>            
        <h2 className="font-medium text-sm text-white leading-tight mb-1 overflow-hidden line-clamp-1 text-start">
          {name}
        </h2>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>

  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>  
        {secondName ? (          
          <h4 className="font-small text-xs text-zinc-500 leading-tight mb-1 overflow-hidden line-clamp-1 text-start">
            {secondName}
          </h4>
        ) : (
          <h4 className="font-small text-xs text-zinc-500 leading-tight mb-1 overflow-hidden line-clamp-1 text-start">
            {name} {/* Repete o name caso secondName seja vazio */}
          </h4>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{secondName || name}</p> {/* Exibe secondName ou name se o segundo não existir */}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>


<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-2">
  <div>
    <span className="text-xs text-zinc-400 block">Cap. {chapter}</span>
    <span className="text-xs text-emerald-500 truncate block">Fonte. {website}</span>
  </div>
  
  {hasNewChapter && (
    <div className="mt-2 sm:mt-0 sm:text-right">
      <span className="text-xs text-amber-400 block">New Chapter. {newChapter?.chapter}</span>
      <span className="text-xs text-sky-500 block">Fonte. {newChapter?.source}</span>
    </div>
  )}
</div>
    </CardContent>
      </Card>
    </Link>
  );
}
