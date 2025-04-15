"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AddMangaButton } from "@/components/add-manga-button";
import { MangaContainer } from "@/components/manga-container";
import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react"; // Importando ícone de download

export default function Home() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("Lendo");
  const [page] = useState(1);
  const [searchName, setSearchName] = useState("");

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(event.target.value);
  };

  return (
    <main className="container mx-auto py-8 relative">
      {session ? (
        <>
          <div className="flex flex-wrap justify-center mb-5 gap-2 px-4">
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
            <Button
              variant="secondary"
              onClick={() => handleStatusChange("Concluido")}
              disabled={status === "Concluido"}
            >
              Concluido
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
          <MangaContainer status={status} page={page} searchName={searchName} />
          <AddMangaButton />
        </>
      ) : (
        ""
      )}

      {/* Botão Flutuante de Download */}
      <Link
        href='https://minio.werioliveira.shop/wslibrary/app/wslibrary.apk' // Substitua pelo link do seu app
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-20 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <Download className="h-6 w-6" /> {/* Ícone de download */}
      </Link>
    </main>
  );
}