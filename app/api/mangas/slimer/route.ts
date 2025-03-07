import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseSlimeread } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://slimeread.com/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseSlimeread, "Slime Read"))
    )).flat();
    console.log(mangas)
    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error("Erro no scraping Slime Read:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}
