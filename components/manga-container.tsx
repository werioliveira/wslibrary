import { useSession } from "next-auth/react";
import { MangaCard } from "./manga-card";
import { useMangas } from "@/hooks/useMangas";
import { useState } from "react";
import { Pagination } from "./pagination";

interface MangaCardProps {
    name: string
    image: string
    chapter: number
    lastUpdate: string
    website: string,
    linkToWebsite: string,
    id: string
  }
export function MangaContainer() {
    const { data: session } = useSession()
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 12
    const { mangas, isLoading, isError } = useMangas(session?.user?.id);
    if (isLoading) return <p>Carregando...</p>;
    if (isError) return <p>Erro ao carregar os mangás.</p>;
    let allManga = mangas.mangas
    const totalPages = Math.ceil(allManga.length / ITEMS_PER_PAGE)
    const mangaList = allManga.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
    return (
<>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mangaList.map((manga: MangaCardProps, index: number) => (
            <MangaCard key={index} {...manga} />
        ))}
    </div>
              <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              />
              </>
    )

  }