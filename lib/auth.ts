import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { saltAndHashPassword } from "@/lib/utils"
import bcrypt from "bcryptjs"

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',  // Usando JWT para a sessão
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password)
          return null;

        const email = credentials.email as string;
        const hash = saltAndHashPassword(credentials.password as string);

        let user: any = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new Error("User not found");
        } else {
          const isMatch = bcrypt.compareSync(credentials.password as string, user.hashedPassword);
          if (!isMatch) throw new Error("Invalid credentials");
        }
        // Retorna o usuário com o campo `role` para ser incluído na sessão
        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.picture as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  }
});
