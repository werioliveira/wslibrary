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

    // Check if response is ok and is JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      // If JSON parsing fails, return empty manga list instead of error
      return NextResponse.json({ mangas: [] }, { status: 200 });
    }

    // Validate data structure
    if (!data || !data.resultados || !Array.isArray(data.resultados)) {
      console.error('Invalid API response structure');
      return NextResponse.json({ mangas: [] }, { status: 200 });
    }

    const baseUrl = 'https://www.sussytoons.wtf/';
    const formattedResponse = {
      mangas: data.resultados.map((obra: any) => {
        try {
          const latestChapter = obra.ultimos_capitulos?.[0];
          if (!latestChapter || !obra.obr_id || !obra.obr_slug) {
            return null;
          }

          return {
            title: obra.obr_nome || 'Unknown Title',
            link: `${baseUrl}obra/${obra.obr_id}/${obra.obr_slug}/`,
            chapter: latestChapter.cap_numero || 0,
            source: "New Sussy",
          };
        } catch (mapError) {
          console.error('Error mapping manga:', mapError);
          return null;
        }
      }).filter(Boolean), // Remove null entries
    };

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.error('Sussy API Error:', error);
    // Return empty array instead of error to prevent breaking the main manga list
    return NextResponse.json({ mangas: [] }, { status: 200 });
  }
}