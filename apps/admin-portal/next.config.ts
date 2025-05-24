import type { NextConfig } from "next";

const { version } = require("./package.json");

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 300, // Increase timeout to 5 minutes
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/profile",
        destination: "/account",
        permanent: true,
      },
    ];
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  i18n: {
    locales: ["en", "ar"],
    defaultLocale: "ar",
    localeDetection: false,
  },
  publicRuntimeConfig: { version },

  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sikka-images.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "vcbrjspzfsvzgtjndjat.supabase.co",
      },
      {
        protocol: "https",
        hostname: "chart.googleapis.com",
      },
    ],
  },
};

module.exports = nextConfig;
