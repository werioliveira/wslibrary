import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    const session = await auth();
  
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const { discordId } = await request.json();
  
    if (!discordId) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 });
    }
  
    try {
      // Atualiza o Discord ID do usuário autenticado
      const updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: { discordId },
      });
  
      return NextResponse.json({ message: "Discord ID updated successfully", user: updatedUser });
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error: " + error }, { status: 500 });
    }
  }
  