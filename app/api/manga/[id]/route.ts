import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Resolve o Promise de params
    const { id } = await params; 
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const manga = await db.manga.findUnique({
        where: { id },
      });
  
      if (!manga) {
        return NextResponse.json({ error: "Manga not found" }, { status: 404 });
      }
    // Verifica se o mangá pertence ao usuário autenticado
    if (manga.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

      return NextResponse.json(manga);
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error"+ error }, { status: 500 });
    }
  }
  export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
  
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { id } = await params;
    const { chapter, name, secondName, image, linkToWebsite, status, website } = await request.json();
  
    try {
      const manga = await db.manga.findUnique({
        where: { id },
      });
  
      if (!manga) {
        return NextResponse.json({ error: "Manga not found" }, { status: 404 });
      }
  
      // Verifica se o mangá pertence ao usuário autenticado
      if (manga.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  
      // Extrai o capítulo do campo `newChapter`, caso exista
      const newChapterData = manga.newChapter as { chapter: number } | null;
      const newChapterNumber = newChapterData?.chapter || 0;
  
      // Atualiza o campo `hasNewChapter` com base na lógica
      let hasNewChapter = manga.hasNewChapter;
      if (chapter >= newChapterNumber) {
        hasNewChapter = false; // Marca como falso se o novo valor for maior ou igual ao `newChapter.chapter`
      }
  
      // Atualiza o mangá com os novos dados
      const updatedManga = await db.manga.update({
        where: { id },
        data: {
          name,
          secondName,
          image,
          linkToWebsite,
          chapter,
          status,
          website,
          hasNewChapter,
        },
      });
  
      return NextResponse.json(updatedManga);
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error: " + error }, { status: 500 });
    }
  }
  
  
  export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
  
    try {
      const manga = await db.manga.findUnique({
        where: { id },
      });
  
      if (!manga) {
        return NextResponse.json({ error: "Manga not found" }, { status: 404 });
      }
  
      // Verifica se o mangá pertence ao usuário autenticado
      if (manga.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  
      const deletedManga = await db.manga.delete({
        where: { id },
      });
  
      return NextResponse.json({
        message: "Manga deleted successfully",
        deletedManga,
      });
    } catch (error) {
      return NextResponse.json({ error: "Failed to delete manga"+error }, { status: 500 });
    }
  }
  export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { hasNewChapter } = await request.json();

    try {
      const manga = await db.manga.findUnique({
        where: { id },
      });
  
      if (!manga) {
        return NextResponse.json({ error: "Manga not found" }, { status: 404 });
      }
  
      // Verifica se o mangá pertence ao usuário autenticado
      if (manga.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
  
      const updatedManga = await db.manga.update({
        where: { id },
        data: { hasNewChapter: hasNewChapter },
      });
  
      return NextResponse.json(updatedManga);
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error"+error }, { status: 500 });
    }
  }