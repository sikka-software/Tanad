import settings from "@root/landing.config";
import { pick } from "lodash";
import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";

import { useBreakpoint } from "@/hooks/use-breakpoint";

import { ContactForm } from "@/components/landing/ContactForm";
import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import SocialIcons from "@/components/landing/SocialIcons";

export default function ContactPage() {
  const t = useTranslations();
  const lang = useLocale();
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  let size = useBreakpoint();
  let isMobile = size < 600;

  async function callApi(formData: any) {
    try {
      const response = await fetch("/api/form-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
    } catch (error) {
      console.error("Failed to fetch from the API", error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 pb-32">
      <CustomPageMeta title={t("SEO.contact.title")} description={t("SEO.contact.description")} />
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <CustomMotionDiv className="py-10 pb-0 text-5xl font-bold">
          {t("ContactPage.hero.title")}
        </CustomMotionDiv>
        <CustomMotionDiv delay={0.1} className="text-md p-0">
          {t("ContactPage.hero.subtitle")}
        </CustomMotionDiv>
      </div>
      <CustomMotionDiv delay={0.2} className="w-full max-w-lg p-4 pt-0 drop-shadow-xl md:p-2">
        <ContactForm
          onSubmit={(e) => {
            setOpenSuccessDialog(true);
            let formData = {
              name: e.name,
              email: e.email,
              content: e.message,
            };
            callApi(formData);
          }}
          size={isMobile ? "sm" : "default"}
          formId="contact-us"
          formAutoComplete="on"
          texts={{
            submit: t("General.submit"),
            email: {
              invalid: t("ContactPage.contact-form.email.invalid"),
              label: t("ContactPage.contact-form.email.label"),
              placeholder: t("ContactPage.contact-form.email.placeholder"),
              required: t("ContactPage.contact-form.email.required"),
            },
            name: {
              invalid: t("ContactPage.contact-form.name.invalid"),
              label: t("ContactPage.contact-form.name.label"),
              placeholder: t("ContactPage.contact-form.name.placeholder"),
              required: t("ContactPage.contact-form.name.required"),
            },
            message: {
              invalid: t("ContactPage.contact-form.message.invalid"),
              label: t("ContactPage.contact-form.message.label"),
              placeholder: t("ContactPage.contact-form.message.placeholder"),
              required: t("ContactPage.contact-form.message.required"),
            },
          }}
        />
      </CustomMotionDiv>
      <Dialog open={openSuccessDialog} onOpenChange={setOpenSuccessDialog}>
        <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("ContactPage.contact-form.submitted.title")}</DialogTitle>
            <DialogDescription>
              {t("ContactPage.contact-form.submitted.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex w-full flex-col gap-4 text-center md:text-start">
              <div>{t("ContactPage.contact-form.submitted.contact-methods")}</div>
              <div className="flex flex-row justify-center gap-2 md:justify-start">
                <SocialIcons {...settings.contact} />
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

ContactPage.messages = ["Pages", "General", "Contact"];

export const getStaticProps: GetStaticProps  = async ({ locale }) => {
  return {
    props: {
      messages: pick((await import(`../../locales/${locale}.json`)).default, ContactPage.messages),
    },
  };
};
