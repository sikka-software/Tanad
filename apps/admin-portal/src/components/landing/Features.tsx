import { useTranslations } from "next-intl";
import {
  BarChart3,
  Sparkle,
  Paintbrush,
  MonitorSmartphone,
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/ui/bento-grid";
import { FakeChart } from "@/components/landing/FakeChart";
import { Marquee } from "@/ui/marquee";
import ThumbnailImage from "@/components/landing/ThumbnailImage";
import {
  cn,
  appIcons1,
  appIcons2,
  appIcons3,
  appIcons4,
  thumbnails,
} from "@/lib/utils";

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
          className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] "
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
          className="flex  absolute top-0 flex-col gap-0 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]"
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
        <div className="h-[300px] w-full absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]">
          <FakeChart />
        </div>
      ),
      goto: "/analytics",
    },
  ];

  return (
    <div className="relative py-24 pt-0 sm:py-32 bg-background" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 z-[100]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            {t("Features.title")}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("Features.subtitle")}
          </p>
        </div>
        <div className="mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <BentoGrid className="lg:grid-rows-2 md:grid-cols-4 grid-cols-1">
            {features.map((feature) => (
              <BentoCard
                className={cn(
                  feature.className,
                  "z-10 dark:!border-white/20 min-h-[350px] ",
                )}
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
