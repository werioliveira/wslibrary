import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseReadMangas} from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://app.loobyt.com/updates`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseReadMangas, "Read Mangas"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error("Erro no scraping Read Mangas:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}