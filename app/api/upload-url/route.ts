
import { getUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileName, mangaId, fileContent } = await req.json();

    if (!fileName || !mangaId || !fileContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Recupera a imagem antiga do mangá
    const manga = await db.manga.findUnique({
      where: { id: mangaId },
      select: { image: true },
    });

    // Converte o conteúdo do arquivo de base64 para Buffer
    const buffer = Buffer.from(fileContent, "base64");

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

    // Gera o novo caminho do arquivo
    const key = `capas/${uuidv4()}-${fileName}`;

    // Comando para upload
    const uploadCommand = new PutObjectCommand({
      Bucket: "wslibrary", // Substitua pelo nome correto do bucket
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg", // Altere se necessário
      ACL: "public-read", // Garante que o arquivo seja público
    });

    await s3.send(uploadCommand);

    const imageUrl = `https://minio.werioliveira.shop/wslibrary/${key}`;

    // Atualiza a imagem no banco de dados
    await db.manga.update({
      where: { id: mangaId },
      data: { image: imageUrl },
    });

    // Se existir uma imagem antiga, excluí-la
    if (manga?.image) {
      const oldKey = manga.image.split("/").slice(-2).join("/"); // Extrai `capas/arquivo.jpg`

      const deleteCommand = new DeleteObjectCommand({
        Bucket: "wslibrary",
        Key: oldKey,
      });

      await s3.send(deleteCommand);
    }

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
