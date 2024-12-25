import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import type { Adapter } from 'next-auth/adapters';

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: 'jwt',  // Usando JWT para a sessão
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {

          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.picture as string;
        session.user.id = token.sub as string;
        session.user.discordId = token.discordId as string;
      }
      return session;
    },
    async jwt({ token, user, account, session, trigger }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id; // Adiciona o ID do usuário ao token
        token.discordId = user.discordId; // Adiciona o Discord ID do usuário ao token
      }
      if (trigger === 'update') {
        return {
           ...token,
           ...session
         };
     }
      return token;
    },
  }
});
