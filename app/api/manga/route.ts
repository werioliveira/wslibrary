
import { db } from "@/lib/db";
import { MangaStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
      const { name, image, chapter, website, userId, linkToWebsite, status } = await req.json();
      const data = {
        name: name,
        image: image,
        chapter: parseInt(chapter),
        website: website,
        linkToWebsite: linkToWebsite,
        status: status,
        userId: userId,
      }
      // Cria novo manga no MongoDB com Prisma
      const newManga = await db.manga.create({
        data
      });
  
      return NextResponse.json({ manga: newManga }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: 'Erro ao adicionar novo manga',error }, { status: 500 });
    }
  }
  export async function GET(req: NextRequest) {

    const userId = req.nextUrl.searchParams.get("userId");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1"); // Página atual, padrão 1
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10"); // Número de itens por página, padrão 10
    const status = req.nextUrl.searchParams.get("status") || "Lendo";

    if (!userId) {
        return NextResponse.json({ error: 'User ID é obrigatório' }, { status: 400 });
    }

    if (page < 1 || limit < 1) {
        return NextResponse.json({ error: 'Page e limit devem ser números positivos' }, { status: 400 });
    }

    try {
        const skip = (page - 1) * limit; // Calcula quantos itens devem ser ignorados
        const mangas = await db.manga.findMany({
          where: {
              userId: userId,
              status: <MangaStatus>status,  // Adiciona a condição de status ser igual a "Lendo"
          },
          skip: skip,
          take: limit,
      });

      // Agora, filtramos no lado do código os mangas com "Lendo" ou sem status
      


        const totalMangas = await db.manga.count({ where: { userId: userId, status: <MangaStatus>status } }); // Conta o total de mangas
        const totalPages = Math.ceil(totalMangas / limit); // Calcula o total de páginas

        return NextResponse.json(
            {
                mangas,
                pagination: {
                    page,
                    limit,
                    totalPages,
                    totalItems: totalMangas,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ message: 'Erro ao buscar mangas: ' + error }, { status: 500 });
    }
}