import { ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/button";

export const SharingStage = (props: { puklaName: string }) => {
  const t = useTranslations();
  const lang = useLocale();

  const translationActionText = t("Share.shared_content", {
    puklaName: props.puklaName,
  });
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    translationActionText
  )}`;
  const linkedinLink = `https://www.linkedin.com/sharing/share-offsite/?url=https://puk.la/${props.puklaName}`;
  const facebookLink = `https://www.facebook.com/sharer.php?u=https://puk.la/${props.puklaName}`;
  const snapchatLink = `https://www.snapchat.com/scan?attachmentUrl=https://puk.la/${props.puklaName}`;
  const whatsappLink = `https://api.whatsapp.com/send/?text=${encodeURIComponent(
    translationActionText
  )}`;
  const mailLink = `mailto:?subject=Check%20out%20my%20Pukla!&body=${encodeURIComponent(
    translationActionText
  )}`;

  return (
    <div className="flex flex-col gap-2" dir={lang === "ar" ? "rtl" : "ltr"}>
      <ShareViaPlatformButton
        title={t("Share.twitter")}
        handleClick={() => window.open(twitterLink, "_blank")}
      />
      <ShareViaPlatformButton
        title={t("Share.snapchat")}
        handleClick={() =>
          window.open(snapchatLink, "SnapchatShare", "width=600,height=600")
        }
      />
      <ShareViaPlatformButton
        title={t("Share.whatsapp")}
        handleClick={() => window.open(whatsappLink, "_blank")}
      />
      <ShareViaPlatformButton
        title={t("Share.mail")}
        handleClick={() => window.open(mailLink, "_blank")}
      />
      <ShareViaPlatformButton
        title={t("Share.linkedin")}
        handleClick={() => window.open(linkedinLink, "_blank")}
      />
      <ShareViaPlatformButton
        title={t("Share.facebook")}
        handleClick={() => window.open(facebookLink, "_blank")}
      />
      {/* <ShareViaPlatformButton title={t("share-via.instagram")} /> */}
      <ShareViaPlatformButton
        title={t("Share.more-options")}
        handleClick={() => {
          if (navigator.share) {
            navigator
              .share({
                title: "Pukla",
                text: "Here's my updated Pukla",
                url: `${
                  process.env.NEXT_PUBLIC_PUKLA_PORTAL || "https://puk.la"
                }/${props.puklaName}`,
              })
              .then(() => console.log("Successful share"))
              .catch((error) => console.log("Error sharing:", error));
          } else {
            console.log("Web Share API is not supported in your browser.");
          }
        }}
      />
    </div>
  );
};

const ShareViaPlatformButton = (props: {
  handleClick?: () => void;
  title?: string;
}) => {
  const lang = useLocale();
  return (
    <Button
      onClick={props.handleClick}
      variant="ghost"
      autoFocus={false}
      className="text-start min-h-10 h-12 flex flex-row justify-between"
    >
      <span>{props.title}</span>{" "}
      <ChevronRight className={lang === "ar" ? "rotate-180" : ""} />
    </Button>
  );
};
