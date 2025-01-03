"use client";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { AddMangaButton } from "@/components/add-manga-button";
import { MangaContainer } from "@/components/manga-container";
import { useState } from "react";

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
""
    )}
  </main>
)
}
