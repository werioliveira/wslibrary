import { NextResponse } from "next/server";
import { fetchMangasFromHteca, parseSlimeread } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://slimeread.com/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromHteca(url, parseSlimeread, "Slime Read"))
    )).flat();
    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {

    return NextResponse.json(
      { error: `Erro ao buscar dados de Slime Read. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );    
  }
}
