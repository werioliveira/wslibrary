import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseLunarScan} from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://remangas.net/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseLunarScan, "Remangas"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error("Erro no scraping Remangas:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}