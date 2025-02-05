import { db } from "@/lib/db";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MangaStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
function isBase64(str: string) {
  console.log("is base64")
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(str) && (str.length % 4 === 0);
}
export async function POST(req: NextRequest) {
  try {
    const { name, secondName, image, chapter, website, userId, linkToWebsite, status } =  
    await req.json();

    let imageUpload = image;
      if(image && isBase64(image)){
        const buffer = Buffer.from(image, "base64");
        const accessKeyId = process.env.MINIO_ACCESS_KEY;
        const secretAccessKey = process.env.MINIO_SECRET_KEY;
  
        if (!accessKeyId || !secretAccessKey) {
          return NextResponse.json({ error: "Missing S3 credentials" }, { status: 500 });
        }
  
        const s3 = new S3Client({
          region: "us-east-1",
          endpoint: process.env.MINIO_ENDPOINT,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
          forcePathStyle: true,
        });
       
        const key = `capas/${uuidv4()}-${image}`;
  
        const command = new PutObjectCommand({
          Bucket: "wslibrary", // Substitua pelo nome correto do bucket
          Key: key,
          Body: buffer,
          ContentType: "image/jpeg", // Altere se necessário
          ACL: "public-read", // Garante que o arquivo seja público
        });
  
        await s3.send(command);
        
        imageUpload = `https://minio.werioliveira.shop/wslibrary/${key}`;
        console.log(imageUpload)
      }
    const data = {
      name: name,
      secondName: secondName,
      image: imageUpload,
      chapter: parseInt(chapter),
      website: website,
      linkToWebsite: linkToWebsite,
      status: status,
      userId: userId,
    };
    console.log(data)
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

  // Adiciona filtro pelo nome ou pelo secondName, se fornecido
  if (name) {
    where.OR = [
      {
        name: {
          contains: name, // Busca parcialmente no campo `name`
          mode: "insensitive", // Ignora maiúsculas/minúsculas
        },
      },
      {
        secondName: {
          contains: name, // Busca parcialmente no campo `secondName`
          mode: "insensitive", // Ignora maiúsculas/minúsculas
        },
      },
    ];
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
