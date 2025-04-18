import { useState } from "react";
import { useForm } from "react-hook-form";

import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/router";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
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
import { useBreakpoint } from "@/hooks/use-breakpoint";

export default function ReportPage() {
  const t = useTranslations();
  const lang = useLocale();
  const router = useRouter();
  const { pukla_id } = router.query;
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  let size = useBreakpoint();
  let isMobile = size < 600;

  const report_reasons = [
    { value: "spam", label: t("ReportPage.reporter-reason-options.spam") },
    {
      value: "gambling",
      label: t("ReportPage.reporter-reason-options.gambling"),
    },
    {
      value: "adultContent",
      label: t("ReportPage.reporter-reason-options.adultContent"),
    },
    {
      value: "misinformation",
      label: t("ReportPage.reporter-reason-options.misinformation"),
    },
    {
      value: "electoralFraud",
      label: t("ReportPage.reporter-reason-options.electoralFraud"),
    },
    {
      value: "illegalGoodsAndServices",
      label: t("ReportPage.reporter-reason-options.illegalGoodsAndServices"),
    },
    {
      value: "hateSpeech",
      label: t("ReportPage.reporter-reason-options.hateSpeech"),
    },
    {
      value: "privacyImpersonationHarassment",
      label: t("ReportPage.reporter-reason-options.privacyImpersonationHarassment"),
    },
    {
      value: "selfHarm",
      label: t("ReportPage.reporter-reason-options.selfHarm"),
    },
    { value: "fraud", label: t("ReportPage.reporter-reason-options.fraud") },
    {
      value: "extremistContent",
      label: t("ReportPage.reporter-reason-options.extremistContent"),
    },
    {
      value: "shockingOrViolentContent",
      label: t("ReportPage.reporter-reason-options.shockingOrViolentContent"),
    },
    {
      value: "childHarm",
      label: t("ReportPage.reporter-reason-options.childHarm"),
    },
  ];
  const reporter_roles = [
    {
      value: "pukla_user",
      label: t("ReportPage.reporter-role-options.pukla_user"),
    },
    {
      value: "non_pukla_user",
      label: t("ReportPage.reporter-role-options.non_pukla_user"),
    },
    {
      value: "law_enforcement",
      label: t("ReportPage.reporter-role-options.law_enforcement"),
    },
    {
      value: "regulatory_body",
      label: t("ReportPage.reporter-role-options.regulatory_body"),
    },
  ];

  let formSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    reason: z.string({ required_error: t("ReportPage.reason.required") }),
    reporter_role: z.string({
      required_error: t("ReportPage.reporter-role.required"),
    }),
    email: z
      .string({ required_error: t("ReportPage.email.required") })
      .min(1, { message: t("ReportPage.email.required") })
      .email({ message: t("ReportPage.email.invalid") })
      .optional(),
    pukla_link: z
      .string({ required_error: t("ReportPage.pukla-link.required") })
      .min(1, { message: t("ReportPage.pukla-link.required") }),
    comments: z
      .string({ required_error: t("ReportPage.additional-comments.required") })
      .min(10, { message: t("ReportPage.additional-comments.too-short") }),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      comments: "",
      reporter_role: undefined,
      reason: undefined,
      pukla_link: pukla_id ? `puk.la/${pukla_id}` : "",
    },
  });
  async function callApi(formData: any) {
    try {
      const response = await fetch("/api/form-report", {
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
      reporter_role: e.reporter_role,
      reason: e.reason,
      pukla_link: e.pukla_link,
    };
    callApi(formData);
    form.reset();
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 pt-0 pb-32">
      <CustomPageMeta title={t("SEO.report.title")} description={t("SEO.report.description")} />
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <CustomMotionDiv className="py-10 pb-0 text-5xl leading-tight font-bold">
          {t("ReportPage.page-title")}
        </CustomMotionDiv>
        <CustomMotionDiv delay={0.1} className="text-md p-0">
          {t("ReportPage.page-subtitle")}
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
                        <FormLabel>{t("ReportPage.first-name")}</FormLabel>
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
                        <FormLabel>{t("ReportPage.last-name")}</FormLabel>
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
                    <FormItem className="w-full">
                      <FormLabel>{t("ReportPage.email.label")}</FormLabel>
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
                    <FormItem className="w-full">
                      <FormLabel>{t("ReportPage.pukla-link.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Combobox
                          direction={lang === "ar" ? "rtl" : "ltr"}
                          texts={{ searchPlaceholder: t("General.search") }}
                          data={report_reasons}
                          label={t("ReportPage.reason.label")}
                          defaultValue={field.value}
                          helperText={form.formState.errors.reason?.message?.toString()}
                          {...field}
                          onChange={(e) => field.onChange(e || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reporter_role"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Combobox
                          direction={lang === "ar" ? "rtl" : "ltr"}
                          hideInput
                          data={reporter_roles}
                          label={t("ReportPage.reporter-role.label")}
                          defaultValue={field.value}
                          helperText={form.formState.errors.reporter_role?.message?.toString()}
                          {...field}
                          onChange={(e) => field.onChange(e || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>{t("ReportPage.additional-comments.label")}</FormLabel>
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
            <DialogTitle>{t("ReportPage.report-form.submitted.title")}</DialogTitle>
            <DialogDescription>{t("ReportPage.report-form.submitted.subtitle")}</DialogDescription>
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
