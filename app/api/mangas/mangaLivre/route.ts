import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseMangaLivre} from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://mangalivre.ru/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseMangaLivre, "Manga Livre"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao buscar dados de Manga Livre. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );  

  }
}