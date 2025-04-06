import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
    try {
      const manga = await db.manga.findFirst({
        where: { shareId },
        select: {
          name: true,
          secondName: true,
          image: true,
          chapter: true,
          website: true,
          linkToWebsite: true,
          status: true,
          newChapter: true,
        },
      });
  
      if (!manga) {
        return NextResponse.json({ error: 'Shared manga not found' }, { status: 404 });
      }
  
      return NextResponse.json(manga);
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }