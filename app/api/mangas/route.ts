import { deduplicateMangas, processMangas } from "@/lib/fetchManga";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Rotas de scraping individuais
    const endpoints = [
      `${baseUrl}/api/mangas/seitacelestial`,
      `${baseUrl}/api/mangas/sussy`,
      `${baseUrl}/api/mangas/imperio`,
      `${baseUrl}/api/mangas/lermangas`,
      `${baseUrl}/api/mangas/slimer`,	
      `${baseUrl}/api/mangas/hteca`,
      `${baseUrl}/api/mangas/lunar`,
      `${baseUrl}/api/mangas/ego`,
      `${baseUrl}/api/mangas/yushuke`,

      //`${baseUrl}/api/mangas/oldSussy`,
    ];

    // Scraping paralelo com exclusão de endpoints falhos
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint);
          if (!res.ok) {
            return null; // Ignora o endpoint
          }
          const data = await res.json();
          if (!data || !Array.isArray(data.mangas)) {

            return null; // Ignora o endpoint
          }
          return data;
        } catch (err) {
          console.log(`Erro ao buscar ${endpoint}:`, err);
          return null; // Ignora o endpoint em caso de erro
        }
      })
    );

    // Remove resultados nulos
    const validResults = results.filter((result) => result !== null);
    // Consolida todos os mangas
    const allMangas = validResults.flatMap((result) => result.mangas);
    const uniqueMangas = deduplicateMangas(allMangas);

    // Processa mangás únicos
    const notifications = await processMangas(uniqueMangas);
    

    return NextResponse.json({ mangas: notifications }, { status: 200 });
  } catch (error) {
    console.error("Erro ao consolidar mangas:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
