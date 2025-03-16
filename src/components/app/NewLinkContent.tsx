import React from "react";
import { ChevronLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
// UI
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// Components
import { EmbedYoutube } from "@/components/link-types/EmbedYoutube";
import { RegularLink } from "@/components/link-types/RegularLink";
import { NewHeader } from "@/components/link-types/NewHeader";
import { NewDeliveryAppLink } from "@/components/app/NewDeliveryAppLink";
// Types
import { LinkTypes } from "@/lib/types";

type NewLinkContentType = {
  newLinkType: LinkTypes;
  puklaId: string;
  title?: string;
  onBack: () => void;
};

export const NewLinkContent: React.FC<NewLinkContentType> = ({
  newLinkType,
  puklaId,
  onBack,
  title,
}) => {
  const t = useTranslations();
  const lang = useLocale();

  const renderContent = () => {
    switch (newLinkType) {
      case "link":
        return <RegularLink puklaId={puklaId} />;
      case "header":
        return <NewHeader puklaId={puklaId} />;
      case "youtube":
        return <EmbedYoutube />;
      case "delivery-apps":
        return <NewDeliveryAppLink />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-4 mb-2">
        <Button onClick={onBack} variant={"ghost"} size={"icon"}>
          <ChevronLeft className={lang === "ar" ? "rotate-180" : ""} />
        </Button>
        <div>{title}</div>
      </div>
      <Separator />
      <div className="p-4">{renderContent()}</div>
    </div>
  );
};
