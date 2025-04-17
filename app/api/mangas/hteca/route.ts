import { NextResponse } from "next/server";
import { fetchMangasFromHteca, parseOldiSussytoons } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://hentaiteca.net/`,
    ];
    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
       urls.map((url) => fetchMangasFromHteca(url, parseOldiSussytoons, "Hentai Teca"))
     )).flat();

     return NextResponse.json( {mangas} , { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Erro ao buscar dados de Hentai Teca. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );  

  }
}
