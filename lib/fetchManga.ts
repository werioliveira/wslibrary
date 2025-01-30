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
async function sendPushNotification(expoPushToken: string, mangaName: string, chapter: number, link: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: `Novo capítulo de ${mangaName}!`,
    body: `Capítulo ${chapter} disponível.`,
    data: { url: link },
  };

  try {
    // Fazendo a requisição com maior timeout e cabeçalhos apropriados
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(message),
      timeout: 10000, // Timeout de 10 segundos
    });

    // Checando se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Erro ao enviar notificação:', errorResponse);
      throw new Error(`Erro ao enviar notificação: ${errorResponse.message || response.statusText}`);
    }

    const responseBody = await response.json();
    console.log('Notificação enviada com sucesso:', responseBody);

  } catch (error) {
    console.error('Erro ao enviar a notificação:', error);
    // Aqui você pode registrar no log ou tratar conforme necessário
  }
}
// Função principal de processamento dos mangás
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

  for (const manga of userMangas) {
    const nameToSearch = manga.name.trim().toLowerCase();
    const secondNameToSearch = manga.secondName ? manga.secondName.trim().toLowerCase() : null;

    const matches = [
      ...fuse.search(nameToSearch), 
      ...(secondNameToSearch ? fuse.search(secondNameToSearch) : []),
    ];

    const bestMatch = matches[0];

    if (bestMatch && bestMatch.item.chapter > manga.chapter) {
      const matchingManga = bestMatch.item;

      const newChapterData = {
        chapter: matchingManga.chapter,
        source: matchingManga.source,
        link: matchingManga.link,
      };

      const newChapter = manga.newChapter as unknown as NewChapter;
      if (!newChapter || newChapterData.chapter > newChapter.chapter) {
        await db.manga.update({
          where: { id: manga.id },
          data: {
            hasNewChapter: true,
            newChapter: newChapterData,
          },
        });
      
        // Criar as promessas de notificação
        const notifications: Promise<any>[] = [];
      
        // Notificar usuário no Discord (se aplicável)
        if (manga.user.discordId && manga.status === "Lendo") {
          const discordNotification = notifyUserAboutNewChapter(
            process.env.DISCORD_CHANNEL_ID ?? "1321316349234118716",
            manga.user.discordId,
            manga.name,
            matchingManga.chapter,
            matchingManga.link
          );
          notifications.push(discordNotification);
        }
      
        // Notificar usuário no aplicativo via push notification (se aplicável)
        if (manga.user.pushToken && manga.status === "Lendo") {
          const pushNotification = sendPushNotification(
            manga.user.pushToken,
            manga.name,
            matchingManga.chapter,
            matchingManga.link
          );
          notifications.push(pushNotification);
        }
      
        // Executar as notificações em paralelo
        await Promise.all(notifications);
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
