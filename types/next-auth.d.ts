import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    discordId: string; // Adicione aqui as propriedades extras
  }

  interface Session {
    user: User;
  }
}