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
  const apiUrl = 'https://api.sussytoons.wtf/obras/novos-capitulos?pagina=1&limite=24';
 
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Scan-id': '1',
      },
    });

    const data = await response.json();
    const baseUrl = 'https://www.sussytoons.wtf/';
    const formattedResponse = {
      mangas: data.resultados.map((obra: any) => {
        // Create chapters array from ultimos_capitulos
        const chapters = obra.ultimos_capitulos.map((cap: any) => ({
          number: cap.cap_numero,
          link: `${baseUrl}capitulo/${cap.cap_id}/`,
          timeAgo: new Date(cap.cap_lancado_em).toLocaleString(),
        }));

        // Sort chapters by number in descending order
        const sortedChapters = chapters.sort((a: any, b: any) => b.number - a.number);

        return {
          title: obra.obr_nome,
          link: `${baseUrl}obra/${obra.obr_id}/${obra.obr_slug}/`,
          chapter: sortedChapters[0].number,
          chapters: sortedChapters,
          source: "New Sussy",
        };
      }),
    };

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.log('Error:', error);
    return NextResponse.json({ error: 'Erro ao acessar a API' }, { status: 500 });
  }
}