import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseManhastro} from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://manhastro.com/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseManhastro, "Manhastro"))
    )).flat();

    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error("Erro no scraping Manhastro:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}