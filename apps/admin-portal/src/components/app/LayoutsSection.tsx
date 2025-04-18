import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
// UI
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface LayoutsSectionProps {
  selectedLayout: "1-col" | "2-col" | "3-col";
  handleUpdateLayout: (layout: "1-col" | "2-col" | "3-col") => Promise<void>;
  isUpdating: boolean;
}

export function LayoutsSection({
  selectedLayout,
  handleUpdateLayout,
  isUpdating,
}: LayoutsSectionProps) {
  const t = useTranslations();

  return (
    <>
      <Separator className="my-2" />
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant={selectedLayout === "1-col" ? "default" : "outline"}
          className="w-full"
          onClick={() => handleUpdateLayout("1-col")}
          disabled={isUpdating}
        >
          1 {t("Theme.column")}
        </Button>
        <Button
          variant={selectedLayout === "2-col" ? "default" : "outline"}
          className="w-full"
          onClick={() => handleUpdateLayout("2-col")}
          disabled={isUpdating}
        >
          2 {t("Theme.columns")}
        </Button>
        <Button
          variant={selectedLayout === "3-col" ? "default" : "outline"}
          className="w-full"
          onClick={() => handleUpdateLayout("3-col")}
          disabled={isUpdating}
        >
          3 {t("Theme.columns")}
        </Button>
      </div>
      {isUpdating && (
        <div className="flex justify-center mt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </>
  );
}
