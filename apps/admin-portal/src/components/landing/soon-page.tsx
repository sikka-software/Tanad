import * as reactSpring from "@react-spring/three";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { useLocale, useTranslations } from "next-intl";
import { ThemeProvider, useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

import settings from "../../../landing.config";
import { Button } from "../ui/button";
import LanguageSwitcher from "../ui/language-switcher";
import { LoadingBar } from "../ui/loading-bar";
import { Toaster } from "../ui/sonner";
import ThemeSwitcher from "../ui/theme-switcher";

const SoonLayout = () => {
  const t = useTranslations();

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
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
      <LoadingBar />
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="relative flex min-h-screen flex-row items-center justify-center lg:max-w-none lg:px-0"
      >
        <div className="absolute top-0 right-0 z-100 flex w-full flex-row items-center justify-between p-4">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <div className="bg-muted inset0 absolute h-full w-full flex-col p-0 text-white flex">
          {/* <div className="absolute inset-0 bg-zinc-900" /> */}
          <ShaderGradientCanvas className="pointer-events-none absolute inset-0">
            <ShaderGradient
              animate="on"
              brightness={1.1}
              cAzimuthAngle={180}
              cDistance={3.9}
              cPolarAngle={115}
              cameraZoom={1}
              color1="#5606FF"
              color2="#fe0022"
              enableTransition={false}
              color3="#000000"
              envPreset="city"
              // @ts-ignore
              frameRate={10}
              grain="off"
              lightType="3d"
              positionX={-0.5}
              positionY={0.1}
              positionZ={0}
              range="enabled"
              rangeEnd={40}
              rangeStart={0}
              reflection={0.1}
              rotationX={0}
              rotationY={0}
              rotationZ={235}
              shader="defaults"
              type="waterPlane"
              uAmplitude={0}
              uDensity={1.1}
              uFrequency={5.5}
              uSpeed={0.1}
              uStrength={2.4}
              uTime={0.2}
              wireframe={false}
              zoomOut={false}
              // urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1.1&cAzimuthAngle=180&cDistance=3.9&cPolarAngle=115&cameraZoom=1&color1=%235606FF&color2=%23fe0022&color3=%23000000&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&grain=off&lightType=3d&pixelDensity=1&positionX=-0.5&positionY=0.1&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=235&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.1&uFrequency=5.5&uSpeed=0.1&uStrength=2.4&uTime=0.2&wireframe=false&zoomOut=false"
            />
          </ShaderGradientCanvas>
        </div>
        <div className="absolute start-0 end-0 z-20 mx-auto my-auto max-w-md p-0">
          <div className="bg-300 mx-auto flex flex-col items-center gap-10 p-4">
            <Image
              height={512}
              width={512}
              loading="lazy"
              className={"h-10 w-auto"}
              alt={`${settings.projectName.en} Logo`}
              src={logoSrc}
            />
            <div className="flex flex-col space-y-3 w-fit">
              <Button asChild size="sm">
                <Link href="/auth#signup">
                  <span>{t("Landing.sign_up")}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth">
                  <span>{t("Landing.sign_in")}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-background absolute z-0 h-full w-full [mask-image:radial-gradient(circle_at_center,#D1D4DC_5%,transparent_100%)]"></div>
      </div>
    </ThemeProvider>
  );
};

export default SoonLayout;
