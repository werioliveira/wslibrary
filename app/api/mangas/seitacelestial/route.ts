import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseSeitaCelestial } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://seitacelestial.com`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseSeitaCelestial, "Seita Celestial"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
        // Adicionando o erro no retorno JSON, mas de forma mais amigável
        return NextResponse.json(
          { error: `Erro ao buscar dados de Seita Celestial. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
          { status: 500 }
        );
  }
}
