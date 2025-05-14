import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getNotesValue } from "@/lib/utils";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useCreateBankAccount, useUpdateBankAccount } from "./bank_account.hooks";
import useBankAccountStore from "./bank_account.store";
import { BankAccountCreateData, BankAccountUpdateData } from "./bank_account.type";

// Status and account type options (define here if not in options file)
const BANK_ACCOUNT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];
const BANK_ACCOUNT_TYPE_OPTIONS = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
];

export const createBankAccountSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("BankAccounts.form.name.required")),
    account_number: z.string().optional().or(z.literal("")),
    account_type: z.string().optional().or(z.literal("")),
    routing_number: z.string().optional().or(z.literal("")),
    iban: z.string().min(1, t("BankAccounts.form.iban.required")),
    swift_bic: z.string().optional().or(z.literal("")),
    bank_name: z.string().min(1, t("BankAccounts.form.bank_name.required")),
    status: z.enum(CommonStatus, {
      message: t("BankAccounts.form.status.required"),
    }),
    notes: z.any().optional().nullable(),
  });

export type BankAccountFormValues = z.input<ReturnType<typeof createBankAccountSchema>>;

export interface BankAccountFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: BankAccountUpdateData | null;
  editMode?: boolean;
}

export function BankAccountForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  onError,
}: ModuleFormProps<BankAccountUpdateData | BankAccountCreateData>) {
  const t = useTranslations();
  const lang = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { mutate: createBankAccount } = useCreateBankAccount();
  const { mutate: updateBankAccount } = useUpdateBankAccount();

  const isLoading = useBankAccountStore((state) => state.isLoading);
  const setIsLoading = useBankAccountStore((state) => state.setIsLoading);

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(createBankAccountSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      account_number: defaultValues?.account_number || "",
      account_type: defaultValues?.account_type || "",
      routing_number: defaultValues?.routing_number || "",
      iban: defaultValues?.iban || "",
      swift_bic: defaultValues?.swift_bic || "",
      bank_name: defaultValues?.bank_name || "",
      status: defaultValues?.status || "draft",
      notes: getNotesValue(defaultValues),
    },
  });

  const handleSubmit = async (data: BankAccountFormValues) => {
    setIsLoading(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      return;
    }
    try {
      if (editMode) {
        await updateBankAccount(
          {
            id: defaultValues?.id || "",
            data: {
              name: data.name.trim(),
              account_number: data.account_number?.trim() || "",
              account_type: data.account_type?.trim() || "",
              routing_number: data.routing_number?.trim() || "",
              iban: data.iban.trim(),
              swift_bic: data.swift_bic?.trim() || "",
              bank_name: data.bank_name.trim(),
              status: data.status,
              notes: data.notes || "",
            },
          },
          {
            onSuccess: async () => {
              if (onSuccess) onSuccess();
            },
            onError: () => {
              if (onError) onError();
            },
          },
        );
      } else {
        await createBankAccount(
          {
            name: data.name.trim(),
            account_number: data.account_number?.trim() || "",
            account_type: data.account_type?.trim() || "",
            routing_number: data.routing_number?.trim() || "",
            iban: data.iban.trim(),
            swift_bic: data.swift_bic?.trim() || "",
            bank_name: data.bank_name.trim(),
            status: data.status,
            notes: data.notes || "",
            user_id: user?.id || "",
            enterprise_id: enterprise?.id || "",
          },
          {
            onSuccess: async () => {
              if (onSuccess) onSuccess();
            },
            onError: () => {
              if (onError) onError();
            },
          },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to save bank account:", error);
      toast.error(t("General.error_operation"), {
        description: t("BankAccounts.error.create"),
      });
    }
  };

  // Expose form methods for external use (like dummy data)
  if (typeof window !== "undefined") {
    (window as any).bankAccountForm = form;
  }

  return (
    <Form {...form}>
      <form id={formHtmlId} onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="form-container">
          <div className="form-fields-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("BankAccounts.form.name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("BankAccounts.form.name.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("BankAccounts.form.bank_name.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("BankAccounts.form.bank_name.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("BankAccounts.form.account_number.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("BankAccounts.form.account_number.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("BankAccounts.form.account_type.label")}</FormLabel>
                  <FormControl>
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("BankAccounts.form.account_type.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANK_ACCOUNT_TYPE_OPTIONS.map((typeOpt) => (
                          <SelectItem key={typeOpt.value} value={typeOpt.value}>
                            {t(`BankAccounts.form.account_type.${typeOpt.value}`, {
                              defaultValue: typeOpt.label,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("BankAccounts.form.iban.label")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("BankAccounts.form.iban.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="swift_bic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("BankAccounts.form.swift_bic.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("BankAccounts.form.swift_bic.placeholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routing_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("BankAccounts.form.routing_number.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("BankAccounts.form.routing_number.placeholder")}
                      {...field}
                      disabled={isLoading}
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
                  <FormLabel>{t("BankAccounts.form.status.label")} *</FormLabel>
                  <FormControl>
                    <Select
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger onClear={() => field.onChange("")} value={field.value}>
                          <SelectValue placeholder={t("BankAccounts.form.status.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANK_ACCOUNT_STATUS_OPTIONS.map((statusOpt) => (
                          <SelectItem key={statusOpt.value} value={statusOpt.value}>
                            {t(`BankAccounts.form.status.${statusOpt.value}`, {
                              defaultValue: statusOpt.label,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <FormLabel>{t("BankAccounts.form.notes.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("BankAccounts.form.notes.placeholder")}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
