import * as reactSpring from "@react-spring/three";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { useLocale, useTranslations } from "next-intl";
import { ThemeProvider } from "next-themes";

import { LoadingBar } from "../ui/loading-bar";
import { Toaster } from "../ui/sonner";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const lang = useLocale();
  const t = useTranslations();
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange enableSystem defaultTheme="dark">
      <LoadingBar />
      <Toaster
        richColors
        position={lang === "ar" ? "bottom-left" : "bottom-right"}
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={{ fontFamily: "var(--font-family)" }}
      />
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="relative flex min-h-screen flex-row items-center justify-center lg:max-w-none lg:px-0"
      >
        <div className="bg-muted absolute inset-0 hidden h-full w-full flex-col p-0 text-white lg:flex">
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
        <div className="absolute start-0 end-0 z-20 h-full p-0 lg:w-1/2">{children}</div>
        <div className="bg-background absolute z-0 h-full w-full [mask-image:linear-gradient(to_right,#D1D4DC_30%,transparent_100%)] rtl:[mask-image:linear-gradient(to_left,#D1D4DC_30%,transparent_100%)]"></div>
      </div>
    </ThemeProvider>
  );
};

export default AuthLayout;
