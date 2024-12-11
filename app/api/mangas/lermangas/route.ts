import { fetchAndParseLerMangas } from "@/lib/scraperWorker";
import { NextResponse } from "next/server";



// Função para buscar e processar os mangás usando Puppeteer

export async function GET() {



  


  try {
    // URLs para scraping
    const mangas = await fetchAndParseLerMangas();
    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error("Erro no scraping Ler mangas:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}

