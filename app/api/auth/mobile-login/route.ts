import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // Verifica e valida o token do Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 400 });

    const { sub, email, name, picture } = payload;

    // Buscar ou criar usuário no banco de dados
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: {
          id: sub,
          email,
          name,
          image: picture,
        },
      });
    }

    // Criar um token JWT de sessão
    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, image: user.image },
      process.env.AUTH_SECRET!
    );

    return NextResponse.json({ token: sessionToken, user });
  } catch (error) {
    return NextResponse.json({ error: "Erro no login" +error }, { status: 500 });
  }
}
