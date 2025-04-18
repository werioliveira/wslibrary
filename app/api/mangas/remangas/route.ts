import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseLunarScan} from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://remangas.net/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseLunarScan, "Remangas"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    // Adicionando o erro no retorno JSON, mas de forma mais amigável
    return NextResponse.json(
      { error: `Erro ao buscar dados de Remangas. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}