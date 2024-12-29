import { NextResponse } from "next/server";


export async function GET() {
  const apiUrl = 'https://api-dev.sussytoons.site/obras/novos-capitulos?pagina=1&limite=24';
 
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Scan-id': '1', // Se necessário
      },
    });
    const baseUrl= "https://new.sussytoons.site/";
    const data = await response.json();
// Transformar a resposta da API no formato desejado
    const formattedResponse = {
      mangas: data.resultados.map((obra: any) => {
        const latestChapter = obra.ultimos_capitulos[0]; // Pega o último capítulo
        return {
          title: obra.obr_nome,
          link: `${baseUrl}${obra.obr_id}/${obra.obr_slug}/`,
          chapter: latestChapter.cap_numero,
          source: "New Sussy",
        };
      }),
    };
    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.log('Error:', error);
    return NextResponse.json({ error: 'Erro ao acessar a API' }, { status: 500 });
  }
  /*
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessário em ambientes como Vercel ou Docker
    });

    const page = await browser.newPage();
    await page.goto('https://new.sussytoons.site/', { waitUntil: 'networkidle2' });

    // Aguarde até que um seletor específico esteja disponível, caso necessário
    await page.waitForSelector('.css-r8mu0h',{ timeout: 30000 }); // Substitua pelo seletor relevante

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
  */
}