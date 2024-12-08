import { deduplicateMangas, fetchMangasFromSite, parseSlimeRead, processMangas } from "@/lib/fetchManga";
import { NextResponse } from "next/server";
interface ScrapedManga {
  title: string;
  link: string;
  type?: string;
  chapter: number;
}
// Handler principal para a rota GET
export async function GET() {
  try {
    const allScrapedMangas: ScrapedManga[] = [];
/*
    // Fontes: Seita Celestial (Página 1 e Página 2)
    const seitaCelestialUrls = [
      `https://seitacelestial.com/comics/?page=2&order=update`,
      `https://seitacelestial.com/comics/?page=1&order=update`
    ];

    // Fazer o scrape das duas páginas
    for (const url of seitaCelestialUrls) {
      const seitaMangas = await fetchMangasFromSite(url, parseSeitaCelestial);
      allScrapedMangas.push(...seitaMangas);
    }

    // Fonte: Ler Mangás
    const lerMangasUrl = `https://lermangas.me/`;
    const lerMangas = await fetchMangasFromSite(lerMangasUrl, parseLerMangas);
    allScrapedMangas.push(...lerMangas);

    // URL do site Oldi Sussytoons
    const oldiSussytoonsUrl = `https://oldi.sussytoons.site/`;
    const oldiMangas = await fetchMangasFromSite(oldiSussytoonsUrl, parseOldiSussytoons);
    allScrapedMangas.push(...oldiMangas);

    // URL do site imperiodabritania
    const imperoBritaniaUrl = `https://imperiodabritannia.com/`;
    const imperioMangas = await fetchMangasFromSite(imperoBritaniaUrl, parseOldiSussytoons); // USANDO PARSE DA SUSSY POIS É IGUAL O HTML
    allScrapedMangas.push(...imperioMangas);
*/
    // URL do site imperiodabritania
    const slimeReadUrl = `https://slimeread.com/`;
    const slimeReadMangas = await fetchMangasFromSite(slimeReadUrl, parseSlimeRead); // USANDO PARSE DA SUSSY POIS É IGUAL O HTML
    allScrapedMangas.push(...slimeReadMangas);

    // Remover duplicatas baseando-se no título (ignorar maiúsculas/minúsculas)
    const uniqueMangas = deduplicateMangas(allScrapedMangas);

    // Processar mangás únicos e gerar notificações
    const notifications = await processMangas(uniqueMangas);

    return NextResponse.json({ message: "Novos mangás atualizados com sucesso.", notifications }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar capítulos." }, { status: 500 });
  }
}