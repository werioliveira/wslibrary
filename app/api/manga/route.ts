
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
      const { name, image, chapter, website, userId, linkToWebsite } = await req.json();
      const data = {
        name: name,
        image: image,
        chapter: parseInt(chapter),
        website: website,
        linkToWebsite: linkToWebsite,
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

    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: 'User ID é obrigatório' }, { status: 400 });
    }
    try{
        const mangas = await db.manga.findMany({where: {userId: userId}});
        return NextResponse.json({ mangas }, { status: 200 });
    }catch(error){
        return NextResponse.json({ message: 'Erro ao buscar mangas'+error }, { status: 500 });
    }
}