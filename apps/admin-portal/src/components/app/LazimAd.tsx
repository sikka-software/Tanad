import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";

import { useMainStore } from "@/hooks/main.store";

export default function LazimAd() {
  const t = useTranslations();
  const { urlTooLong, setUrlTooLong } = useMainStore();
  const { theme } = useTheme();

  if (!urlTooLong) return null;
  return (
    <Card className="p- animate-in slide-in-from-bottom fixed bottom-4 left-4 z-[200] max-w-md rounded-lg border bg-white pt-4 shadow-lg transition-all dark:bg-gray-800">
      {/* <CardHeader>
        <CardTitle>{t("Editor.try_lazim.title")}</CardTitle>
      </CardHeader> */}
      <CardContent className="p-2">
        <button
          onClick={() => setUrlTooLong(false)}
          className="absolute end-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X size={15} />
        </button>
        <div className="mb-4 flex flex-col gap-2 px-2">
          <h3 className="text-lg font-semibold">{t("Editor.try_lazim.title")}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("Editor.try_lazim.description")}
          </p>
        </div>
        <Image
          src={`/assets/lazim-${theme === "dark" ? "white" : "black"}.png`}
          alt="Lazim Ad"
          className="mx-auto h-auto w-full max-w-[200px]"
          width={512}
          height={512}
        />
        <Link href="https://laz.im" target="_blank" className="mx-auto h-auto w-full max-w-[200px]">
          <Button className="mt-4 w-full">{t("Editor.try_lazim.go_to_lazim")}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
