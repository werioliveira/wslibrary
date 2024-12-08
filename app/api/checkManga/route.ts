import { db } from "@/lib/db";
import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import Fuse from "fuse.js"; // Importando o Fuse.js

// Interface para o manga retornado da API (scraping)
interface ScrapedManga {
  title: string;
  link: string;
  type?: string;
  chapter: number;
}

export async function GET() {
  try {
    // URL do site alvo
    const url = `https://seitacelestial.com/`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const results: ScrapedManga[] = [];

    // Seleciona os elementos com a classe "bsx" dentro da estrutura "bixbox"
    $(".bixbox .bsx").each((i, el) => {
      // Extrai o título do mangá
      const title = $(el).find("a").attr("title")?.trim();

      // Extrai o link para o mangá
      const link = $(el).find("a").attr("href");

      // Extrai o tipo (Manhwa, Manhua, Manga, etc.)
      const type = $(el).find(".type").text()?.trim();

      // Extrai o número do capítulo como texto
      const chapterText = $(el).find(".epxs").text()?.trim();
      // Usa expressão regular para capturar apenas os números no texto
      const chapter = chapterText ? parseInt(chapterText.match(/\d+/)?.[0] ?? "0", 10) : 0;

      // Adiciona ao resultado apenas se o título e o link existirem
      if (title && link) {
        results.push({ title, link, type, chapter });
      }
    });

    // Configuração do Fuse.js para comparar os títulos
    const fuse = new Fuse(results, {
      keys: ["title"],
      threshold: 0.3, // Define a tolerância para o match. 0.3 significa até 70% de similaridade
      includeScore: true,
    });

    const notifications = [];
    const userMangas = await db.manga.findMany();

    // Comparar os mangás do usuário com os resultados da API
    for (const manga of userMangas) {
      // Buscar um possível match com base no nome e no nome alternativo (secondName)
      const nameMatch = fuse.search(manga.name.toLowerCase());
      const secondNameMatch = manga.secondName ? fuse.search(manga.secondName.toLowerCase()) : [];

      const matchingManga = nameMatch.length > 0
        ? results.find(item => item.title.toLowerCase() === nameMatch[0].item.title.toLowerCase())
        : secondNameMatch.length > 0
        ? results.find(item => item.title.toLowerCase() === secondNameMatch[0].item.title.toLowerCase())
        : undefined;

      // Verificar se existe um capítulo mais recente
      if (matchingManga && matchingManga.chapter > manga.chapter) {
        notifications.push({
          userId: manga.userId,
          mangaName: manga.name,
          currentChapter: manga.chapter,
          newChapter: matchingManga.chapter,
          link: matchingManga.link,
        });

        // Atualizar o campo "hasNewChapter" no banco de dados
        await db.manga.update({
          where: { id: manga.id },
          data: { hasNewChapter: true },
        });
      }
    }

    return NextResponse.json({ message: "Novos mangás atualizados com sucesso." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar capítulos." }, { status: 500 });
  }
}
