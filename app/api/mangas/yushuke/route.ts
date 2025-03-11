import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseYushukeMangas,  } from "@/lib/fetchManga";

export async function GET() {
  try {
    // URLs para scraping
    const urls = [
      `https://new.yushukemangas.com/`,
    ];

    // Realizar o scraping diretamente
    const mangas = (await Promise.all(
      urls.map((url) => fetchMangasFromSite(url, parseYushukeMangas, "Yushuke Mangas"))
    )).flat();
    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error("Erro no scraping Yushuke Mangas:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}
