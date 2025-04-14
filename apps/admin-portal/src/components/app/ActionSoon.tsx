import { useTranslations } from "next-intl";

const ActionSoon = () => {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-muted-foreground text-center">{t("General.coming_soon")}</p>
    </div>
  );
};

export default ActionSoon;
