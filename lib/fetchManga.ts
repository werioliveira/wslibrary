import { db } from "@/lib/db";
import axios from "axios";
import * as cheerio from "cheerio";
import Fuse from "fuse.js"; // Importando o Fuse.js

// Interface para o manga retornado da API (scraping)
interface ScrapedManga {
  title: string;
  link: string;
  type?: string;
  chapter: number;
  source?: string;
}
// Função genérica para buscar dados de um site
export async function fetchMangasFromSite(url: string, parseFunction: (data: string) => ScrapedManga[], source: string): Promise<ScrapedManga[]> {
  const { data } = await axios.get(url);

  const mangas = parseFunction(data);
  
  // Adiciona a origem para cada manga
  return mangas.map(manga => ({
    ...manga,
    source,  // Adiciona o nome do site
  }));
}
// Função genérica para buscar dados de um site
export async function fetchMangasFromHteca(url: string, parseFunction: (data: string) => ScrapedManga[], source: string): Promise<ScrapedManga[]> {
  const { data } = await axios.get(url,{
    headers: {
      'User-Agent': 'PostmanRuntime/7.43.0',
      "Accept": "*/*",
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',


  }
  });

  const mangas = parseFunction(data);
  
  // Adiciona a origem para cada manga
  return mangas.map(manga => ({
    ...manga,
    source,  // Adiciona o nome do site
  }));
}


// Função específica para parsing do site Seita Celestial
export function parseSeitaCelestial(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  $(".bixbox .bsx").each((i, el) => {
    const title = $(el).find("a").attr("title")?.trim();
    const link = $(el).find("a").attr("href");
    const type = $(el).find(".type").text()?.trim();
    const chapterText = $(el).find(".epxs").text()?.trim();
    const chapter = chapterText
      ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
      : 0;

    if (title && link) {
      results.push({ title, link, type, chapter });
    }
  });

  return results;
}
// Função específica para parsing do site Ler Mangás
export function parseLerMangas(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  const mangaElements = $(".page-item-detail.manga");

  // Processa cada mangá individualmente
  mangaElements.each((i, el) => {
    // Tentativa de pegar o título do mangá diretamente do texto do link
    const title = $(el).find(".post-title h3 a").text()?.trim();
    // Link do mangá
    const link = $(el).find(".post-title h3 a").attr("href")?.trim();

    // Número do capítulo mais recente
    const chapterText = $(el)
      .find(".list-chapter .chapter-item:first-child .chapter a")
      .text()
      ?.trim();
    const chapter = chapterText
      ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
      : 0;

    // Adiciona ao resultado se o título e link existirem
    if (title && link) {
      results.push({ title, link, chapter });
    }
  });
  return results;
}
// Função específica para parsing do site Slimeread
export function parseSlimeread(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Seleciona os elementos que representam mangás
  const mangaElements = $(".group.relative.transition-all");

  // Processa cada mangá individualmente
  mangaElements.each((i, el) => {
    // Extrai o título do mangá
    const title = $(el)
      .find("a[aria-label]")
      .text()
      ?.trim();

    // Extrai o link do mangá
    const link = $(el).find("a[aria-label]").attr("href")?.trim();

    // Extrai o capítulo mais recente
    const chapterText = $(el)
      .find(".mt-2 a.text-xs")
      .text()
      ?.trim();
    const chapter = chapterText
      ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
      : 0;

    // Adiciona ao resultado se o título e link existirem
    if (title && link) {
      results.push({ title, link: `https://slimeread.com${link}`, chapter });
    }
  });

  return results;
}
export function parseOldiSussytoons(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  const mangaElements = $(".page-item-detail.manga");

  // Processa cada mangá individualmente
  mangaElements.each((i, el) => {
    // Título do mangá - pega o título diretamente da tag <a> dentro de <h3>
    const title = $(el).find(".post-title h3 a").text()?.trim();

    // Link do mangá
    const link = $(el).find(".post-title h3 a").attr("href")?.trim();

    // Número do capítulo mais recente
    const chapterText = $(el)
      .find(".list-chapter .chapter-item:first-child .chapter a")
      .text()
      ?.trim();
    const chapter = chapterText
      ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
      : 0;

    // Adiciona ao resultado se o título e link existirem
    if (title && link) {
      results.push({ title, link, chapter });
    }
  });

  return results;
}

// Ajuste na função de processamento para incluir a origem do mangá
export async function processMangas(scrapedMangas: ScrapedManga[]) {
  const fuse = new Fuse(scrapedMangas, {
    keys: ["title"],
    threshold: 0.1, // Ajuste a sensibilidade para encontrar correspondências
    includeScore: true,
  });

  const notifications = [];
  const userMangas = await db.manga.findMany(); // Busca os mangás que o usuário acompanha

  for (const manga of userMangas) {
    // Buscar correspondências para `name` e `secondName`
    const matches = [
      ...fuse.search(manga.name.toLowerCase()),
      ...(manga.secondName ? fuse.search(manga.secondName.toLowerCase()) : []),
    ];

    // Selecionar o melhor match (com menor score)
    const bestMatch = matches.sort((a, b) => (a.score || 0) - (b.score || 0))[0];

    if (bestMatch && bestMatch.item.chapter > manga.chapter) {
      const matchingManga = bestMatch.item;

      // Definir o objeto que será salvo em `newChapter`
      const newChapterData = {
        chapter: matchingManga.chapter,
        source: matchingManga.source, // Inclui a origem do manga
        link: matchingManga.link,
      };

      notifications.push({
        userId: manga.userId,
        mangaName: manga.name,
        currentChapter: manga.chapter,
        newChapter: newChapterData, // Agora `newChapter` é um objeto com número e origem
        link: matchingManga.link,
      });

      // Atualizar o banco de dados para indicar que há um novo capítulo
      await db.manga.update({
        where: { id: manga.id },
        data: {
          hasNewChapter: true,
          newChapter: newChapterData, // Salvar o objeto com capítulo e origem
        },
      });
    }
  }

  return notifications; // Retorna as notificações geradas
}





// Função para deduplicar mangás baseando-se no título
export function deduplicateMangas(mangas: ScrapedManga[]): ScrapedManga[] {
  const seenTitles = new Map<string, ScrapedManga>();

  for (const manga of mangas) {
    const titleKey = manga.title.toLowerCase(); // Normalizar para ignorar diferenças de capitalização

    // Se já existir no mapa, mantemos o mangá com o capítulo mais recente
    if (seenTitles.has(titleKey)) {
      const existingManga = seenTitles.get(titleKey)!;
      if (manga.chapter > existingManga.chapter) {
        seenTitles.set(titleKey, manga);
      }
    } else {
      // Adiciona o mangá se ele ainda não foi encontrado
      seenTitles.set(titleKey, manga);
    }
  }

  // Retorna todos os valores únicos
  return Array.from(seenTitles.values());
}
