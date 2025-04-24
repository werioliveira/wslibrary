import { NextResponse } from "next/server";
import { fetchMangasWithPuppeteer, parseLunarScan } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://lunarrscan.com`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasWithPuppeteer(url, parseLunarScan, "Lunar Scan",".page-item-detail.manga" ))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao buscar dados de Lunar Scan. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );  

  }
}