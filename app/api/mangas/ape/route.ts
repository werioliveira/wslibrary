import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseApeComics } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://apecomics.net/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseApeComics, "Ape Comics" ))
    )).flat();
    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao buscar dados de Egotoons. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );  

  }
}
