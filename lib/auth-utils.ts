import { auth } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.AUTH_SECRET!;

/**
 * Obtém o ID do usuário autenticado a partir da sessão, cookies ou token JWT no cabeçalho.
 * @param request Objeto NextRequest
 * @returns ID do usuário ou `null` se não autenticado
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  // 📌 Tenta recuperar a sessão pelo NextAuth (para Web)
  const session = await auth();
  const userId: string | null = session?.user?.id || null;

  if (userId) {
    return userId;
  }

  // 📌 Busca o token no Cookie (para Emulador e Web)
  const sessionToken = request.headers.get('cookie')?.match(/next-auth\.session-token=([^;]*)/)?.[1];

  if (sessionToken) {
    try {
      // 🔹 Primeiro tenta usar getToken do NextAuth
      const token = await getToken({ req: request, secret: JWT_SECRET });

      if (token?.sub) {
        return token.sub;
      }

      // 🔹 Se falhar, tenta decodificar manualmente
      const { payload } = await jwtVerify(sessionToken, new TextEncoder().encode(JWT_SECRET));
      if (payload?.id) {
        return payload.id as string;
      }
    } catch (error) {
      console.error('Erro ao decodificar token JWT do cookie:', error);
    }
  }

  // 📌 Busca o token no cabeçalho `Authorization` (para Dispositivo Físico)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      if (payload?.id) {
        return payload.id as string;
      }
    } catch (error) {
      console.error('Erro ao decodificar token JWT do cabeçalho Authorization:', error);
    }
  }

  return null; // Nenhum usuário autenticado encontrado
}
