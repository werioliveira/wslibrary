import { deduplicateMangas, fetchMangasFromSite, parseLerMangas, parseOldiSussytoons, parseSeitaCelestial, processMangas } from "@/lib/fetchManga";
import { NextResponse } from "next/server";


// Interface para o manga retornado da API (scraping)
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
    
    // Repetir a abordagem para outras fontes
    const [seitaMangas, oldiMangas, imperioMangas, lerMangas] = await Promise.all([
      fetchMangasFromSite(`https://seitacelestial.com/comics/?page=1&order=update`, parseSeitaCelestial, 'Seita Celestial'),
      fetchMangasFromSite(`https://lermangas.me/`, parseLerMangas, 'Ler Mangás'),
      fetchMangasFromSite(`https://oldi.sussytoons.site/`, parseOldiSussytoons, 'Sussy'),
      fetchMangasFromSite(`https://imperiodabritannia.com/`, parseOldiSussytoons, 'Impero Britânia'),
    ]);
    
    allScrapedMangas.push(...seitaMangas, ...oldiMangas, ...imperioMangas, ...lerMangas);
    

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