"use client";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { AddMangaButton } from "@/components/add-manga-button";
import { MangaContainer } from "@/components/manga-container";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("Lendo");
  const [page] = useState(1);
  const [searchName, setSearchName] = useState("");
  // Funções para alterar o status
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(event.target.value);
  };
  return (
    <main className="container mx-auto py-8">
    {session ? (
      <>
        <div className="flex justify-center mb-5 gap-4">
          <Button
            variant="secondary"
            onClick={() => handleStatusChange("Lendo")}
            disabled={status === "Lendo"}
          >
            Lendo
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleStatusChange("PretendoLer")}
            disabled={status === "PretendoLer"}
          >
            Pretendo Ler
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleStatusChange("Dropado")}
            disabled={status === "Dropado"}
          >
            Dropado
          </Button>
        </div>

        {/* Campo de busca */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchName}
            onChange={handleSearch}
            className="border rounded px-3 py-2 w-full text-black"
          />
        </div>
        <MangaContainer status={status} page={page} searchName={searchName}/>
        <AddMangaButton />
      </>
    ) : (
      <div className="space-y-6">
        {/* Skeleton for status buttons */}
        <div className="flex justify-center mb-5 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>

        {/* Skeleton for search input */}
        <Skeleton className="h-10 w-full" />

        {/* Skeleton for manga list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        {/* Skeleton for add manga button */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    )}
  </main>
)
}
