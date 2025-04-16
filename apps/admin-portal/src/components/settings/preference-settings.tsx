import { useLocale, useTranslations } from "next-intl";

import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { SelectContent } from "../ui/select";
import { SelectValue } from "../ui/select";
import { SelectTrigger } from "../ui/select";
import { Select } from "../ui/select";
import { SelectItem } from "../ui/select";
import { Separator } from "../ui/separator";

const PreferenceSettings = () => {
  const lang = useLocale();
  const t = useTranslations();

  const handleInputChange = (value: string) => {
    console.log("Input changed:", value);
  };
  return (
    <Card className="shadow-none">
      <CardHeader dir={lang === "ar" ? "rtl" : "ltr"}>
        <CardTitle>{t("Settings.preferences.title")}</CardTitle>
        <CardDescription>{t("Settings.preferences.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("Settings.preferences.default.title")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">{t("Settings.preferences.default.currency")}</Label>
              <Select defaultValue="usd" onValueChange={handleInputChange}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder={t("General.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="jpy">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar">{t("Settings.preferences.default.calendar")}</Label>
              <Select defaultValue="month" onValueChange={handleInputChange}>
                <SelectTrigger id="calendar">
                  <SelectValue placeholder={t("General.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("Settings.preferences.datetime.title")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-format">{t("Settings.preferences.datetime.date_format")}</Label>
              <Select defaultValue="mdy" onValueChange={handleInputChange}>
                <SelectTrigger id="date-format">
                  <SelectValue placeholder={t("General.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-format">{t("Settings.preferences.datetime.time_format")}</Label>
              <Select defaultValue="12h" onValueChange={handleInputChange}>
                <SelectTrigger id="time-format">
                  <SelectValue placeholder={t("General.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">{t("Settings.preferences.datetime.12h")}</SelectItem>
                  <SelectItem value="24h">{t("Settings.preferences.datetime.24h")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferenceSettings;
