import { NextResponse } from "next/server";
import { parserNewSussytoons } from "@/lib/fetchManga";
import puppeteer from "puppeteer";

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessário em ambientes como Vercel ou Docker
    });

    const page = await browser.newPage();
    await page.goto('https://new.sussytoons.site/', { waitUntil: 'networkidle2' });

    // Aguarde até que um seletor específico esteja disponível, caso necessário
    await page.waitForSelector('.css-r8mu0h'); // Substitua pelo seletor relevante

    // Extraia o HTML renderizado
    const content = await page.content();

    await browser.close();
    // Realizar o scraping diretamente
    const mangas = parserNewSussytoons(content)
    return NextResponse.json({ mangas }, { status: 200 });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error:'Scraping error:' }, { status: 500 });

  }

}
