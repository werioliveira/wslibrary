import { fetchMangasFromSite, parseOldiSussytoons } from "@/lib/fetchManga";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      // URLs para scraping
      const urls = [
        `https://oldi.sussytoons.site/`,
      ];
  
      // Realizar o scraping diretamente
      const mangas = (await Promise.all(
        urls.map((url) => fetchMangasFromSite(url, parseOldiSussytoons, "OldSussy"))
      )).flat();
  
      return NextResponse.json({ mangas }, { status: 200 });
    } catch (error) {
      console.error("Erro no scraping Sussy:", error);
      return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
    }
  }