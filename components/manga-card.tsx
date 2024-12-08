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
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Badge de novo capítulo */}
      {hasNewChapter && (
        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
          Novo Capítulo!
        </div>
      )}
        </div>
        <CardContent className="p-3 bg-zinc-950 flex-grow flex flex-col justify-between">
          {/* Tooltip para mostrar o texto completo */}

          
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
            {secondName && (          
              <h4 className="font-small text-xs text-zinc-500 leading-tight mb-1 overflow-hidden line-clamp-1 text-start">
              {secondName}
            </h4>
            )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{secondName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs text-zinc-400">Cap. {chapter}</span>
            <span className="text-xs text-emerald-500 truncate">{website}</span>
            {hasNewChapter && (
              <>
                <span className="text-xs text-zinc-400">New Chapter. {newChapter?.chapter}</span>
                <span className="text-xs text-zinc-400">Fonte {newChapter?.source}</span>
              </>
            )}

          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
