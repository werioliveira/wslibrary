import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname), // Fazendo referência ao diretório raiz
    };
    return config;
  },
  reactStrictMode: true, // Se você quiser habilitar o modo estrito
};

export default nextConfig;