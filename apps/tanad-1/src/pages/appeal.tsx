import { useState } from "react";
import { useForm } from "react-hook-form";

// Hooks
import { GetStaticProps } from "next";
import { useLocale, useTranslations } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
// Components
import CustomPageMeta from "@/components/landing/CustomPageMeta";
// UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AppealPage() {
  const t = useTranslations();
  const lang = useLocale();
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  let formSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z
      .string({ required_error: t("AppealPage.email.required") })
      .min(1, { message: t("AppealPage.email.required") })
      .email({ message: t("AppealPage.email.invalid") })
      .optional(),
    pukla_link: z
      .string({ required_error: t("AppealPage.pukla-link.required") })
      .min(1, { message: t("AppealPage.pukla-link.required") }),
    comments: z
      .string({ required_error: t("AppealPage.additional-comments.required") })
      .min(10, { message: t("AppealPage.additional-comments.too-short") }),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      comments: "",
      pukla_link: "",
    },
  });
  async function callApi(formData: any) {
    try {
      const response = await fetch("/api/form-appeal", {
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
  const submitReport = (e: any) => {
    setOpenSuccessDialog(true);
    let formData = {
      first_name: e.first_name,
      last_name: e.last_name,
      email: e.email,
      comments: e.comments,
      pukla_link: e.pukla_link,
    };
    callApi(formData);
    form.reset();
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 pb-32">
      <CustomPageMeta title={t("SEO.appeal.title")} description={t("SEO.appeal.description")} />
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <CustomMotionDiv className="py-10 pb-0 text-5xl font-bold">
          {t("AppealPage.page-title")}
        </CustomMotionDiv>
        <CustomMotionDiv delay={0.1} className="text-md p-0">
          {t("AppealPage.page-subtitle")}
        </CustomMotionDiv>
      </div>
      <CustomMotionDiv delay={0.2} className="w-full max-w-lg p-4 pt-0 drop-shadow-xl md:p-2">
        <Card>
          <CardContent headless>
            <Form {...form}>
              <form
                noValidate
                onSubmit={form.handleSubmit(submitReport)}
                className="flex flex-col gap-2"
              >
                <div className="flex flex-row gap-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("AppealPage.first-name")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("AppealPage.last-name")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("AppealPage.email.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pukla_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("AppealPage.pukla-link.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("AppealPage.additional-comments.label")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button className="w-full" type="submit">
                  {t("General.send")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </CustomMotionDiv>
      <Dialog open={openSuccessDialog} onOpenChange={setOpenSuccessDialog}>
        <DialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("AppealPage.appeal-form.submitted.title")}</DialogTitle>
            <DialogDescription>{t("AppealPage.appeal-form.submitted.subtitle")}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
};
