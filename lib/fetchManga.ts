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
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    }
  });

  const mangas = parseFunction(data);
  
  return mangas.map(manga => ({
    ...manga,
    source,
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
    // Título do mangá
    const title = $(el).find(".post-title h3 a").text()?.trim();
    // Link do mangá
    const link = $(el).find(".post-title h3 a").attr("href")?.trim();

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(el).find(".list-chapter .chapter-item").each((_, chapterEl) => {
      const chapterLink = $(chapterEl).find(".chapter a");
      const chapterText = chapterLink.text()?.trim();
      const timeAgo = $(chapterEl).find(".post-on").text()?.trim();
      const chapter = chapterText
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
        : 0;

      if (chapter && chapterLink.attr("href")) {
        chapters.push({
          number: chapter,
          link: chapterLink.attr("href") || "",
          timeAgo: timeAgo || "",
        });
      }
    });

    // Add to results if we have both title and link and at least one chapter
    if (title && link && chapters.length > 0) {
      results.push({
        title,
        link,
        chapter: chapters[0].number, // Keep the highest/latest chapter as the main chapter
        chapters, // Add all chapters as additional information
      });
    }
  });
  
  return results;
}

// Função específica para parsing do site https://mangaonline.blog/
export function parseMangaonline(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  const mangaElements = $(".page-item-detail.manga");

  // Processa cada mangá individualmente
  mangaElements.each((i, el) => {
    // Título do mangá
    const title = $(el).find(".post-title h3 a").text()?.trim();
    // Link do mangá
    const link = $(el).find(".post-title h3 a").attr("href")?.trim();

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(el).find(".list-chapter .chapter-item").each((_, chapterEl) => {
      const chapterLink = $(chapterEl).find(".chapter a");
      const chapterText = chapterLink.text()?.trim();
      const timeAgo = $(chapterEl).find(".post-on").text()?.trim();
      const chapter = chapterText
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
        : 0;

      if (chapter && chapterLink.attr("href")) {
        chapters.push({
          number: chapter,
          link: chapterLink.attr("href") || "",
          timeAgo: timeAgo || "",
        });
      }
    });

    // Add to results if we have both title and link and at least one chapter
    if (title && link && chapters.length > 0) {
      results.push({
        title,
        link,
        chapter: chapters[0].number, // Keep the highest/latest chapter as the main chapter
        chapters, // Add all chapters as additional information
      });
    }
  });
  
  return results;
}
// Função específica para parsing do site Slimeread
export function parseSlimeread(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  $(".group.relative.tw-vm").each((_, mangaEl) => {
    const el = $(mangaEl);

    // Título e link principal
    const titleEl = el.find("a[aria-label]").first();
    const title = titleEl.text().trim();
    const link = titleEl.attr("href")?.trim();

    // Captura os capítulos dentro do bloco `.tw-ufa`
    const chapterEls = el.find(".tw-ufa a.tw-wt");
    const chapters: MangaChapter[] = [];

    chapterEls.each((_, chapterEl) => {
      const ch = $(chapterEl);
      const chapterText = ch.text().trim();
      const chapterLink = ch.attr("href")?.trim();

      const chapter = chapterText 
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
        : 0;

      // Data do capítulo (busca no parágrafo com classe .tw-paa mais próximo)
      const timeAgo = el.find(".tw-paa").text().trim();

      if (chapter && chapterLink) {
        chapters.push({
          number: chapter,
          link: `https://slimeread.com${chapterLink}`,
          timeAgo,
        });
      }
    });

    if (title && link && chapters.length > 0) {
      results.push({
        title,
        link: `https://slimeread.com${link}`,
        chapter: chapters[0].number,
        chapters,
      });
    }
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

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(el).find(".chapters-list .chapter-row").each((_, chapterEl) => {
      const chapterLink = $(chapterEl).attr("href")?.trim();
      const chapterText = $(chapterEl).find(".chapter-number").text().trim();
      const timeAgo = $(chapterEl).find(".chapter-time").text().trim();
      const chapter = chapterText
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
        : 0;

      if (chapter && chapterLink) {
        chapters.push({
          number: chapter,
          link: `https://egotoons.com${chapterLink}`,
          timeAgo,
        });
      }
    });

    if (title && mangaLink && chapters.length > 0) {
      results.push({
        title,
        link: mangaLink,
        chapter: chapters[0].number,
        chapters,
      });
    }
  });

  return results;
}
// Função específica para parsing do site Yushuke
export function parseYushukeMangas(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  $(".manga-list .manga-card").each((_, el) => {
    const titleEl = $(el).find(".manga-title").first();
    const title = titleEl.text().trim();
    const mangaRelativeLink = titleEl.attr("href")?.trim();
    const mangaLink = mangaRelativeLink ? `https://new.yushukemangas.com${mangaRelativeLink}` : "";

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(el).find(".chapters-list .chapter-row").each((_, chapterEl) => {
      const chapterLink = $(chapterEl).attr("href")?.trim();
      const chapterText = $(chapterEl).find(".chapter-number").text().trim();
      const timeAgo = $(chapterEl).find(".chapter-time").text().trim();
      const chapter = chapterText
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
        : 0;

      if (chapter && chapterLink) {
        chapters.push({
          number: chapter,
          link: `https://new.yushukemangas.com${chapterLink}`,
          timeAgo,
        });
      }
    });

    if (title && mangaLink && chapters.length > 0) {
      results.push({
        title,
        link: mangaLink,
        chapter: chapters[0].number,
        chapters,
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

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(item).find('.list-chapter .chapter-item').each((_, chapterEl) => {
      const chapterLink = $(chapterEl).find('.chapter a');
      const chapterText = chapterLink.text().trim();
      const timeAgo = $(chapterEl).find('.post-on').text().trim();
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
        chapters, // Add all chapters as additional information
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

  // Select all manga items in the page
  $('.page-item-detail.manga').each((_, item) => {
    // Extract title and link
    const titleEl = $(item).find('.post-title h3 a');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href')?.trim();

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(item).find('.list-chapter .chapter-item').each((_, chapterEl) => {
      const chapterLink = $(chapterEl).find('.chapter a');
      const chapterText = chapterLink.text().trim();
      const timeAgo = $(chapterEl).find('.post-on').text().trim();
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
        chapters, // Add all chapters as additional information
      });
    }
  });

  return results;
}
export function parseMangaLivre(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Select manga items
  $(".manga__item").each((_, item) => {
    const titleEl = $(item).find(".post-title h2 a");
    const title = titleEl.text().trim();
    const link = titleEl.attr("href")?.trim();

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(item).find(".list-chapter .chapter-item").each((_, chapterEl) => {
      const chapterLink = $(chapterEl).find(".chapter a");
      const chapterText = chapterLink.text().trim();
      const timeAgo = $(chapterEl).find(".post-on.font-meta").text().trim();
      const chapter = chapterText 
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10)
        : 0;

      if (chapter && chapterLink.attr("href")) {
        chapters.push({
          number: chapter,
          link: chapterLink.attr("href") || "",
          timeAgo: timeAgo || "",
        });
      }
    });

    if (title && link && chapters.length > 0) {
      results.push({
        title,
        link,
        chapter: chapters[0].number,
        chapters,
        source: "Manga Livre",
      });
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

  // Debug: Log the entire HTML
  console.log('Raw HTML:', html.substring(0, 500) + '...'); // Show first 500 chars

  // Debug: Check how many manga elements were found
  const mangaElements = $('.chakra-stack.css-18y9vo3');
  console.log('Number of manga elements found:', mangaElements.length);

  // Debug: Log the first manga element's HTML if found
  if (mangaElements.length > 0) {
    console.log('First manga element HTML:', $(mangaElements[0]).html());
  }

  mangaElements.each((_, mangaElement) => {
    const element = $(mangaElement);

    // Debug: Log each element's data
    console.log('Title found:', element.find('.chakra-text.css-15d8el3').text());
    console.log('Link found:', element.find('.chakra-link.css-134gr64').attr('href'));
    console.log('Chapters found:', element.find('.chakra-link.css-p51p6n').length);

    // Título do manga
    const title = element.find('.chakra-text.css-15d8el3').text().trim();

    // Link do manga
    let link = element.find('.chakra-link.css-134gr64').attr('href')?.trim();
    link = 'https://www.sussytoons.wtf' + link;

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    element.find('.chakra-link.css-p51p6n').each((_, chapterEl) => {
      const chapterLink = $(chapterEl).attr('href')?.trim();
      const chapterText = $(chapterEl).find('.chakra-text.css-9uqpcm').text().trim();
      const timeAgo = $(chapterEl).find('.chakra-text.css-1ipnh8h').text().trim();
      
      const chapter = chapterText
        ? parseInt(chapterText.match(/\d+/)?.[0] ?? '0', 10)
        : 0;

      if (chapter && chapterLink) {
        chapters.push({
          number: chapter,
          link: 'https://www.sussytoons.wtf' + chapterLink,
          timeAgo: timeAgo || '',
        });
      }
    });

    // Verifica se o título e link existem antes de adicionar ao resultado
    if (title && link && chapters.length > 0) {
      results.push({
        title,
        link,
        chapter: chapters[0].number,
        chapters,
        source: "Sussy"
      });
    }
  });

  // Debug: Log final results
  console.log('Total results:', results.length);
  
  return results;
}

// Função para enviar notificação push via Expo
async function sendPushNotificationsBatch(messages: any[]) {
  const batchSize = 100; // Expo permite até 100 notificações por requisição
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const maxAttempts = 3;

  console.log(`Preparando para enviar ${messages.length} notificações.`);

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    let attempts = 0;

    console.log(`Enviando batch de notificações [${i} - ${i + batch.length}]`);

    while (attempts < maxAttempts) {
      try {
        console.log(`Tentativa ${attempts + 1} de envio...`);
        console.log("Conteúdo do batch:", JSON.stringify(batch, null, 2));

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
          },
          body: JSON.stringify(batch),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error('Erro ao enviar notificação - status HTTP:', response.status);
          console.error('Resposta da API da Expo:', responseData);
          throw new Error(`Erro ao enviar notificação: ${responseData.message || response.statusText}`);
        }

        console.log('Notificações enviadas com sucesso!');
        console.dir(responseData, { depth: null });

        break; // Envio bem-sucedido, sair do loop
      } catch (error) {
        console.error(`Tentativa ${attempts + 1} falhou ao enviar as notificações:`, error);
        attempts++;
        if (attempts < maxAttempts) {
          console.log('Aguardando 5 segundos antes da próxima tentativa...');
          await delay(5000);
        } else {
          console.error('Máximo de tentativas atingido. Batch falhou completamente.');
        }
      }
    }
  }

  console.log("Processo de envio de notificações finalizado.");
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
          if(process.env.NODE_ENV != "development"){
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
  if(process.env.NODE_ENV != "development"){
    await Promise.all(discordNotifications);
    if (pushMessages.length > 0) {
      await sendPushNotificationsBatch(pushMessages);
    }
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
export function parseYomuComics(html: string): ScrapedManga[] {
  const $ = cheerio.load(html);
  const results: ScrapedManga[] = [];

  // Select all manga items in the listupd
  $('.listupd .bsx').each((_, el) => {
    // Extract title and link from the series link
    const titleEl = $(el).find('.tt a');
    const title = titleEl.text().trim();
    const link = titleEl.attr('href')?.trim();

    // Extract all chapters from the list
    const chapters: MangaChapter[] = [];
    $(el).find('.chfiv li').each((_, chapterEl) => {
      const chapterLink = $(chapterEl).find('a');
      const chapterText = $(chapterEl).find('.fivchap').text().trim();
      const timeAgo = $(chapterEl).find('.fivtime').text().trim();
      
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
        chapters, // Add all chapters as additional information
        source: "Yomu Comics",
      });
    }
  });

  return results;
}
