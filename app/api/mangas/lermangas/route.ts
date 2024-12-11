import { NextResponse } from "next/server";
import { fetchMangasFromSite, parseLerMangas } from "@/lib/fetchManga";
import puppeteer from 'puppeteer';
// Tipo para o ScrapedManga
type ScrapedManga = {
  title: string;
  link: string;
  chapter: number;
  source: string;
};

// Função para buscar e processar os mangás usando Puppeteer
export async function fetchAndParseLerMangas(): Promise<ScrapedManga[]> {
  const browser = await puppeteer.launch({
    headless: true, // Define para 'false' se quiser visualizar a execução
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessário para rodar em servidores
  });

  const page = await browser.newPage();

  try {
    // Acessa o site
    await page.goto('https://lermangas.me/', {
      waitUntil: 'networkidle2', // Aguarda o carregamento completo
      timeout: 60000, // Timeout para sites lentos
    });

    // Aguarda a presença dos elementos
    await page.waitForSelector('.page-item-detail.manga');

    // Processa os elementos diretamente do DOM
    const results: ScrapedManga[] = await page.evaluate(() => {
      const mangaElements = document.querySelectorAll('.page-item-detail.manga');
      const mangas: ScrapedManga[] = [];

      mangaElements.forEach((el) => {
        // Obtém o título
        const titleElement = el.querySelector('.post-title h3 a');
        const title = titleElement?.textContent?.trim();

        // Obtém o link
        const link = titleElement?.getAttribute('href')?.trim();

        // Obtém o capítulo mais recente
        const chapterText = el
          .querySelector('.list-chapter .chapter-item:first-child .chapter a')
          ?.textContent?.trim();
        const chapter = chapterText
          ? parseInt(chapterText.match(/\d+/)?.[0] ?? '0', 10)
          : 0;

        // Adiciona ao resultado se o título e link existirem
        if (title && link) {
          mangas.push({ title, link, chapter, source: 'Ler Mangás' });
        }
      });

      return mangas;
    });

    console.log('Mangás extraídos:', results);
    return results;
  } catch (error) {
    console.error('Erro ao processar Ler Mangas:', error);
    return [];
  } finally {
    // Fecha o navegador
    await browser.close();
  }
}
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

