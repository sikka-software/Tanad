import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { createInsertSchema } from "drizzle-zod";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FieldError, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DatePicker } from "@/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import FormDialog from "@/ui/form-dialog";
import CodeInput from "@/ui/inputs/code-input";
import { Input } from "@/ui/inputs/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import NotesSection from "@/forms/notes-section";
import ProductsFormSection from "@/forms/products-form-section";

import { getNotesValue } from "@/lib/utils";

import { ModuleFormProps } from "@/types/common.type";

import ClientCombobox from "@/client/client.combobox";
import ClientForm from "@/client/client.form";
import { useClients } from "@/client/client.hooks";
import useClientStore from "@/client/client.store";

import { useCreateQuote, useUpdateQuote } from "@/quote/quote.hooks";
import { useQuotes } from "@/quote/quote.hooks";
import useQuoteStore from "@/quote/quote.store";
import {
  QuoteCreateData,
  QuoteUpdateData,
  QuoteItem as DbQuoteItem,
  QuoteItemClientData,
  QuoteStatus,
} from "@/quote/quote.type";

import { Product } from "@/product/product.type";

import { quotes } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createQuoteSchema = (t: (key: string) => string) => {
  const QuoteSelectSchema = createInsertSchema(quotes, {
    client_id: z.string().min(1, t("Quotes.validation.client_required")),
    quote_number: z.string().min(1, t("Quotes.validation.quote_number_required")),
    issue_date: z.string().min(1, t("Quotes.validation.issue_date_required")),
    expiry_date: z.string().min(1, t("Quotes.validation.expiry_date_required")),
    status: z.enum(QuoteStatus, {
      message: t("Quotes.validation.status_required"),
    }),
    tax_rate: z.number().min(0, t("Quotes.validation.tax_rate_positive")),
    notes: z.any().optional().nullable(),
  });

  const QuoteItemsSchema = z
    .array(
      z.object({
        product_id: z.string().optional(),
        description: z.string().optional(),
        quantity: z
          .number({ invalid_type_error: t("Quotes.validation.item_quantity_invalid") })
          .min(1, t("Quotes.validation.item_quantity_positive")),
        unit_price: z
          .number({ invalid_type_error: t("Quotes.validation.item_price_invalid") })
          .min(0, t("Quotes.validation.item_price_positive")),
        id: z.string().optional(),
      }),
    )
    .min(1, t("Quotes.validation.items_required"));

  return QuoteSelectSchema.extend({
    items: QuoteItemsSchema,
  });
};

export type QuoteFormValues = z.input<ReturnType<typeof createQuoteSchema>>;

export function QuoteForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
}: ModuleFormProps<QuoteCreateData | QuoteUpdateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);

  const { data: clients = [], isLoading: clientsLoading } = useClients();

  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate: createQuote } = useCreateQuote();
  const { mutate: updateQuote } = useUpdateQuote();
  const { data: quotes } = useQuotes();

  const setIsLoading = useQuoteStore((state) => state.setIsLoading);
  const isLoading = useQuoteStore((state) => state.isLoading);
  const setIsSavingClient = useClientStore((state) => state.setIsLoading);
  const isSavingClient = useClientStore((state) => state.isLoading);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(createQuoteSchema(t)),
    defaultValues: {
      client_id: defaultValues?.client_id || "",
      quote_number: defaultValues?.quote_number || "",

      issue_date: defaultValues?.issue_date || format(new Date(), "yyyy-MM-dd"),
      expiry_date:
        defaultValues?.expiry_date ||
        format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
      status: (defaultValues?.status as QuoteFormValues["status"]) || "draft",
      tax_rate: defaultValues?.tax_rate ?? 0,
      notes: getNotesValue(defaultValues as any),
      items:
        defaultValues && "items" in defaultValues && defaultValues.items
          ? (defaultValues.items as DbQuoteItem[]).map((item) => ({
              product_id: item.product_id ?? undefined,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              id: item.id,
            }))
          : [{ product_id: undefined, description: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items") || [];

  const subtotal = useMemo(() => {
    return watchedItems.reduce((acc: number, item: QuoteFormValues["items"][number]) => {
      const quantity = item.quantity || 0;
      const unit_price = item.unit_price || 0;
      return acc + quantity * unit_price;
    }, 0);
  }, [watchedItems]);

  const handleProductSelection = (index: number, product_id: string | undefined) => {
    if (!product_id) return;
    const product = products.find((p) => p.id === product_id);
    if (product) {
      form.setValue(`items.${index}.description`, product.description || "");
      form.setValue(`items.${index}.unit_price`, product.price);
    }
  };

  const handleSubmit = async (formData: QuoteFormValues) => {
    setIsLoading(true);
    if (!user?.id || !enterprise?.id) {
      toast.error(t("Authentication.login_required_enterprise"));
      setIsLoading(false);
      return;
    }

    const itemsToSubmitForCreate: QuoteItemClientData[] = formData.items.map((item) => ({
      product_id: item.product_id || null,
      description: item.description || "",
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const itemsToSubmitForUpdate: (QuoteItemClientData & { id?: string })[] = formData.items.map(
      (item) => ({
        product_id: item.product_id || null,
        description: item.description || "",
        quantity: item.quantity,
        unit_price: item.unit_price,
        ...(item.id && { id: item.id }),
      }),
    );

    try {
      if (editMode && defaultValues && "id" in defaultValues && defaultValues.id) {
        const updatePayload: QuoteUpdateData = {
          user_id: user.id,
          enterprise_id: enterprise.id,
          id: defaultValues.id,
          client_id: formData.client_id,
          quote_number: formData.quote_number,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          status: formData.status,
          tax_rate: formData.tax_rate,
          notes: formData.notes,
          items: itemsToSubmitForUpdate,
        };

        await updateQuote(
          { id: defaultValues.id, data: updatePayload },
          {
            onSuccess: () => {
              setIsLoading(false);
              if (onSuccess) onSuccess();
            },
            onError: () => setIsLoading(false),
          },
        );
      } else {
        const createPayload: QuoteCreateData = {
          user_id: user.id,
          enterprise_id: enterprise.id,
          client_id: formData.client_id,
          quote_number: formData.quote_number,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          status: formData.status,
          tax_rate: formData.tax_rate,
          notes: formData.notes,
          items: itemsToSubmitForCreate,
        };
        await createQuote(createPayload, {
          onSuccess: () => {
            setIsLoading(false);
            if (onSuccess) onSuccess();
          },
          onError: () => setIsLoading(false),
        });
      }
    } catch (err) {
      console.error("Error saving quote:", err);
      toast.error(t("Quotes.error.save"));
      setIsLoading(false);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).quoteForm = form;
  }

  return (
    <>
      <Form {...form}>
        <form
          id={formHtmlId || "quote-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />

          <div className="form-container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ClientCombobox
                formName="client_id"
                label={t("Quotes.form.client.label")}
                control={form.control}
                clients={clients || []}
                loadingCombobox={clientsLoading}
                isSaving={isSavingClient}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
              />

              <FormField
                control={form.control}
                name="quote_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.form.quote_number.label")} *</FormLabel>
                    <FormControl>
                      <CodeInput
                        onSerial={() => {
                          const nextNumber = (quotes?.length || 0) + 1;
                          const paddedNumber = String(nextNumber).padStart(4, "0");
                          form.setValue("quote_number", `QT-${paddedNumber}`);
                        }}
                        onRandom={() => {
                          const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                          let randomCode = "";
                          for (let i = 0; i < 5; i++) {
                            randomCode += randomChars.charAt(
                              Math.floor(Math.random() * randomChars.length),
                            );
                          }
                          form.setValue("quote_number", `QT-${randomCode}`);
                        }}
                        inputProps={{
                          placeholder: t("Quotes.form.quote_number.placeholder"),
                          disabled: isLoading,
                          ...field,
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FormLabel>{t("Quotes.products.subtotal")}</FormLabel>
                <Input type="text" value={subtotal.toFixed(2)} readOnly disabled />
              </div>

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.tax_rate.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
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
                    <FormLabel>{t("Quotes.form.issue_date.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) =>
                          field.onChange(date ? format(date as Date, "yyyy-MM-dd") : "")
                        }
                        placeholder={t("Quotes.form.issue_date.placeholder")}
                        aria-invalid={form.formState.errors.issue_date !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quotes.form.expiry_date.label")} *</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) =>
                          field.onChange(date ? format(date as Date, "yyyy-MM-dd") : "")
                        }
                        placeholder={t("Quotes.form.expiry_date.placeholder")}
                        aria-invalid={form.formState.errors.expiry_date !== undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Quotes.form.status.label")} *</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Quotes.form.status.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QuoteStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`Quotes.form.status.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <ProductsFormSection
            control={form.control}
            fields={fields}
            append={append}
            remove={remove}
            onAddNewProduct={() => setIsNewProductDialogOpen(true)}
            handleProductSelection={handleProductSelection}
            title={t("Quotes.products.title")}
            isError={form.formState.errors.items as FieldError}
          />

          <NotesSection
            inDialog={editMode}
            control={form.control}
            title={t("Quotes.form.notes.label")}
          />
        </form>
      </Form>

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t("Pages.Clients.add")}
        formId="client-form-quote"
        cancelText={t("General.cancel")}
        submitText={t("General.save")}
      >
        <ClientForm
          nestedForm
          formHtmlId="client-form-quote"
          onSuccess={() => {
            setIsSavingClient(false);
            setIsClientDialogOpen(false);
          }}
        />
      </FormDialog>
    </>
  );
}
