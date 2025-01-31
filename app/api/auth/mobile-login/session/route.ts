import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // Obtenha o token do cabeçalho Authorization
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    // Verifique e decodifique o token JWT
    const decoded = jwt.verify(token, process.env.AUTH_SECRET!);

    // Se o token for válido, retorne a informação do usuário
    return NextResponse.json({ message: 'Sessão válida', user: decoded }, { status: 200 });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json({ error: 'Token inválido ou expirado', details: errorMessage }, { status: 401 });
  }
}