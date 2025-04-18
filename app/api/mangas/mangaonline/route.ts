import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseLerMangas } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://mangaonline.blog/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseLerMangas, "Manga Online"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao buscar dados de Manga Online. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );  

  }
}