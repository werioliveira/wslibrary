import { db } from "@/lib/db";
import axios from "axios";
import * as cheerio from "cheerio";
import Fuse from "fuse.js"; // Importando o Fuse.js
import { notifyUserAboutNewChapter } from "./mangaNotifications";

// Interface para o manga retornado da API (scraping)
interface ScrapedManga {
  title: string;
  link: string;
  type?: string;
  chapter: number;
  source?: string;
}
interface NewChapter {
  chapter: number;
  source: string;
  link: string;
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
  // Ajuste a busca para maior flexibilidade e precisão
  const fuse = new Fuse(scrapedMangas, {
    keys: ["title"],
    threshold: 0.1, // Ajuste a sensibilidade para encontrar correspondências
    includeScore: true,
    shouldSort: true, // Ordena os resultados por relevância
  });

  // Busca os mangas do banco
  const userMangas = await db.manga.findMany({
    include: {
      user: true, // Inclui informações do usuário para obter o Discord ID
    },
  });

  // Para cada manga do usuário, busque correspondências com o título e subtítulo
  for (const manga of userMangas) {
    // Normalize os nomes para comparação
    const nameToSearch = manga.name.trim().toLowerCase();
    const secondNameToSearch = manga.secondName ? manga.secondName.trim().toLowerCase() : null;

    // Buscar correspondências usando Fuse.js
    const matches = [
      ...fuse.search(nameToSearch), 
      ...(secondNameToSearch ? fuse.search(secondNameToSearch) : []),
    ];

    // Se houver matches, processe o melhor
    const bestMatch = matches[0]; // Fuse já retorna os resultados ordenados, não é necessário sort()
    
    if (bestMatch && bestMatch.item.chapter > manga.chapter) {
      const matchingManga = bestMatch.item;
      
      // Preparar os dados do novo capítulo
      const newChapterData = {
        chapter: matchingManga.chapter,
        source: matchingManga.source,
        link: matchingManga.link,
      };

      // Verificar se há um novo capítulo
      const newChapter = manga.newChapter as unknown as NewChapter;
      if (!newChapter || newChapterData.chapter > newChapter.chapter) {

        // Atualiza o banco de dados com o novo capítulo
        await db.manga.update({
          where: { id: manga.id },
          data: {
            hasNewChapter: true,
            newChapter: newChapterData,
          },
        });

        // Notificar o usuário no Discord se o usuário estiver "Lendo"
        if (manga.user.discordId && manga.status === "Lendo") {
          await notifyUserAboutNewChapter(
            process.env.DISCORD_CHANNEL_ID ?? "1321316349234118716",
            manga.user.discordId,
            manga.name,
            matchingManga.chapter,
            matchingManga.link
          );
        }
      }
    }
  }
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
