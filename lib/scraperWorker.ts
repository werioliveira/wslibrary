import { fetchMangasFromSite, parseSeitaCelestial, parseLerMangas, parseOldiSussytoons, deduplicateMangas, processMangas } from "@/lib/fetchManga";
interface ScrapedManga {
    title: string;
    link: string;
    type?: string;
    chapter: number;
  }
async function scrape() {
  try {
    const allScrapedMangas: ScrapedManga[] = [];
    const seitaCelestialUrls = [
      `https://seitacelestial.com/comics/?page=2&order=update`,
      `https://seitacelestial.com/comics/?page=1&order=update`,
    ];

    // Executar o scraping de forma paralela
    const seitaMangasPromises = seitaCelestialUrls.map(url =>
      fetchMangasFromSite(url, parseSeitaCelestial, 'Seita Celestial')
    );
    const seitaMangas = (await Promise.all(seitaMangasPromises)).flat();
    allScrapedMangas.push(...seitaMangas);

    const [lerMangas, oldiMangas, imperioMangas] = await Promise.all([
      fetchMangasFromSite(`https://lermangas.me/`, parseLerMangas, 'Ler Mangás'),
      fetchMangasFromSite(`https://oldi.sussytoons.site/`, parseOldiSussytoons, 'Sussy'),
      fetchMangasFromSite(`https://imperiodabritannia.com/`, parseOldiSussytoons, 'Impero Britânia'),
    ]);
    
    allScrapedMangas.push(...lerMangas, ...oldiMangas, ...imperioMangas);
    
    const uniqueMangas = deduplicateMangas(allScrapedMangas);
    await processMangas(uniqueMangas);

  } catch (error) {
    console.error('Erro no scraping:', error);
  }
}

export default scrape;