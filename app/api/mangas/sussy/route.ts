import { NextResponse } from "next/server";
/*
interface Manga {
  obr_id: string;
  obr_slug: string;
  ultimos_capitulos: { cap_lancado_em: string; cap_id: string }[];
}

function createLink(manga: Manga) {
  const ultimosCapitulos = manga.ultimos_capitulos;
  const baseUrl = 'https://new.sussytoons.site/';
  if (ultimosCapitulos.length < 1) {
    // Caso só tenha um capítulo, cria um link padrão
    return `${baseUrl}obra/${manga.obr_id}/${manga.obr_slug}/`;
  }
  // Pega os dois últimos capítulos
  const ultimo = new Date(ultimosCapitulos[0].cap_lancado_em).getTime();
  const penultimo = new Date(ultimosCapitulos[1].cap_lancado_em).getTime();

  // Calcula a diferença em minutos
  const diffMinutes = Math.abs((ultimo - penultimo) / (1000 * 60));

  if (diffMinutes <= 10) {
    // Se a diferença for menor ou igual a 10 minutos, cria um link especial
    return `${baseUrl}obra/${manga.obr_id}/${manga.obr_slug}/`;
  } else {
    return `${baseUrl}capitulo/638819/${manga.ultimos_capitulos[0].cap_id}/`;
    // Caso contrário, cria um link normal
    
  }
}
*/
export async function GET() {
  const apiUrl = 'https://api-dev.sussytoons.site/obras/novos-capitulos?pagina=1&limite=24';
 
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Scan-id': '1', // Se necessário
      },
    });

    const data = await response.json();
// Transformar a resposta da API no formato desejado
    const baseUrl = 'https://www.sussytoons.site/';
    const formattedResponse = {
      mangas: data.resultados.map((obra: any) => {
        const latestChapter = obra.ultimos_capitulos[0]; // Pega o último capítulo
       //const link = createLink(obra);
        return {
          title: obra.obr_nome,
 //         link: link,
          link: `${baseUrl}obra/${obra.obr_id}/${obra.obr_slug}/`,
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