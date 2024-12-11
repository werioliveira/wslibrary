import { deduplicateMangas, processMangas } from "@/lib/fetchManga";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = "http://localhost:3002";

    // Rotas de scraping individuais
    const endpoints = [
      `${baseUrl}/api/mangas/seitacelestial`,
      `${baseUrl}/api/mangas/sussy`,
      `${baseUrl}/api/mangas/lermangas`,
    ];

 // Scraping de cada rota em paralelo
const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const res = await fetch(endpoint);
        // Verifica se a resposta foi bem-sucedida (status 200)
        if (!res.ok) {
          throw new Error(`Falha na requisição: ${res.statusText}`);
        }
        const data = await res.json();
        // Verifica se o formato da resposta é válido
        if (!data || !Array.isArray(data.mangas)) {
          throw new Error(`Formato de dados inválido em ${endpoint}`);
        }
        return data;
      } catch (err) {
        console.log(`Erro ao buscar ${endpoint}:`, err);
        return { mangas: [] }; // Retorna vazio em caso de erro
      }
    })
  );

    // Consolidar todos os mangas
    const allMangas = results.flatMap((result) => result.mangas);
    const uniqueMangas = deduplicateMangas(allMangas);

    // Processar mangás únicos e gerar notificações
    const notifications = await processMangas(uniqueMangas);
    return NextResponse.json({ mangas: notifications }, { status: 200 });
  } catch (error) {
    console.error("Erro ao consolidar mangas:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
