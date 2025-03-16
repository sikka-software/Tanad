import type { NextConfig } from "next";
import createMDX from "@next/mdx";
const { version } = require("./package.json");

const nextConfig: NextConfig = {
  // output: "standalone",
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
    locales: ["en", "ar"], // Add your supported locales
    defaultLocale: "ar", // Set your default locale
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
        hostname: "klssrjyuytbctygegsqt.supabase.co",
      },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
