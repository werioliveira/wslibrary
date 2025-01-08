import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { fileName, mangaId, fileContent } = await req.json();

    if (!fileName || !mangaId || !fileContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
 
    const key = `capas/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: "wslibrary", // Substitua pelo nome correto do bucket
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg", // Altere se necessário
      ACL: "public-read", // Garante que o arquivo seja público
    });

    await s3.send(command);

    const imageUrl = `https://minio.werioliveira.shop/wslibrary/${key}`;
    await db.manga.update({
      where: { id: mangaId },
      data: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
