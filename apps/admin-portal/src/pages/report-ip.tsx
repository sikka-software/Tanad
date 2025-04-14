// TODO: add signature component
import { useState, useId } from "react";
import { useForm } from "react-hook-form";

import { GetStaticProps } from "next";
import { useTranslations, useLocale } from "next-intl";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import CustomMotionDiv from "@/components/landing/CustomMotionDiv";
import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Signature } from "@/components/ui/signature";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function ReportIPPage() {
  const t = useTranslations();
  const lang = useLocale();
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [ipType, setIpType] = useState("");
  const id = useId();

  const formSchema = z
    .object({
      first_name: z
        .string({ required_error: t("ReportPage.required-field") })
        .min(1, { message: t("ReportPage.required-field") }),
      last_name: z
        .string({ required_error: t("ReportPage.required-field") })
        .min(1, { message: t("ReportPage.required-field") }),
      email: z
        .string({ required_error: t("ReportPage.email.required") })
        .min(1, { message: t("ReportPage.email.required") })
        .email({ message: t("ReportPage.email.invalid") })
        .optional(),
      pukla_link: z
        .string({ required_error: t("ReportPage.pukla-link.required") })
        .min(1, { message: t("ReportPage.pukla-link.required") }),
      address_1: z
        .string({ required_error: t("ReportPage.address-1.required") })
        .min(1, { message: t("ReportPage.address-1.required") }),
      address_2: z
        .string({ required_error: t("ReportPage.address-2.required") })
        .min(1, { message: t("ReportPage.address-2.required") }),
      city: z
        .string({ required_error: t("ReportPage.city.required") })
        .min(1, { message: t("ReportPage.city.required") }),
      state: z
        .string({ required_error: t("ReportPage.state.required") })
        .min(1, { message: t("ReportPage.state.required") }),
      zip: z
        .string({ required_error: t("ReportPage.zip.required") })
        .min(1, { message: t("ReportPage.zip.required") }),
      country: z
        .string({ required_error: t("ReportPage.country.required") })
        .min(1, { message: t("ReportPage.country.required") }),
      phone: z
        .string({ required_error: t("ReportPage.phone.required") })
        .min(1, { message: t("ReportPage.phone.required") }),
      correct_info: z
        .boolean({
          required_error: t("ReportPage.statement.correct-info.required"),
        })
        .refine((value) => value, {
          message: t("ReportPage.statement.correct-info.required"),
        }),
      my_info_shared: z
        .boolean({
          required_error: t("ReportPage.statement.my-info-shared.required"),
        })
        .refine((value) => value, {
          message: t("ReportPage.statement.my-info-shared.required"),
        }),

      infringment_content: z
        .string({
          required_error: t("ReportPage.infringment-content.required"),
        })
        .min(1, { message: t("ReportPage.infringment-content.required") }),

      copyright_owner: z.string().optional(),
      relationship_copyright_owner: z.string().optional(),
      good_faith: z.boolean().optional(),
      authorized: z.boolean().optional(),
      no_lie: z.boolean().optional(),
      trademark_good_faith: z.boolean().optional(),
      trademark_authorized: z.boolean().optional(),

      trademark_owner: z.string().optional(),
      relationship_trademark_owner: z.string().optional(),
      trademark_name: z.string().optional(),
      trademark_industry: z.string().optional(),
      trademark_country: z.string().optional(),
      trademark_number: z.string().optional(),
    })
    .superRefine((data: any, refCtx) => {
      if (ipType === "copyright-infringment") {
        if (data.copyright_owner.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.copyright-owner.required"),
            path: ["copyright_owner"],
          });
        }
        if (data.relationship_copyright_owner.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.relationship-copyright-owner.required"),
            path: ["relationship_copyright_owner"],
          });
        }

        if (!data.good_faith) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.statement.good-faith.required"),
            path: ["good_faith"],
          });
        }
        if (!data.authorized) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.statement.authorized.required"),
            path: ["authorized"],
          });
        }
        if (!data.no_lie) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.statement.no-lie.required"),
            path: ["no_lie"],
          });
        }
      }
      if (ipType === "trademark-infringment") {
        if (data.trademark_owner?.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.trademark-owner.required"),
            path: ["trademark_owner"],
          });
        }
        if (data.relationship_trademark_owner?.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.relationship-trademark-owner.required"),
            path: ["relationship_trademark_owner"],
          });
        }
        if (data.trademark_name?.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.trademark-name.required"),
            path: ["trademark_name"],
          });
        }
        if (data.trademark_industry?.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.trademark-industry.required"),
            path: ["trademark_industry"],
          });
        }
        if (data.trademark_country?.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.trademark-country.required"),
            path: ["trademark_country"],
          });
        }
        if (data.trademark_number?.trim().length <= 0) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.trademark-registration.required"),
            path: ["trademark_number"],
          });
        }

        if (!data.trademark_authorized) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.statement.trademark-authorized.required"),
            path: ["trademark_authorized"],
          });
        }
        if (!data.trademark_good_faith) {
          refCtx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("ReportPage.statement.trademark-good-faith.required"),
            path: ["trademark_good_faith"],
          });
        }
      }
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      copyright_owner: "",
      relationship_copyright_owner: "",
      trademark_owner: "",
      relationship_trademark_owner: "",
      trademark_name: "",
      trademark_industry: "",
      trademark_number: "",
      trademark_country: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      phone: "",
      infringment_content: "",
      pukla_link: "",
      good_faith: false,
      authorized: false,
      correct_info: false,
      my_info_shared: false,
      trademark_good_faith: false,
      trademark_authorized: false,
      no_lie: false,
    },
  });
  async function callApi(formData: any, ipType: string) {
    try {
      let apiPath =
        ipType === "copyright-infringment"
          ? "/api/form-report-copyright"
          : "/api/form-report-trademark";
      const response = await fetch(apiPath, {
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

    let formData;
    if (ipType === "copyright-infringment") {
      formData = {
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email,
        pukla_link: e.pukla_link,
        address_1: e.address_1,
        address_2: e.address_2,
        city: e.city,
        state: e.state,
        zip: e.zip,
        country: e.country,
        phone: e.phone,
        infringment_content: e.infringment_content,
        copyright_owner: e.copyright_owner,
        relationship_copyright_owner: e.relationship_copyright_owner,
      };
    }
    if (ipType === "trademark-infringment") {
      formData = {
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email,
        pukla_link: e.pukla_link,
        address_1: e.address_1,
        address_2: e.address_2,
        city: e.city,
        state: e.state,
        zip: e.zip,
        country: e.country,
        phone: e.phone,
        infringment_content: e.infringment_content,
        trademark_owner: e.trademark_owner,
        relationship_trademark_owner: e.relationship_trademark_owner,
        trademark_name: e.trademark_name,
        trademark_industry: e.trademark_industry,
        trademark_country: e.trademark_country,
        trademark_number: e.trademark_number,
      };
    }

    callApi(formData, ipType);
    form.reset();
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 pb-32">
      <CustomPageMeta
        title={t("SEO.report-ip.title")}
        description={t("SEO.report-ip.description")}
      />
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <CustomMotionDiv className="py-10 pb-0 text-5xl leading-tight font-bold">
          {t("ReportPage.report-ip.title")}
        </CustomMotionDiv>
        <CustomMotionDiv delay={0.1} className="text-md p-0">
          {t("ReportPage.report-ip.subtitle")}
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
                <div className={cn(ipType && "mb-2")}>
                  <div className="bg-input/50 inline-flex h-9 w-full rounded-lg p-0.5">
                    <RadioGroup
                      value={ipType}
                      onValueChange={setIpType}
                      className="group after:bg-background has-[:focus-visible]:after:outline-ring/70 relative inline-grid w-full grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 data-[state=copyright-infringment]:after:translate-x-0 data-[state=trademark-infringment]:after:translate-x-full"
                      data-state={ipType}
                    >
                      <label className="group-data-[state=annually]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
                        {t(`ReportPage.copyright-infringment`)}
                        <RadioGroupItem
                          id={`${id}-0`}
                          value={"copyright-infringment"}
                          className="sr-only"
                        />
                      </label>
                      <label className="group-data-[state=monthly]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
                        {t(`ReportPage.trademark-infringment`)}
                        <RadioGroupItem
                          id={`${id}-1`}
                          value={"trademark-infringment"}
                          className="sr-only"
                        />
                      </label>
                    </RadioGroup>
                  </div>
                </div>
                {ipType && (
                  <>
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
                    {ipType === "copyright-infringment" && (
                      <>
                        <FormField
                          control={form.control}
                          name="copyright_owner"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>{t("ReportPage.copyright-owner.label")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="relationship_copyright_owner"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>
                                {t("ReportPage.relationship-copyright-owner.label")}
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    {ipType === "trademark-infringment" && (
                      <>
                        <FormField
                          control={form.control}
                          name="trademark_owner"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>{t("ReportPage.trademark-owner.label")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="relationship_trademark_owner"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>
                                {t("ReportPage.relationship-trademark-owner.label")}
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
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
                      name="address_1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ReportPage.address-1.label")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address_2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ReportPage.address-2.label")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-row gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("ReportPage.city.label")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("ReportPage.state.label")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("ReportPage.zip.label")}</FormLabel>
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
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ReportPage.country.label")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ReportPage.phone.label")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {ipType === "trademark-infringment" && (
                      <>
                        <FormField
                          control={form.control}
                          name="trademark_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("ReportPage.trademark-name.label")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="trademark_industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("ReportPage.trademark-industry.label")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="trademark_country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("ReportPage.trademark-country.label")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="trademark_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("ReportPage.trademark-number.label")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="infringment_content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ReportPage.infringment-content.label")}</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
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
                          <FormLabel>{t("ReportPage.pukla-link-to-report")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="w-full">
                      <Signature
                        texts={{ clear: t("ReportPage.clear") }}
                        label={t("ReportPage.signature")}
                        canvasProps={{ className: "h-[150px] bg-white" }}
                      />
                    </div>
                    <div className="my-4 flex flex-col gap-4">
                      {ipType === "copyright-infringment" && (
                        <>
                          <FormField
                            control={form.control}
                            name="good_faith"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    id={"good-faith"}
                                    onCheckedChange={(e) => field.onChange(e)}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="good-faith" className="ms-2">
                                  {t("ReportPage.statement.good-faith.label")}
                                </FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="authorized"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    id={"authorized"}
                                    onCheckedChange={(e) => field.onChange(e)}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="authorized" className="ms-2">
                                  {t("ReportPage.statement.authorized.label")}
                                </FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="correct_info"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                id={"correct_info"}
                                onCheckedChange={(e) => field.onChange(e)}
                              />
                            </FormControl>
                            <FormLabel htmlFor="correct_info" className="ms-2">
                              {t("ReportPage.statement.correct-info.label")}
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="my_info_shared"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                id={"my_info_shared"}
                                onCheckedChange={(e) => field.onChange(e)}
                              />
                            </FormControl>
                            <FormLabel htmlFor="my_info_shared" className="ms-2">
                              {t("ReportPage.statement.my-info-shared.label")}
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {ipType === "copyright-infringment" && (
                        <FormField
                          control={form.control}
                          name="no_lie"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Checkbox
                                  id={"no_lie"}
                                  onCheckedChange={(e) => field.onChange(e)}
                                />
                              </FormControl>
                              <FormLabel htmlFor="no_lie" className="ms-2">
                                {t("ReportPage.statement.no-lie.label")}
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {ipType === "trademark-infringment" && (
                        <>
                          <FormField
                            control={form.control}
                            name="trademark_good_faith"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    id={"trademark_good_faith"}
                                    onCheckedChange={(e) => field.onChange(e)}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="trademark_good_faith" className="ms-2">
                                  {t("ReportPage.statement.trademark-good-faith.label")}
                                </FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="trademark_authorized"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Checkbox
                                    id={"trademark_authorized"}
                                    onCheckedChange={(e) => field.onChange(e)}
                                  />
                                </FormControl>
                                <FormLabel htmlFor="trademark_authorized" className="ms-2">
                                  {t("ReportPage.statement.trademark-authorized.label")}
                                </FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>

                    <Button className="w-full" type="submit">
                      {t("General.send")}
                    </Button>
                  </>
                )}
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
