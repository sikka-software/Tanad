import React from "react";
import { useTranslations } from "next-intl";
import { ClipboardEdit, File, Link, Youtube } from "lucide-react";
// Components
import { LinkTypeButton } from "@/components/app/LinkTypeButton";
// UI
import BikeIcon from "@/components/ui/bike-icon";

type NewLinkTypesType = {
  onTypeSelected: (type: string) => void;
};

export const NewLinkTypes: React.FC<NewLinkTypesType> = ({
  onTypeSelected,
}) => {
  const t = useTranslations();
  const linkOptions = [
    { type: "link", icon: <Link />, name: t("Editor.add-link") },
    {
      type: "delivery-apps",
      icon: <BikeIcon className="size-6" />,
      name: t("Editor.delivery-apps"),
    },
    {
      type: "youtube",
      icon: <Youtube />,
      name: t("Editor.embed-video"),
      soon: true,
    },
    {
      type: "document",
      icon: <File />,
      name: t("Editor.document"),
      soon: true,
    },
    {
      type: "form",
      icon: <ClipboardEdit />,
      name: t("Editor.form"),
      soon: true,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 p-4">
      {linkOptions.map((linkType) => (
        <LinkTypeButton
          key={linkType.type}
          onSelect={() => onTypeSelected(linkType.type)}
          icon={linkType.icon}
          name={linkType.name}
          soon={linkType.soon}
        />
      ))}
    </div>
  );
};
