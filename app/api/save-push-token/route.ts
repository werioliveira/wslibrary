

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {

    const { pushToken, userId } = await request.json();

    if (!pushToken) {
      return NextResponse.json({ error: "Push token is required" }, { status: 400 });
    }
  
    try {
      // Atualiza o Discord ID do usuário autenticado
      await db.user.update({
        where: { id: userId },
        data: { pushToken },
      });
  
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error: " + error }, { status: 500 });
    }
  }
  