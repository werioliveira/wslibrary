import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'

interface MangaCardProps {
  name: string
  image: string
  chapter: number
  lastUpdate: string
  website: string
  linkToWebsite: string
  id: string
}

export function MangaCard({ 
  name, 
  image, 
  chapter, 
  website,
  id
}: MangaCardProps) {
  return (
    <Link href={`/manga/${id}`}>
    <Card className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="relative w-full aspect-[3/4] mb-4">
          <img
            src={image}
            alt={name}
            className="object-cover rounded-sm"
          />
        </div>
        <div className="flex flex-col flex-grow text-center">
          <h2 className="font-semibold text-sm truncate mb-2">{name}</h2>
          <h2 className="font-semibold text-sm truncate mb-2">Capítulo {chapter}</h2>
          <h2 className="font-semibold text-sm truncate mb-2">Website {website}</h2>

        </div>
      </CardContent>
    </Card>
  </Link>

  )
}
