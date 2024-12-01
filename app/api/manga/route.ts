import { db } from "@/lib/db";
import { MangaStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, image, chapter, website, userId, linkToWebsite, status } =
      await req.json();
    const data = {
      name: name,
      image: image,
      chapter: parseInt(chapter),
      website: website,
      linkToWebsite: linkToWebsite,
      status: status,
      userId: userId,
    };
    // Cria novo manga no MongoDB com Prisma
    const newManga = await db.manga.create({
      data,
    });

    return NextResponse.json({ manga: newManga }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao adicionar novo manga", error },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1"); // Página atual, padrão 1
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10"); // Número de itens por página, padrão 10
  const status = req.nextUrl.searchParams.get("status") || "Lendo";
  const name = req.nextUrl.searchParams.get("name");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID é obrigatório" },
      { status: 400 }
    );
  }

  if (page < 1 || limit < 1) {
    return NextResponse.json(
      { error: "Page e limit devem ser números positivos" },
      { status: 400 }
    );
  }

  try {
    const skip = (page - 1) * limit; // Calcula o deslocamento

    // Define o tipo do where explicitamente
    const where: Prisma.MangaWhereInput = {
      userId: userId, // Filtra pelo ID do usuário
      status: status as MangaStatus, // Filtra pelo status, converte para o tipo correto
    };

    // Adiciona filtro pelo nome, se fornecido
    if (name) {
      where.name = {
        contains: name, // Busca parcialmente
        mode: "insensitive", // Ignora maiúsculas/minúsculas
      };
    }
    // Busca os mangás com paginação
    const mangas = await db.manga.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { updatedAt: "desc" },
        { id: "asc" }, // Chave secundária para evitar duplicatas
      ],
    });

    // Conta o total de mangás com os filtros aplicados
    const totalMangas = await db.manga.count({ where });
    const totalPages = Math.ceil(totalMangas / limit);
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
    return NextResponse.json(
      { message: "Erro ao buscar mangás: " + error },
      { status: 500 }
    );
  }
}
