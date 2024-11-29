import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
  
    try {
      const manga = await db.manga.findUnique({
        where: { id },
      });
  
      if (!manga) {
        return NextResponse.json({ error: "Manga not found" }, { status: 404 });
      }
  
      return NextResponse.json(manga);
    } catch (error) {
      console.error("Error fetching manga:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
    const { chapter } = await request.json();
  
    try {
      const updatedManga = await db.manga.update({
        where: { id },
        data: { chapter },
      });
  
      return NextResponse.json(updatedManga);
    } catch (error) {
      console.error("Error updating manga:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  } 
  
  export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const { id } = await params;
  
    try {
      // Deletar o mangá com o ID fornecido
      const deletedManga = await db.manga.delete({
        where: { id },
      });
  
      return NextResponse.json({
        message: "Manga deleted successfully",
        deletedManga,
      });
    } catch (error: any) {
      console.error("Error deleting manga:", error);
      return NextResponse.json(
        { error: "Failed to delete manga" },
        { status: 500 }
      );
    }
  }