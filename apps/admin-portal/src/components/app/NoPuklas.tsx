import { useTranslations } from "next-intl";

import { Button } from "@/ui/button";
// UI
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";

const NoPuklas = ({ onCreate }: { onCreate: () => void }) => {
  const t = useTranslations();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">{t("MyPuklas.no_puklas_found")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">{t("MyPuklas.start_creating_a_pukla")}</p>
        </div>
        <Button className="w-fit" onClick={onCreate}>
          {t("MyPuklas.create_pukla")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoPuklas;
