/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        "pg-native": false,
      };
    }

    if (isServer) {
      config.externals = [...(config.externals || []), "cloudflare:sockets"];
    }

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api-inference.huggingface.co",
      },
      // Закомментировано, так как функциональность генерации изображений отключена
      // ПРИМІТКА: Розкоментуйте цей блок при реалізації генерації зображень через fal.ai
      /*
      {
        protocol: "https",
        hostname: "v3.fal.media",
      },
      */
    ],
  },

  env: {
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    // Закомментировано, так как функциональность генерации изображений отключена
    // FAL_KEY: process.env.FAL_KEY,
  },

  transpilePackages: ["pg"],
};

export default nextConfig;
