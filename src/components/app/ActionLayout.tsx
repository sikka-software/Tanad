import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/router";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { LinkLayoutType } from "@/lib/types";
import { useMainStore } from "@/hooks/main.store";
import { usePuklaStore } from "@/hooks/use-pukla-store";
import useUserStore from "@/hooks/use-user-store";

import { Button } from "@/components/ui/button";

interface ActionLayoutProps {
  linkId: string;
  puklaId: string;
  onUpgradeNeeded?: () => void;
}

const ActionLayout = ({
  linkId,
  puklaId,
  onUpgradeNeeded,
}: ActionLayoutProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { setItemAction } = useMainStore();
  const { puklaItems } = usePuklaStore();
  const { user } = useUserStore();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Find the current item's layout from puklaItems
  const currentItem = puklaItems.find((item) => item.id === linkId);
  const [selectedLayout, setSelectedLayout] = useState<LinkLayoutType>(
    currentItem?.item_layout || "default"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (user?.subscribed_to === "pukla_free") {
      onUpgradeNeeded?.();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("pukla_links")
        .update({ item_layout: selectedLayout })
        .eq("id", linkId)
        .eq("pukla_id", puklaId);

      if (error) throw error;

      // Update the item in the store
      usePuklaStore.setState((state) => ({
        puklaItems: state.puklaItems.map((item) =>
          item.id === linkId ? { ...item, item_layout: selectedLayout } : item
        ),
      }));

      toast.success(t("Editor.layout_updated_successfully"));
      setItemAction(linkId, null); // Close the layout editor
    } catch (error) {
      console.error("Error updating layout:", error);
      toast.error(t("Editor.failed_to_update_layout"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = () => {
    router.push("/billing");
  };

  const PreviewButton = ({
    isHighlighted,
    className,
  }: {
    isHighlighted: boolean;
    className?: string;
  }) => (
    <div
      className={cn(
        "w-full rounded-md transition-all pointer-events-none",
        className,
        isHighlighted ? "bg-primary/20" : "bg-primary/5"
      )}
    />
  );

  const layoutOptions: {
    id: LinkLayoutType;
    name: string;
    preview: React.ReactNode;
  }[] = [
    {
      id: "default",
      name: t("Editor.default_layout"),
      preview: (
        <div className="w-full h-24 flex flex-col gap-2">
          <PreviewButton isHighlighted={false} className="h-6" />
          <PreviewButton isHighlighted={true} className="h-6" />
          <PreviewButton isHighlighted={false} className="h-6" />
        </div>
      ),
    },
    {
      id: "double-height",
      name: t("Editor.double_height_layout"),
      preview: (
        <div className="w-full h-24 flex flex-col gap-2">
          <PreviewButton isHighlighted={false} className="h-5" />
          <PreviewButton isHighlighted={true} className="h-14" />
          <PreviewButton isHighlighted={false} className="h-5" />
        </div>
      ),
    },
    {
      id: "half-width",
      name: t("Editor.half_width_layout"),
      preview: (
        <div className="w-full h-24 flex flex-col gap-2">
          <PreviewButton isHighlighted={false} className="h-6" />
          <div className="flex gap-2">
            <PreviewButton isHighlighted={true} className="h-6 w-1/2" />
            <div className="w-1/2 h-6 border border-dashed border-primary/20 rounded-md" />
          </div>
          <PreviewButton isHighlighted={false} className="h-6" />
        </div>
      ),
    },
    {
      id: "square",
      name: t("Editor.square_layout"),
      preview: (
        <div className="w-full h-24 flex flex-col gap-2">
          <PreviewButton isHighlighted={false} className="h-5" />
          <div className="flex gap-2">
            <PreviewButton isHighlighted={true} className="h-14 w-1/2" />
            <div className="w-1/2 h-14 border border-dashed border-primary/20 rounded-md" />
          </div>
          <PreviewButton isHighlighted={false} className="h-5" />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <span>{t("Editor.change_layout")}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {layoutOptions.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              role="radio"
              aria-checked={selectedLayout === layout.id}
              aria-label={layout.name}
              tabIndex={0}
              className={cn(
                "w-full p-3 rounded-lg border-2 transition-all cursor-pointer",
                "hover:border-primary/50 hover:bg-primary/5",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                selectedLayout === layout.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              {layout.preview}
              <span className="text-xs mt-2 block font-medium pointer-events-none">
                {layout.name}
              </span>
            </button>
          ))}
        </div>
        <Button
          variant="default"
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? t("General.saving") : t("Editor.save")}
        </Button>
      </div>
    </>
  );
};

export default ActionLayout;
