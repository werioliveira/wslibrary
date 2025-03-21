import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseLerMangas } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://lermangas.me`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseLerMangas, "Ler Mangás"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error("Erro no scraping Ler Mangás:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}