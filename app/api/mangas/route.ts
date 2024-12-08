import { deduplicateMangas, processMangas } from "@/lib/fetchManga";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = "https://wslibrary.werioliveira.site";

    // Rotas de scraping individuais
    const endpoints = [
      `${baseUrl}/api/mangas/seitacelestial`,
      //`${baseUrl}/api/mangas/sussy`,
      `${baseUrl}/api/mangas/lermangas`,
    ];

    // Scraping de cada rota em paralelo
    const results = await Promise.all(
      endpoints.map((endpoint) =>
        fetch(endpoint)
          .then((res) => res.json())
          .catch((err) => {
            console.error(`Erro ao buscar ${endpoint}:`, err);
            return { mangas: [] }; // Retorna vazio em caso de erro
          })
      )
    );

    // Consolidar todos os mangas
    const allMangas = results.flatMap((result) => result.mangas);
    const uniqueMangas = deduplicateMangas(allMangas);

    // Processar mangás únicos e gerar notificações
    processMangas(uniqueMangas);
    return NextResponse.json({ mangas: "Novos mangás atualizados com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("Erro ao consolidar mangas:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}