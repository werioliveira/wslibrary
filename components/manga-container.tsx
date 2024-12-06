import { useSession } from "next-auth/react";
import { MangaCard } from "./manga-card";
import { useMangas } from "@/hooks/useMangas";
import { useEffect, useState } from "react";
import { Pagination } from "./pagination";
import { MangaCardSkeleton } from "./manga-card-skeleton";
import { Skeleton } from "./ui/skeleton";

interface MangaCardProps {
  name: string;
  secondName?: string;
  image: string;
  chapter: number;
  lastUpdate: string;
  website: string;
  linkToWebsite: string;
  id: string;
}
export function MangaContainer({ status, page, searchName }: { status: string; page: number; searchName: string }) {

  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
 // Estado para o campo de busca
  const ITEMS_PER_PAGE = process.env.PAGE_LIMIT || 10;
  const { mangas, pagination, isLoading, isError } = useMangas(
    session?.user?.id,
    currentPage,
    ITEMS_PER_PAGE,
    status,
    searchName // Passa o nome para o hook
  );

  useEffect(() => {
    setCurrentPage(page);
  }, [status, page, searchName]);
  
  if (isLoading)
    return (
  <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ">
        <MangaCardSkeleton />
      </div>
        <div className="flex justify-center">
          <Skeleton className="h-10 w-40" />
        </div>      
  </>
    );
  if (isError) return <p>Erro ao carregar os mangás.</p>;
  if (!isLoading && mangas.length === 0) {
    return <p>Nenhum mangá encontrado.</p>;
  }
  return (
    <>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 transition-all ease-in-out duration-500 mx-1.5 lg:mx-0">
        {mangas.map((manga: MangaCardProps) => (
          <MangaCard key={manga.id} {...manga} />
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
