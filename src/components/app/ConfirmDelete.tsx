import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type ConfirmDeleteLinkProps = {
  title?: string;
  item_type?: string;
  onDelete: () => void;
  onCancel: () => void;
};

const ConfirmDeleteLink = (props: ConfirmDeleteLinkProps) => {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">
          <span className="font-normal">{t("General.delete")}</span>{" "}
          {props.title && `"${props.title}"`}
        </h1>
        <p>
          {t(
            `Editor.confirm-delete-${props.item_type === "header" ? "header" : "link"}`
          )}
        </p>
      </div>
      <div className="flex flex-row gap-2">
        <Button size={"lg"} variant={"destructive"} onClick={props.onDelete}>
          {t("General.delete")}
        </Button>
        <Button size={"lg"} variant={"outline"} onClick={props.onCancel}>
          {t("General.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmDeleteLink;
