import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseLunarScan } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://lunarrscan.com`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseLunarScan, "Lunar Scan" ))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao buscar dados de Lunar Scan. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );  

  }
}