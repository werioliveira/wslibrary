import { deduplicateMangas, fetchMangasFromSite, parseLerMangas, parseOldiSussytoons, parseSeitaCelestial, processMangas } from "@/lib/fetchManga";
import { NextRequest, NextResponse } from "next/server";
interface ScrapedManga {
  title: string;
  link: string;
  type?: string;
  chapter: number;
}
// Handler principal para a rota GET
export async function GET() {
  try {
   // Verifica se o cabeçalho "GitHub-Action" está presente e se o valor é o esperado
  //  const githubHeader = request.headers.get("GitHub-Action");

  //  // Substitua "YOUR_SECRET_TOKEN" pelo token que você configurou no GitHub Actions
  //  if (githubHeader !== "eKZ8IyclYXm9msLG3YGJ0WVQwTfzqDVGTerW8X9MMKukrP72r9dC2Y5Jl4zzzY7c") {
  //    return NextResponse.json(
  //      { error: "Unauthorized access" },
  //      { status: 403 } // Forbidden
  //    );
  //  }
    const allScrapedMangas: ScrapedManga[] = [];

    // Fontes: Seita Celestial (Página 1 e Página 2)
    const seitaCelestialUrls = [
      `https://seitacelestial.com/comics/?page=2&order=update`,
      `https://seitacelestial.com/comics/?page=1&order=update`
    ];

    // Fazer o scrape das duas páginas de Seita Celestial
    for (const url of seitaCelestialUrls) {
      const seitaMangas = await fetchMangasFromSite(url, parseSeitaCelestial, 'Seita Celestial');
      allScrapedMangas.push(...seitaMangas);
    }

    // Fonte: Ler Mangás
    const lerMangasUrl = `https://lermangas.me/`;
    const lerMangas = await fetchMangasFromSite(lerMangasUrl, parseLerMangas, 'Ler Mangás');
    allScrapedMangas.push(...lerMangas);

    // URL do site Oldi Sussytoons
    const oldiSussytoonsUrl = `https://oldi.sussytoons.site/`;
    const oldiMangas = await fetchMangasFromSite(oldiSussytoonsUrl, parseOldiSussytoons, 'Sussy');
    allScrapedMangas.push(...oldiMangas);

    // URL do site imperiodabritania
    const imperoBritaniaUrl = `https://imperiodabritannia.com/`;
    const imperioMangas = await fetchMangasFromSite(imperoBritaniaUrl, parseOldiSussytoons, 'Impero Britânia');
    allScrapedMangas.push(...imperioMangas);

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