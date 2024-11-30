"use client";

import { signIn, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { AddMangaButton } from "@/components/add-manga-button";
import { MangaContainer } from "@/components/manga-container";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("Lendo");
  // Funções para alterar o status
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
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
          <MangaContainer status={status} />
          <AddMangaButton />
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4">Please log in to view your manga list.</p>
          <Button onClick={() => signIn("google")}>Login with Google</Button>
        </div>
      )}
    </main>
  );
}
