import { useLocale, useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";

const GeneralSettings = () => {
  const t = useTranslations();
  const lang = useLocale();

  const handleInputChange = () => {
    console.log("input changed");
  };

  return (
    <Card className="shadow-none">
      <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
        <CardTitle>{t("Settings.general.title")}</CardTitle>
        <CardDescription>{t("Settings.general.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("Settings.general.profile.title")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("Settings.general.profile.name")}</Label>
              <Input id="name" defaultValue="John Doe" onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("Settings.general.profile.email")}</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john@example.com"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("Settings.general.regional.title")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">{t("Settings.general.regional.language")}</Label>
              <Select defaultValue="en" onValueChange={handleInputChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t("General.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("General.languages.en")}</SelectItem>
                  <SelectItem value="ar">{t("General.languages.ar")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t("Settings.general.regional.timezone")}</Label>
              <Select defaultValue="utc" onValueChange={handleInputChange}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder={t("General.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time (ET)</SelectItem>
                  <SelectItem value="cst">Central Time (CT)</SelectItem>
                  <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
