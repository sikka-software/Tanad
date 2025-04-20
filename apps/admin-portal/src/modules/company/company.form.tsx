import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import { DocumentList } from "@/components/ui/documents-list";
import { DocumentUploader } from "@/components/ui/documents-uploader";

import useCompanyStore from "@/modules/company/company.store";
import useUserStore from "@/stores/use-user-store";

import { useCreateCompany } from "./company.hooks";

export const createCompanySchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Companies.form.validation.name_required")),
    email: z
      .string()
      .min(1, t("Companies.form.validation.email_required"))
      .email(t("Companies.form.validation.email_invalid")),
    phone: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    industry: z.string().optional(),
    size: z.string().optional(),
    notes: z.string().optional(),
    is_active: z.boolean().default(true),
  });

export type CompanyFormValues = z.input<ReturnType<typeof createCompanySchema>>;

interface CompanyFormProps {
  id?: string;
  onSuccess: () => void;
}

export function CompanyForm({ id, onSuccess }: CompanyFormProps) {
  const t = useTranslations();
  const companySchema = createCompanySchema(t);
  const { user } = useUserStore();
  const { mutate: createCompany } = useCreateCompany();

  const isLoading = useCompanyStore((state) => state.isLoading);
  const setIsLoading = useCompanyStore((state) => state.setIsLoading);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      industry: "",
      size: "",
      notes: "",
      is_active: true,
    },
  });

  const handleSubmit = async (data: CompanyFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }
    try {
      await createCompany(
        {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || undefined,
          website: data.website?.trim() || undefined,
          address: data.address?.trim() || undefined,
          city: data.city?.trim() || undefined,
          state: data.state?.trim() || undefined,
          zip_code: data.zip_code?.trim() || undefined,
          industry: data.industry?.trim() || undefined,
          size: data.size?.trim() || undefined,
          notes: data.notes?.trim() || undefined,
          is_active: data.is_active || true,
          user_id: user?.id,
        },
        {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            }
          },
        },
      );
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save company:", error);
      toast.error(t("General.error_operation"), {
        description: error instanceof Error ? error.message : t("Companies.error.creating"),
      });
    }
  };

  // const handleSubmit = async (data: ExpenseFormValues) => {
  //   setIsLoading(true);
  //   if (!user?.id) {
  //     toast.error(t("General.unauthorized"), {
  //       description: t("General.must_be_logged_in"),
  //     });
  //     return;
  //   }

  //   try {
  //     await createExpense(
  //       {
  //         expense_number: data.expense_number.trim(),
  //         issue_date: data.issue_date,
  //         due_date: data.due_date,
  //         amount: data.amount,
  //         category: data.category.trim(),
  //         ...(data.client_id?.trim() ? { client_id: data.client_id.trim() } : {}),
  //         status: data.status || "pending",
  //         notes: data.notes?.trim(),
  //         user_id: user?.id,
  //       },
  //       {
  //         onSuccess: () => {
  //           if (onSuccess) {
  //             onSuccess();
  //           }
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     setIsLoading(false);
  //     toast.error(t("General.error_operation"), {
  //       description: error instanceof Error ? error.message : t("Expenses.error.creating"),
  //     });
  //   }
  // };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).companyForm = form;
  }

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.name.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.name.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={isLoading}
                    placeholder={t("Companies.form.email.placeholder")}
                    {...field}
                  />
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
                <FormLabel>{t("Companies.form.phone.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.phone.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.website.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.website.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.address.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.address.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.city.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.city.placeholder")}
                    {...field}
                  />
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
                <FormLabel>{t("Companies.form.state.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.state.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.zip_code.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.zip_code.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.industry.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.industry.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Companies.form.size.label")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder={t("Companies.form.size.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Companies.form.notes.label")}</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isLoading}
                  placeholder={t("Companies.form.notes.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {id && (
          <div className="space-y-4">
            <DocumentUploader
              entityId={id}
              entityType="company"
              disabled={isLoading}
              onDocumentsChange={(docs) => {
                // Documents are handled by the uploader component itself
                console.log("Documents updated:", docs);
              }}
            />

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium">{t("Documents.attached_documents")}</h3>
              <DocumentList entityId={id} entityType="company" />
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
