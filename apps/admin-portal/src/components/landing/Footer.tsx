import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import getConfig from "next/config";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Components
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
import SocialIcons from "@/components/landing/SocialIcons";

// Utils
import { cn } from "@/lib/utils";

import settings from "../../../landing.config";

type LangType = "ar" | "en";
type FooterLinksSectionProps = {
  key?: any;
  title?: string;
  links?: FooterLinkProps[];
};
type FooterLinkProps = {
  label?: string;
  href?: string;
};

export default function Footer(props: any) {
  const t = useTranslations("Landing");
  const lang = useLocale();
  const { resolvedTheme } = useTheme();
  const { type: logoType } = settings.logoSettings;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoSrc = `https://sikka-images.s3.ap-southeast-1.amazonaws.com/products/tanad/tanad_full_logo_${
    !isMounted || resolvedTheme === "dark" ? "white" : "black"
  }${lang === "en" ? "_en" : "_ar"}.png`;

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="bg-background z-50 flex w-full flex-col items-center border-t p-0 pt-12">
      <div className="flex w-full flex-col md:flex-row">
        <div className="flex flex-col items-center p-10 pt-2 md:items-start">
          <CustomMotionDiv>
            <Link href={"/"} className="flex w-fit justify-center md:justify-start">
              <div className="flex flex-row items-center justify-center gap-2">
                <Image
                  height={512}
                  width={512}
                  loading="lazy"
                  className={"h-10 w-auto"}
                  alt={`${settings.projectName.en} Logo`}
                  src={logoSrc}
                />
                {logoType !== "full" && settings.logoSettings.showText && (
                  <div className="flex h-full items-center justify-center text-center text-2xl font-bold">
                    {settings.projectName[lang as LangType]}
                  </div>
                )}
              </div>
            </Link>
          </CustomMotionDiv>
          <CustomMotionDiv delay={0.1}>
            <div className="text-muted-foreground w-full pt-4 text-center text-sm md:text-start xl:whitespace-nowrap">
              {t("footer.tagline")}
            </div>
          </CustomMotionDiv>
          <div className="flex w-full flex-row justify-center gap-4 ps-0 pt-4 md:justify-start">
            <SocialIcons {...settings.contact} phone={""} />
          </div>
        </div>
        <div className="flex w-full flex-row flex-wrap items-start justify-start gap-0 md:justify-end lg:flex-nowrap">
          {settings.footerLinks?.map((footerLink: any, i) => (
            <FooterLinksSection {...footerLink} key={i} />
          ))}
        </div>
      </div>
      <Copyrights />
    </div>
  );
}

const FooterLinksSection = (props: FooterLinksSectionProps) => {
  const t = useTranslations("Landing");
  return (
    <div className="flex-grow p-6 text-center md:w-full md:max-w-xs md:flex-grow-0 md:text-start">
      {props.title && <div className="mb-4 font-bold">{t(`${props.title}`)}</div>}
      <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm md:items-start">
        {props.links?.map((link, i) => (
          <Link key={i} href={link.href || ""} className="w-fit">
            <div className="cursor-pointer transition-all hover:text-black hover:dark:text-white">
              {t(`${link.label}`)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Copyrights = () => {
  const t = useTranslations("General");
  const { publicRuntimeConfig } = getConfig();
  const version = publicRuntimeConfig?.version;

  return (
    <div className="bg-background flex w-full flex-col items-center justify-center p-4 px-6">
      <div className="text-muted-foreground flex w-full flex-row justify-between text-xs">
        <a href="https://sikka.sa">
          {t("sikka")} © {new Date().getFullYear()}
        </a>
        <div>v{version}</div>
      </div>
    </div>
  );
};
