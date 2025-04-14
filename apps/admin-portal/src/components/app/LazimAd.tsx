import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";

import { useMainStore } from "@/hooks/main.store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LazimAd() {
  const t = useTranslations();
  const { urlTooLong, setUrlTooLong } = useMainStore();
  const { theme } = useTheme();

  if (!urlTooLong) return null;
  return (
    <Card className="fixed border pt-4 transition-all bottom-4 left-4 z-[200] bg-white dark:bg-gray-800 rounded-lg shadow-lg p- max-w-md animate-in slide-in-from-bottom">
      {/* <CardHeader>
        <CardTitle>{t("Editor.try_lazim.title")}</CardTitle>
      </CardHeader> */}
      <CardContent className="p-2">
        <button
          onClick={() => setUrlTooLong(false)}
          className="absolute top-4 end-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X size={15} />
        </button>
        <div className="flex flex-col gap-2 mb-4 px-2">
          <h3 className="text-lg font-semibold">
            {t("Editor.try_lazim.title")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("Editor.try_lazim.description")}
          </p>
        </div>
        <Image
          src={`/assets/lazim-${theme === "dark" ? "white" : "black"}.png`}
          alt="Lazim Ad"
          className="w-full max-w-[200px] h-auto mx-auto"
          width={512}
          height={512}
        />
        <Link
          href="https://laz.im"
          target="_blank"
          className="w-full max-w-[200px] h-auto mx-auto"
        >
          <Button className="w-full mt-4">
            {t("Editor.try_lazim.go_to_lazim")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
