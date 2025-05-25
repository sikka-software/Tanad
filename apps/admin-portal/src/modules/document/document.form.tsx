import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import BooleanTabs from "@/ui/boolean-tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import CodeInput from "@/ui/inputs/code-input";
import { Input } from "@/ui/inputs/input";
import PhoneInput from "@/ui/inputs/phone-input";

import NotesSection from "@/components/forms/notes-section";

import { CommonStatus, ModuleFormProps } from "@/types/common.type";

import { useDocuments, useCreateDocument, useUpdateDocument } from "@/document/document.hooks";
import useDocumentStore from "@/document/document.store";
import { DocumentUpdateData, DocumentCreateData } from "@/document/document.type";

import { documents } from "@/db/schema";
import useUserStore from "@/stores/use-user-store";

const createDocumentSchema = (t: (key: string) => string) => {
  const DocumentSelectSchema = createInsertSchema(documents, {
    name: z.string().min(1, t("Documents.form.name.required")),
    status: z.enum(CommonStatus, {
      invalid_type_error: t("CommonStatus.required"),
    }),
    notes: z.any().optional().nullable(),
  });
  return DocumentSelectSchema;
};

export type DocumentFormValues = z.input<ReturnType<typeof createDocumentSchema>>;

export interface DocumentFormProps {
  id?: string;
  onSuccess?: () => void;
  defaultValues?: DocumentUpdateData | null;
  editMode?: boolean;
}

export function DocumentForm({
  formHtmlId,
  onSuccess,
  defaultValues,
  editMode,
  nestedForm,
}: ModuleFormProps<DocumentUpdateData | DocumentCreateData>) {
  const t = useTranslations();
  const locale = useLocale();

  const user = useUserStore((state) => state.user);
  const enterprise = useUserStore((state) => state.enterprise);
  const { mutate: createDocument } = useCreateDocument();
  const { mutate: updateDocument } = useUpdateDocument();

  const { data: documents } = useDocuments();

  const isSavingDocument = useDocumentStore((state) => state.isLoading);
  const setIsSavingDocument = useDocumentStore((state) => state.setIsLoading);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(createDocumentSchema(t)),
    defaultValues: {
      name: defaultValues?.name || "",
      status: defaultValues?.status || "active",
      notes:
        defaultValues?.notes &&
        typeof defaultValues.notes === "object" &&
        "root" in defaultValues.notes
          ? defaultValues.notes
          : null,
    },
  });

  const handleSubmit = async (data: DocumentFormValues) => {
    setIsSavingDocument(true);
    if (!user?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.must_be_logged_in"),
      });
      setIsSavingDocument(false);
      return;
    }
    if (!enterprise?.id) {
      toast.error(t("General.unauthorized"), {
        description: t("General.no_enterprise_selected"),
      });
      setIsSavingDocument(false);
      return;
    }

    const payload: DocumentCreateData = {
      name: data.name.trim(),
      url: data.url.trim(),
      file_path: data.file_path.trim(),
      entity_id: data.entity_id.trim(),
      entity_type: data.entity_type.trim(),
      notes: data.notes ?? null,
      status: data.status,
      user_id: user.id,
      enterprise_id: enterprise.id,
    };

    try {
      if (editMode) {
        if (!defaultValues?.id) {
          throw new Error("Document ID is missing for update.");
        }
        await updateDocument(
          {
            id: defaultValues.id,
            data: payload as DocumentUpdateData, // Use filtered payload
          },
          {
            onSuccess: () => {
              setIsSavingDocument(false);
              if (onSuccess) onSuccess();
            },
            onError: () => setIsSavingDocument(false),
          },
        );
      } else {
        await createDocument(payload, {
          onSuccess: () => {
            setIsSavingDocument(false);
            if (onSuccess) onSuccess();
          },
          onError: () => setIsSavingDocument(false),
        });
      }
    } catch (error) {
      setIsSavingDocument(false);
      console.error("Failed to save document:", error);
      toast.error(t("General.error_operation"), {
        description: t("Documents.error.create"),
      });
    }
  };

  if (typeof window !== "undefined") {
    (window as any).documentForm = form;
  }

  return (
    <div>
      <Form {...form}>
        <form
          id={formHtmlId || "document-form"}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          <input hidden type="text" value={user?.id} {...form.register("user_id")} />
          <input hidden type="text" value={enterprise?.id} {...form.register("enterprise_id")} />
          <div className="form-container">
            <div className="form-fields-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Documents.form.name.label")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Documents.form.name.placeholder")}
                        {...field}
                        disabled={isSavingDocument}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Documents.form.url.label")} *</FormLabel>
                    <FormControl>
                      <CodeInput
                        onSerial={() => {
                          console.log("serial");
                          const nextNumber = (documents?.length || 0) + 1;
                          const paddedNumber = String(nextNumber).padStart(4, "0");
                          form.setValue("url", `BR-${paddedNumber}`);
                        }}
                        onRandom={() => {
                          const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                          let randomCode = "";
                          for (let i = 0; i < 5; i++) {
                            randomCode += randomChars.charAt(
                              Math.floor(Math.random() * randomChars.length),
                            );
                          }
                          form.setValue("url", `BR-${randomCode}`);
                        }}
                        inputProps={{
                          placeholder: t("Documents.form.url.placeholder"),
                          disabled: isSavingDocument,
                          ...field,
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file_path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Documents.form.file_path.label")}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={isSavingDocument}
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
                    <FormLabel>{t("CommonStatus.label")}</FormLabel>
                    <FormControl>
                      <BooleanTabs
                        trueText={t("CommonStatus.active")}
                        falseText={t("CommonStatus.inactive")}
                        value={field.value === "active"}
                        onValueChange={(newValue) => {
                          field.onChange(newValue ? "active" : "inactive");
                        }}
                        listClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <NotesSection
            inDialog={editMode || nestedForm}
            control={form.control}
            title={t("Documents.form.notes.label")}
          />
        </form>
      </Form>
    </div>
  );
}
