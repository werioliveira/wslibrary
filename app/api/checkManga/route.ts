import checkForUpdates from "@/lib/cron";
import axios from "axios";
import * as cheerio from "cheerio";
import {NextResponse } from "next/server";

interface Manga {
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

    const results = [<Manga>{}];

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
    await checkForUpdates(results);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar capítulos." }, { status: 500 });
  }
}
