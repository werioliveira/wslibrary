import { useSession } from "next-auth/react";
import { MangaCard } from "./manga-card";
import { useMangas } from "@/hooks/useMangas";
import { useState } from "react";
import { Pagination } from "./pagination";
import { MangaCardSkeleton } from "./manga-card-skeleton";

interface MangaCardProps {
  name: string;
  image: string;
  chapter: number;
  lastUpdate: string;
  website: string;
  linkToWebsite: string;
  id: string;
}
export function MangaContainer() {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { mangas, pagination, isLoading, isError } = useMangas(
    session?.user?.id,
    currentPage,
    ITEMS_PER_PAGE
  );
  if (isLoading)
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <MangaCardSkeleton />
      </div>
    );
  if (isError) return <p>Erro ao carregar os mangás.</p>;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 transition-all ease-in-out duration-500">
        {mangas.map((manga: MangaCardProps, index: number) => (
          <MangaCard key={index} {...manga} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
