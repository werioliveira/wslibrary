import { NextResponse } from "next/server";
import { chromium } from "playwright"; // Você também pode usar firefox ou webkit
import { parserNewSussytoons } from "@/lib/fetchManga";

export async function GET() {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Navega até o site
    await page.goto('https://new.sussytoons.site/', { waitUntil: 'networkidle' });

    // Aguarda um seletor específico que indica que os dados foram carregados
    await page.waitForSelector('.css-r8mu0h', { timeout: 30000 });

    // Alternativamente, você pode esperar por uma resposta de rede específica
    // await page.waitForResponse(response => response.url().includes('/endpoint-dinamico') && response.status() === 200);

    // Captura o conteúdo da página
    const html = await page.content();

    await browser.close();

    // Processa o conteúdo usando o parser
    const mangas = parserNewSussytoons(html);
    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error('Error scraping:', error);
    return NextResponse.json({ error: 'Error scraping data' }, { status: 500 });
  }
}