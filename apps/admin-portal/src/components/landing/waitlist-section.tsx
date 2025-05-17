import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import { Input } from "../ui/inputs/input";

const WaitlistSection = () => {
  const t = useTranslations();
  return (
    <div className="min-h-landing relative z-10 flex flex-1 items-center justify-center">
      <div className="mx-auto w-full max-w-xl space-y-12 p-8">
        <div className="space-y-6 text-center">
          <h2 className="bg-gradient-to-br from-gray-200 to-gray-600 bg-clip-text text-center text-4xl font-extrabold text-transparent sm:text-5xl">
            {t("Landing.waitlist.title")}
          </h2>
          <p className="mx-auto max-w-lg text-xl text-gray-400">{t("Landing.waitlist.subtitle")}</p>
        </div>

        <div className="mx-auto flex max-w-md gap-2">
          <Input
            type="email"
            placeholder={t("Landing.waitlist.placeholder")}
            className="h-12 border-gray-800 bg-gray-950/50"
          />
          <Button className="h-12 bg-black px-6 text-white hover:bg-black/90" variant="ghost">
            {t("Landing.waitlist.button")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSection;
