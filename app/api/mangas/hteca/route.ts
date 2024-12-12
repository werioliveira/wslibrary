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
    //console.error("Erro no scraping Hentai Teca:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}
