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
  reactStrictMode: true, // Habilita modo estrito
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros de lint no build (útil pra Docker/CI)
  },
};

export default nextConfig;
