import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { CommandSelect } from "@/ui/command-select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Textarea } from "@/ui/textarea";

import NotesSection from "@/components/forms/notes-section";
import CodeInput from "@/components/ui/inputs/code-input";
import { CurrencyInput } from "@/components/ui/inputs/currency-input";
import { Input } from "@/components/ui/inputs/input";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreatePurchase, usePurchases, useUpdatePurchase } from "./purchase.hooks";
import usePurchaseStore from "./purchase.store";
import { PurchaseUpdateData, PurchaseCreateData, PurchaseStatus } from "./purchase.type";

export const createPurchaseSchema = (t: (key: string) => string) => {
  return z.object({
    purchase_number: z.string().min(1, t("Purchases.form.purchase_number.required")),
    description: z.string().optional().or(z.literal("")),
    amount: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          const num = parseFloat(val.replace(/,/g, "")); // Handle potential commas
          return isNaN(num) ? undefined : num;
        }
        return val;
      },
      z
        .number({
          required_error: t("Purchases.form.amount.required"),
          invalid_type_error: t("Purchases.form.amount.invalid"),
        })
        .positive(t("Purchases.form.amount.positive")),
    ),
    category: z.string().min(1, t("Purchases.form.category.required")),
    status: z
      .enum(PurchaseStatus, { required_error: t("Purchases.form.status.required") })
      .default("draft"),
    issue_date: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: t("Purchases.form.issue_date.invalid"),
      })
      .transform((val) => val || new Date().toISOString().split("T")[0]) // Default to today if empty, then format
      .default(new Date().toISOString().split("T")[0]),
    due_date: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: t("Purchases.form.due_date.invalid"),
      })
      .optional()
      .or(z.literal("")),
    incurred_at: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: t("Purchases.form.incurred_at.invalid"),
      })
      .transform((val) => val || new Date().toISOString().split("T")[0]) // Default to today if empty, then format
      .default(new Date().toISOString().split("T")[0]),
    notes: z.any().optional().nullable(),
  });
};

export type PurchaseFormValues = z.input<ReturnType<typeof createPurchaseSchema>>;

export interface PurchaseFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: PurchaseUpdateData | null;
  editMode?: boolean;
}

export function PurchaseForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<PurchaseUpdateData | PurchaseCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const { user, enterprise } = useUserStore();
  const { mutate: createPurchase } = useCreatePurchase();
  const { mutate: updatePurchase } = useUpdatePurchase();
  const { data: purchases } = usePurchases();

  const isLoading = usePurchaseStore((state: any) => state.isLoading);
  const setIsLoading = usePurchaseStore((state: any) => state.setIsLoading);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(createPurchaseSchema(t)),
    defaultValues: {
      purchase_number: defaultValues?.purchase_number || "",
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || undefined,
      category: defaultValues?.category || "",
      status: defaultValues?.status || "draft",
      issue_date: defaultValues?.issue_date
        ? new Date(defaultValues.issue_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      due_date: defaultValues?.due_date
        ? new Date(defaultValues.due_date).toISOString().split("T")[0]
        : "",
      incurred_at: defaultValues?.incurred_at
        ? new Date(defaultValues.incurred_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: PurchaseFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsLoading(false);
      return;
    }
    if (!enterprise?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.no_enterprise_selected"),
      });
      setIsLoading(false);
      return;
    }

    const payload: PurchaseCreateData = {
      purchase_number: data.purchase_number.trim(),
      description: data.description,
      amount: Number(data.amount),
      category: data.category.trim(),
      status: data.status,
      issue_date: data.issue_date
        ? new Date(data.issue_date).toISOString()
        : new Date().toISOString(),
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      incurred_at: data.incurred_at
        ? new Date(data.incurred_at).toISOString()
        : new Date().toISOString(),
      notes: data.notes,
      user_id: user.id,
      enterprise_id: enterprise.id,
      created_by: user.id,
    };

    try {
      if (editMode) {
        if (!defaultValues?.id) {
          throw new Error("Purchase ID is missing for update.");
        }
        await updatePurchase(
          { id: defaultValues.id, data: payload },
          {
            onSuccess: () => {
              setIsLoading(false);
              if (onSuccess) onSuccess();
            },
            onError: () => setIsLoading(false),
          },
        );
      } else {
        await createPurchase(payload, {
          onSuccess: () => {
            setIsLoading(false);
            if (onSuccess) onSuccess();
          },
          onError: () => setIsLoading(false),
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save purchase:", error);
      toast.error(t("General.error_operation"), {
        description: t("Purchases.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).purchaseForm = form;
  }

  return (
    <div>
      <Form {...form}>
        <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="purchase_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Purchases.form.purchase_number.label")} *</FormLabel>
                    <FormControl>
                      <CodeInput
                        onSerial={() => {
                          const nextNumber = (purchases?.length || 0) + 1;
                          const paddedNumber = String(nextNumber).padStart(4, "0");
                          form.setValue("purchase_number", `PUR-${paddedNumber}`);
                        }}
                        onRandom={() => {
                          const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                          let randomCode = "";
                          for (let i = 0; i < 5; i++) {
                            randomCode += randomChars.charAt(
                              Math.floor(Math.random() * randomChars.length),
                            );
                          }
                          form.setValue("purchase_number", `PUR-${randomCode}`);
                        }}
                      >
                        <Input
                          placeholder={t("Purchases.form.purchase_number.placeholder")}
                          {...field}
                          disabled={isLoading}
                          aria-invalid={!!form.formState.errors.purchase_number}
                        />
                      </CodeInput>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Purchases.form.category.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Purchases.form.category.placeholder")}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Purchases.form.amount.label")} *</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder={t("Purchases.form.amount.placeholder")}
                        disabled={isLoading}
                        {...field}
                        showCommas={true}
                        value={field.value ? parseFloat(String(field.value)) : undefined}
                        onChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Purchases.form.status.label")} *</FormLabel>
                    <FormControl>
                      <CommandSelect
                        disabled={isLoading}
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        data={[
                          { label: t("Purchases.form.status.pending"), value: "pending" },
                          { label: t("Purchases.form.status.paid"), value: "paid" },
                          { label: t("Purchases.form.status.overdue"), value: "overdue" },
                          { label: t("Purchases.form.status.cancelled"), value: "cancelled" },
                        ]}
                        defaultValue={field.value || "pending"}
                        onChange={(value) => field.onChange(value || "pending")}
                        texts={{ placeholder: t("Purchases.form.status.placeholder") }}
                        ariaInvalid={!!form.formState.errors.status}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Purchases.form.issue_date.label")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Purchases.form.due_date.label")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="incurred_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Purchases.form.incurred_at.label")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Purchases.form.description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("Purchases.form.description.placeholder")}
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <NotesSection
            inDialog={editMode}
            control={form.control}
            title={t("Purchases.form.notes.label")}
          />
        </form>
      </Form>
    </div>
  );
}
