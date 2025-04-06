"use client";

import { ArrowDownToLine, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter,useParams } from "next/navigation";

interface Props {
  params: {
    shareId: string;
  };
}

export default function SharedMangaPage() {
  const params = useParams<{ shareId: string }>()
  const shareId = params.shareId;
  const router = useRouter();

  const [manga, setManga] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    fetch(`/api/shared-manga/${shareId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar o mangá");
        return res.json();
      })
      .then((data) => {
        setManga(data);
      })
      .catch(() => {
        setManga(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shareId]);

  useEffect(() => {
    if (status === "success") {
      const timeout = setTimeout(() => {
        router.push("/"); // redireciona após 2.5s
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  const handleImport = async () => {
    setStatus("loading");

    try {
      const res = await fetch(`/api/manga/import/${shareId}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();

      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-white w-6 h-6" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">Mangá não encontrado ou link inválido.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-4xl w-full bg-zinc-800 rounded-2xl shadow-xl p-6 md:flex gap-6">
        <div className="flex-shrink-0">
          <img
            src={manga.image}
            alt={manga.name}
            className="w-52 h-auto rounded-lg shadow-md mx-auto"
          />
          <p className="text-center text-sm mt-2 text-zinc-400">
            {manga.website || "Origem desconhecida"}
          </p>
        </div>

        <div className="flex flex-col justify-between flex-grow mt-4 md:mt-0">
          <div>
            <h1 className="text-2xl font-bold mb-2">{manga.name}</h1>
            <p className="text-lg mb-6">
              Capítulo atual: <span className="font-semibold">{manga.chapter}</span>
            </p>
          </div>

          {status === "success" ? (
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <CheckCircle2 size={20} /> Mangá importado com sucesso! Redirecionando...
            </div>
          ) : status === "error" ? (
            <div className="flex items-center gap-2 text-red-400 font-medium">
              <XCircle size={20} /> Erro ao importar. Tente novamente.
            </div>
          ) : (
            <button
              onClick={handleImport}
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-white font-medium w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Importando...
                </>
              ) : (
                <>
                  <ArrowDownToLine size={18} /> Importar para minha conta
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
