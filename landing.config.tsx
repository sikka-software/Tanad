import {
  BarChart3,
  Brush,
  Hash,
  HelpCircle,
  QrCode,
  SearchCheck,
  ShieldCheck,
  ShoppingCart,
  TabletSmartphone,
} from "lucide-react";

import { ContactSettings } from "@/lib/types";

const settings: settingsProps = {
  navigation: { withRegister: true, withLogin: true, fullWidth: true },
  projectName: { ar: "سند", en: "Sanad" },
  languages: ["ar", "en"],
  billingCycles: ["monthly", "annually"],
  billingCurrencies: ["sar", "usd"],
  usedByLogos: [
    { src: `/assets/pukla-logo-full-black.png`, name: "Company 1" },
    { src: `/assets/pukla-logo-full-purple.png`, name: "Company 2" },
    { src: `/assets/pukla-logo-full-green.png`, name: "Company 3" },
    { src: `/assets/pukla-logo-full-white.png`, name: "Company 4" },
    { src: `/assets/pukla-logo-full-black.png`, name: "Company 1" },
    { src: `/assets/pukla-logo-full-purple.png`, name: "Company 2" },
    { src: `/assets/pukla-logo-full-green.png`, name: "Company 3" },
    { src: `/assets/pukla-logo-full-white.png`, name: "Company 4" },
  ],
  paths: {
    login: `${process.env.NEXT_PUBLIC_USER_PORTAL}/login`,
    register: `${process.env.NEXT_PUBLIC_USER_PORTAL}/register`,
  },
  contact: {
    whatsapp: "https://wa.me/966531045453",
    twitter: "https://twitter.com/pukla_app",
    instagram: "https://instagram.com/pukla_app",
    mail: "pukla@sikka.io",
    phone: "+966531045453",
  },
  footerLinks: [
    {
      title: "resources",
      links: [
        { label: "help", href: "/help" },
        { label: "pricing", href: "/pricing" },
        // { label: "blog", href: "/blog" },
        // { label: "support", href: "/support" }
      ],
    },
    {
      title: "company",
      links: [
        // { label: "about", href: "/about" },
        { label: "features", href: "/features" },
        { label: "contact", href: "/contact" },
      ],
    },
    {
      title: "legal",
      links: [
        { label: "privacy", href: "/privacy" },
        { label: "tos", href: "/terms" },
        // { label: "cookie-preferences", href: "/cookies" }
      ],
    },
  ],
  logoSettings: {
    type: "full",
    showText: true,
    assets: {
      full: {
        ar: {
          light:
            "https://sikka-images.s3.ap-southeast-1.amazonaws.com/pukla/pukla-logo-full-purple.png",
          dark: "https://sikka-images.s3.ap-southeast-1.amazonaws.com/app-logos/pukla/pukla-logo-full-green.png",
        },
        en: {
          light:
            "https://sikka-images.s3.ap-southeast-1.amazonaws.com/pukla/pukla-logo-full-purple-en.png",
          dark: "https://sikka-images.s3.ap-southeast-1.amazonaws.com/pukla/pukla-logo-full-green-en.png",
        },
      },
      symbol: {
        light:
          "https://sikka-images.s3.ap-southeast-1.amazonaws.com/pukla/pukla-logo-symbol-purple.png",
        dark: "https://sikka-images.s3.ap-southeast-1.amazonaws.com/pukla/pukla-logo-symbol-green.png",
      },
    },
  },
  features: [
    {
      icon: <Brush />,
      title: "feature-1.title",
      description: "feature-1.description",
    },
    {
      icon: <Hash />,
      title: "feature-2.title",
      description: "feature-2.description",
    },
    {
      icon: <SearchCheck />,
      title: "feature-3.title",
      description: "feature-3.description",
    },
    {
      icon: <ShieldCheck />,
      title: "feature-4.title",
      description: "feature-4.description",
    },
    {
      icon: <HelpCircle />,
      title: "feature-5.title",
      description: "feature-5.description",
    },
    {
      icon: <TabletSmartphone />,
      title: "feature-6.title",
      description: "feature-6.description",
    },
    {
      icon: <BarChart3 />,
      title: "feature-7.title",
      description: "feature-7.description",
    },
    {
      icon: <QrCode />,
      title: "feature-8.title",
      description: "feature-8.description",
    },
    // {
    //   icon: <ShoppingCart />,
    //   title: "feature-9.title",
    //   description: "feature-9.description",
    //   soon: true,
    // },
  ],
};

type settingsProps = {
  navigation: {
    withRegister?: boolean;
    withLogin?: boolean;
    fullWidth?: boolean;
  };
  projectName: { ar?: string; en?: string };
  billingCycles: string[];
  billingCurrencies: string[];
  languages: string[];
  paths: { login: string; register: string };
  usedByLogos: { src: string; name: string }[];
  contact: ContactSettings;
  features: singleFeature[];
  footerLinks?: footerLinksSection[];
  navbarLinks?: any;
  logoSettings: {
    type: "full" | "symbol";
    showText?: boolean;
    assets: {
      full: {
        ar: { light: string; dark: string };
        en: { light: string; dark: string };
      };
      symbol: {
        light: string;
        dark: string;
      };
    };
  };
};
// type metaProps = {
//   title?: string;
//   description?: string;
//   image?: string;
//   url?: string;
//   keywords?: string;
//   author?: string;
//   type?: string;
//   siteName?: string;
//   locale?: string;
//   twitterCard?: string;
//   twitterSite?: string;
//   twitterCreator?: string;
//   twitterTitle?: string;
//   twitterDescription?: string;
//   twitterImage?: string;
//   ogTitle?: string;
//   ogDescription?: string;
//   ogImage?: string;
//   ogType?: string;
//   ogSiteName?: string;
//   ogLocale?: string;
//   fbAppId?: string;
//   fbTitle?: string;
//   fbDescription?: string;
//   fbImage?: string;
//   fbType?: string;
//   fbSiteName?: string;
//   fbLocale?: string;
// };
type singleFeature = {
  icon?: any;
  title: string;
  description: string;
  soon?: boolean;
};
type footerLinksSection = {
  title?: string;
  links: { label: string; href: string }[];
};

export default settings;
