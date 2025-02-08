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

      const newChapterData = {
        chapter: matchingManga.chapter,
        source: matchingManga.source,
        link: matchingManga.link,
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

          if (manga.user.discordId && manga.status === "Lendo") {
            const discordNotification = notifyUserAboutNewChapter(
              process.env.DISCORD_CHANNEL_ID ?? "1321316349234118716",
              manga.user.discordId,
              manga.name,
              matchingManga.chapter,
              matchingManga.link
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
      } else {
        console.log(`Manga ID ${manga.id} não precisa ser atualizado.`);
      }
    } else {
      console.log(`Nenhuma correspondência para o manga ID ${manga.id}`);
    }
  }

  await Promise.all(discordNotifications);
  if (pushMessages.length > 0) {
    await sendPushNotificationsBatch(pushMessages);
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
