import { db } from "@/lib/db";
import axios from "axios";
import * as cheerio from "cheerio";
import Fuse from "fuse.js"; // Importando o Fuse.js
import { notifyUserAboutNewChapter } from "./mangaNotifications";


interface MangaChapter {
  number: number;
  link: string;
  timeAgo: string;
}

interface ScrapedManga {
  title: string;
  link: string;
  type?: string;
  chapter: number;
  source?: string;
  chapters?: MangaChapter[];
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
// First, let's add a new interface to handle multiple chapters
// Update the interfaces at the top of the file

export function parseSeitaCelestial(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Select all manga items in the listupd
  $('.listupd .utao').each((_, el) => {
    // Extract title and link from the series link
    const seriesLink = $(el).find('a.series');
    const title = seriesLink.attr('title')?.trim();
    const link = seriesLink.attr('href')?.trim();

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(el).find('ul li').each((_, chapterEl) => {
      const chapterLink = $(chapterEl).find('a');
      const chapterText = chapterLink.text()?.trim();
      const timeAgo = $(chapterEl).find('span').text()?.trim();
      const chapter = chapterText
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? '0', 10)
        : 0;

      if (chapter && chapterLink.attr('href')) {
        chapters.push({
          number: chapter,
          link: chapterLink.attr('href') || '',
          timeAgo: timeAgo || '',
        });
      }
    });

    // Add to results if we have both title and link and at least one chapter
    if (title && link && chapters.length > 0) {
      results.push({
        title,
        link,
        chapter: chapters[0].number, // Keep the highest/latest chapter as the main chapter
        chapters: chapters, // Add all chapters as additional information
        source: 'Seita Celestial',
      });
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
  
  // Seleciona os blocos principais onde os mangás estão listados
  $(".tw-ufa .tw-dfa .grid.tw-kr").each((i, section) => {
    console.log(section)
    // Para cada seção, pega os mangás individuais
    $(section).find(".group.relative.tw-vm").each((j, mangaEl) => {

      // Título do mangá
      const titleEl = $(mangaEl).find("a[aria-label]").first();
      const title = titleEl.text().trim();
      const link = titleEl.attr("href")?.trim();

      // Último capítulo disponível
      const chapterEl = $(mangaEl).find(".tw-ufa a.tw-wt").last();
      const chapterText = chapterEl.text().trim();
      const chapterLink = chapterEl.attr("href")?.trim();
      const chapter = chapterText ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10) : 0;

      if (title && link && chapterLink) {
        results.push({
          title,
          link: `https://slimeread.com${link}`,
          chapter,
        });
      }
    });
  });

  return results;
}

// Função específica para parsing do site Egotoons
export function parseEgotoons(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  $(".manga-list .manga-card").each((_, el) => {
    const titleEl = $(el).find(".manga-title").first();
    const title = titleEl.text().trim();
    const mangaRelativeLink = titleEl.attr("href")?.trim();
    const mangaLink = mangaRelativeLink ? `https://egotoons.com${mangaRelativeLink}` : "";

    const lastChapterEl = $(el).find(".chapters-list .chapter-row").first();
    const chapterText = lastChapterEl.find(".chapter-number").text().trim();
    const chapterMatch = chapterText.match(/\d+/);
    const chapter = chapterMatch ? parseInt(chapterMatch[0], 10) : 0;
    const chapterRelativeLink = lastChapterEl.attr("href")?.trim();
    const chapterLink = chapterRelativeLink ? `https://egotoons.com${chapterRelativeLink}` : "";

    if (title && mangaLink && chapterLink) {
      results.push({
        title,
        link: mangaLink,
        chapter,
      });
    }
  });

  return results;
}
// Função específica para parsing do site Egotoons
export function parseYushukeMangas(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  $(".manga-list .manga-card").each((_, el) => {
    const titleEl = $(el).find(".manga-title").first();
    const title = titleEl.text().trim();
    const mangaRelativeLink = titleEl.attr("href")?.trim();
    const mangaLink = mangaRelativeLink ? `https://new.yushukemangas.com${mangaRelativeLink}` : "";

    const lastChapterEl = $(el).find(".chapters-list .chapter-row").first();
    const chapterText = lastChapterEl.find(".chapter-number").text().trim();
    const chapterMatch = chapterText.match(/\d+/);
    const chapter = chapterMatch ? parseInt(chapterMatch[0], 10) : 0;
    const chapterRelativeLink = lastChapterEl.attr("href")?.trim();
    const chapterLink = chapterRelativeLink ? `https://new.yushukemangas.com${chapterRelativeLink}` : "";

    if (title && mangaLink && chapterLink) {
      results.push({
        title,
        link: mangaLink,
        chapter,
      });
    }
  });

  return results;
}

export function parseManhastro(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Select all manga items in the page
  $('.page-item-detail.manga').each((_, item) => {
    // Extract title and link
    const titleEl = $(item).find('.post-title h3 a');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href')?.trim();

    // Extract latest chapter
    const lastChapterEl = $(item).find('.list-chapter .chapter-item').first();
    const chapterText = lastChapterEl.find('.chapter a').text().trim();
    const chapter = chapterText 
      ? parseInt(chapterText.match(/\d+/)?.[0] ?? '0', 10)
      : 0;

    // Add to results if we have both title and link
    if (title && link) {
      results.push({
        title,
        link,
        chapter,
      });
    }
  });

  return results;
}
export function parseReadMangas(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Select all manga articles within the grid
  $('div[id^="S:"] a').each((_, item) => {
    // Extract title from h3
    const title = $(item).find('h3').text().trim();
    
    // Extract link
    const link = 'https://app.loobyt.com' + $(item).attr('href')?.trim();

    // Extract chapter number
    const chapterText = $(item).find('.text-muted-foreground span').first().text().trim();
    const chapter = chapterText
      ? parseInt(chapterText.match(/\d+/)?.[0] ?? '0', 10)
      : 0;

    // Add to results if we have both title and link
    if (title && link && chapter) {
      results.push({
        title,
        link,
        chapter,
      });
    }
  });

  return results;
}
export function parseLunarScan(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Seleciona a div que contém tudo
  $("#loop-content .page-listing-item").each((i, item) => {
    // Dentro de cada "page-listing-item", pega todas as divs de mangás
    $(item).find(".col-6.col-md-3.badge-pos-2 .page-item-detail.manga").each((j, mangaEl) => {
      // Extrai o título do mangá
      const title = $(mangaEl).find(".post-title a").first().text().trim();
      const link = $(mangaEl).find(".post-title a").first().attr("href")?.trim();

      if (title && link) {
        // Pega o último capítulo listado
        const lastChapterEl = $(mangaEl).find(".list-chapter .chapter-item a").first();
        const chapterText = lastChapterEl.text().trim();
        const chapter = chapterText ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10) : 0;
        const chapterLink = lastChapterEl.attr("href")?.trim();

        if (chapter && chapterLink) {
          results.push({
            title,
            link,
            chapter,
          });
        }
      }
    });
  });

  return results;
}
export function parseMangaLivre(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Seleciona o conteúdo principal onde os mangás estão listados
  $(".manga__item").each((i, item) => {
    // Extrai o título e o link do mangá
    const title = $(item).find(".post-title h2 a").text().trim();
    const link = $(item).find(".post-title a").attr("href")?.trim();

    if (title && link) {
      // Extrai o número do último capítulo
      const lastChapterEl = $(item).find(".list-chapter .chapter-item a").first();
      const chapterText = lastChapterEl.text().trim();
      const chapter = chapterText ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10) : 0;

      if (chapter) {
        // Adiciona o mangá à lista de resultados
        results.push({
          title,
          link,
          chapter,
        });
      }
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
export function parserNewSussytoons(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];


  // Itera sobre cada elemento de manga
  $('.chakra-stack.css-18y9vo3').each((_, mangaElement) => {
    const element = $(mangaElement);

    // Título do manga
    const title = element.find('.chakra-text.css-15d8el3').text().trim();

    // Link do manga
    let link = element.find('.chakra-link.css-1dbs7sg').attr('href')?.trim();
    link = 'https://new.sussytoons.site' + link;
    // Imagem do manga

    // Capítulo mais recente
    const chapterText = element
      .find('.chakra-text.css-1aakaxo')
      .first()
      .text()
      .trim();
    const chapter = chapterText ? parseInt(chapterText.match(/\d+/)?.[0] ?? '0', 10) : 0;


    // Verifica se o título e link existem antes de adicionar ao resultado
    if (title && link) {
      results.push({
        title,
        link,
        chapter,
        source: "Sussy"
      });
    }
  });
  // Retorna os resultados
  return results;
}

// Função para enviar notificação push via Expo
async function sendPushNotificationsBatch(messages: any[]) {
  const batchSize = 100; // Expo permite até 100 notificações por requisição
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const maxAttempts = 3;

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Erro ao enviar notificação:', errorResponse);
          throw new Error(`Erro ao enviar notificação: ${errorResponse.message || response.statusText}`);
        }

        console.log('Notificações enviadas com sucesso:', await response.json());
        break;
      } catch (error) {
        console.error(`Tentativa ${attempts + 1} falhou ao enviar as notificações:`, error);
        attempts++;
        if (attempts < maxAttempts) await delay(5000);
      }
    }
  }
}

export async function processMangas(scrapedMangas: ScrapedManga[]) {
  const fuse = new Fuse(scrapedMangas, {
    keys: ["title"],
    threshold: 0.1,
    includeScore: true,
    shouldSort: true,
  });

  const userMangas = await db.manga.findMany({
    include: {
      user: true,
    },
  });

  const pushMessages: any[] = [];
  const discordNotifications: Promise<any>[] = [];
  const updatedMangas: {
    id: string;
    name: string;
    oldChapter: number;
    newChapter: number;
    source: string;
    link: string;
    userId: string;
  }[] = [];

  for (const manga of userMangas) {
    const nameToSearch = manga.name.trim().toLowerCase();
    const secondNameToSearch = manga.secondName ? manga.secondName.trim().toLowerCase() : null;

    const matches = [
      ...fuse.search(nameToSearch),
      ...(secondNameToSearch ? fuse.search(secondNameToSearch) : []),
    ];

    let bestMatch: any = null;
    let maxChapter = manga.chapter;

    for (const match of matches) {
      if (match.item.chapter > maxChapter) {
        bestMatch = match;
        maxChapter = match.item.chapter;
      }
    }

    if (bestMatch && bestMatch.item.chapter > manga.chapter) {
      const matchingManga = bestMatch.item;
      const userCurrentChapter = manga.chapter;
      let linkToUse = matchingManga.link; // Default to main manga page

      // Check if the site provides multiple chapters
      if (matchingManga.chapters && matchingManga.chapters.length > 0) {
        const sortedChapters = matchingManga.chapters.sort((a: MangaChapter, b: MangaChapter) => b.number - a.number);
        
        // If user is just one chapter behind, use the direct chapter link
        if (userCurrentChapter === sortedChapters[0].number - 1) {
          linkToUse = sortedChapters[0].link;
        }
      }

      const newChapterData = {
        chapter: matchingManga.chapter,
        source: matchingManga.source,
        link: linkToUse,
      };

      const newChapter = manga.newChapter as unknown as NewChapter;

      if (!newChapter || newChapterData.chapter > newChapter.chapter) {
        try {
          await db.manga.update({
            where: { id: manga.id },
            data: {
              hasNewChapter: true,
              newChapter: newChapterData,
            },
          });

          console.log(`Manga ID: ${manga.id} atualizado com sucesso!`);

          updatedMangas.push({
            id: manga.id,
            name: manga.name,
            oldChapter: manga.chapter,
            newChapter: matchingManga.chapter,
            source: matchingManga.source,
            link: matchingManga.link,
            userId: manga.userId,
          });

          if (manga.user.discordId && manga.status === "Lendo") {
            const discordNotification = notifyUserAboutNewChapter(
              process.env.DISCORD_CHANNEL_ID ?? "1321316349234118716",
              manga.user.discordId,
              manga.name,
              matchingManga.chapter,
              matchingManga.link,
            );
            discordNotifications.push(discordNotification);
          }

          if (manga.user.pushToken && manga.status === "Lendo") {
            pushMessages.push({
              to: manga.user.pushToken,
              sound: 'default',
              title: `Novo capítulo de ${manga.name}!`,
              body: `Capítulo ${matchingManga.chapter} disponível.`,
              data: { url: matchingManga.link },
            });
          }
        } catch (error) {
          console.error(`Erro ao atualizar manga ID ${manga.id}:`, error);
        }
      }
    }
  }

  await Promise.all(discordNotifications);
  if (pushMessages.length > 0) {
    await sendPushNotificationsBatch(pushMessages);
  }

  return updatedMangas;
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
