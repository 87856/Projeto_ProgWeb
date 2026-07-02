import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // domínio do Strapi em desenvolvimento
      { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
      // quando estiver em produção na Strapi Cloud:
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
