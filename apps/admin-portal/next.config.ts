import type { NextConfig } from "next";

const { version } = require("./package.json");
const { i18n } = require("./next-i18next.config");

const nextConfig: NextConfig = {
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
  i18n,
  // i18n: {
  //   locales: ["en", "ar"],
  //   defaultLocale: "ar",
  //   localeDetection: false,
  // },
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
    ],
  },
};

module.exports = nextConfig;
