// /api/manga/import/[shareId]/route.ts
import { getUserId } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
    const { shareId } = await params;
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mangaToImport = await db.manga.findFirst({
      where: { shareId },
    });

    if (!mangaToImport) {
      return NextResponse.json({ error: 'Shared manga not found' }, { status: 404 });
    }
    const imageUrl = await copyImageToMinio(mangaToImport.image, "capa.jpg");
    const imported = await db.manga.create({
      data: {
        name: mangaToImport.name,
        secondName: mangaToImport.secondName,
        image: imageUrl || mangaToImport.image, // fallback se a cópia falhar
        chapter: 0,
        website: mangaToImport.website,
        linkToWebsite: mangaToImport.linkToWebsite,
        status: mangaToImport.status,
        userId,
      },
    });

    return NextResponse.json(imported);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to import manga: ' + error }, { status: 500 });
  }
}

export async function copyImageToMinio(originalImageUrl: string, fileName: string): Promise<string | null> {
  try {
    const response = await fetch(originalImageUrl);
    if (!response.ok) {
      throw new Error("Erro ao baixar imagem original.");
    }

    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    const key = `capas/${uuidv4()}-${fileName}`;

    const s3 = new S3Client({
      region: "us-east-1",
      endpoint: process.env.MINIO_ENDPOINT,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true,
    });

    const uploadCommand = new PutObjectCommand({
      Bucket: "wslibrary",
      Key: key,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
    });

    await s3.send(uploadCommand);

    return `https://minio.werioliveira.shop/wslibrary/${key}`;
  } catch (err) {
    console.error("Falha ao copiar imagem para seu MinIO:", err);
    return null;
  }
}