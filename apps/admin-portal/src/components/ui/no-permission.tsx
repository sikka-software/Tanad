import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "./alert";

const NoPermission = () => {
  const t = useTranslations();
  return (
    <div className="flex h-screen w-full items-start justify-center p-4">
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertTitle>{t("General.no_permission")}</AlertTitle>
        <AlertDescription>{t("General.no_permission_description")}</AlertDescription>
      </Alert>
    </div>
  );
};

export default NoPermission;
