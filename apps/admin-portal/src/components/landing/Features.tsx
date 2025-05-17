import { BarChart3, Sparkle, Paintbrush, MonitorSmartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { BentoCard, BentoGrid } from "@/ui/bento-grid";
import { Marquee } from "@/ui/marquee";

import { FakeChart } from "@/components/landing/FakeChart";
import ThumbnailImage from "@/components/landing/ThumbnailImage";

import { cn, appIcons1, appIcons2, appIcons3, appIcons4, thumbnails } from "@/lib/utils";

export default function Features() {
  const t = useTranslations();

  const features = [
    {
      name: t("Landing.feature-highlight-1.title"),
      description: t("Landing.feature-highlight-1.subtitle"),
      icon: Paintbrush,
      className: "col-span-2 md:col-span-2 lg:col-span-2",
      cta: t("General.get_started"),
      goto: "/dashboard",
      background: (
        <Marquee
          dir="ltr"
          pauseOnHover={false}
          className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] [--duration:20s]"
        >
          {thumbnails.map((thumb, i) => {
            return (
              <ThumbnailImage
                skeletonClassname="absolute start-0 top-0 z-50 h-[258px] w-[150px]"
                key={i}
                src={thumb}
                width={150}
                height={258}
                priority={i < 4}
                imageClassname="h-[258px] w-[150px] object-cover"
                alt={`Thumbnail ${i}`}
              />
            );
          })}
        </Marquee>
      ),
    },
    {
      name: t("Landing.feature-highlight-2.title"),
      description: t("Landing.feature-highlight-2.subtitle"),
      icon: Sparkle,
      className: "col-span-2 md:col-span-2 lg:col-span-2",
      cta: t("General.get_started"),
      background: (
        <div
          dir="ltr"
          className="absolute top-0 flex flex-col gap-0 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]"
        >
          <Marquee pauseOnHover={false}>
            {appIcons1.map((thumb, i) => {
              return (
                <ThumbnailImage
                  key={i}
                  height={40}
                  width={40}
                  alt={`Thumbnail ${i}`}
                  imageClassname="contrast-0 h-10 w-10 object-contain"
                  src={`https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-${thumb.name}.png`}
                />
              );
            })}
          </Marquee>
          <Marquee reverse pauseOnHover={false}>
            {appIcons2.map((thumb, i) => {
              return (
                <ThumbnailImage
                  key={i}
                  height={40}
                  width={thumb.size === "square" ? 40 : 40}
                  imageClassname="contrast-0 h-10 w-10 object-contain"
                  src={`https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-${thumb.name}.png`}
                  alt={`Thumbnail ${i}`}
                />
              );
            })}
          </Marquee>
          <Marquee pauseOnHover={false} className="[--duration:30s]">
            {appIcons3.map((thumb, i) => {
              return (
                <ThumbnailImage
                  imageClassname="contrast-0 h-10 w-auto"
                  key={i}
                  height={50}
                  width={70}
                  src={`https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-${thumb.name}.png`}
                  alt={`Thumbnail ${i}`}
                />
              );
            })}
          </Marquee>
          <Marquee reverse pauseOnHover={false} className="[--duration:30s]">
            {appIcons4.map((thumb, i) => {
              return (
                <ThumbnailImage
                  imageClassname="contrast-0 h-10 w-auto"
                  key={i}
                  height={50}
                  width={70}
                  src={`https://sikka-images.s3.ap-southeast-1.amazonaws.com/platforms/logo-${thumb.name}.png`}
                  alt={`Thumbnail ${i}`}
                />
              );
            })}
          </Marquee>
        </div>
      ),
      goto: "/dashboard",
    },
    {
      name: t("Features.feature-6.title"),
      description: t("Features.feature-6.description"),
      icon: MonitorSmartphone,
      className: "col-span-2 md:col-span-2 lg:col-span-2",
      cta: t("General.get_started"),
      goto: "/dashboard",
    },
    {
      name: t("Features.feature-7.title"),
      description: t("Features.feature-7.description"),
      icon: BarChart3,
      className: "col-span-2 md:col-span-2 lg:col-span-2",
      cta: t("General.get_started"),
      background: (
        <div className="absolute top-10 h-[300px] w-full [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]">
          <FakeChart />
        </div>
      ),
      goto: "/analytics",
    },
  ];

  return (
    <div className="bg-background relative py-24 pt-0 sm:py-32" id="features">
      <div className="z-[100] mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-primary text-base leading-7 font-semibold">{t("Features.title")}</h2>
          <p className="text-primary mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("Features.subtitle")}
          </p>
        </div>
        <div className="mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <BentoGrid className="grid-cols-1 md:grid-cols-4 lg:grid-rows-2">
            {features.map((feature) => (
              <BentoCard
                className={cn(feature.className, "z-10 min-h-[350px] dark:!border-white/20")}
                cta={feature.cta}
                href={feature.goto}
                background={feature.background}
                key={feature.name}
                name={feature.name}
                description={feature.description}
                Icon={feature.icon}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </div>
  );
}
