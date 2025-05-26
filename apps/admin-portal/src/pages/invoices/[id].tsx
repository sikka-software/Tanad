import { pick } from "lodash";
import { CalendarIcon, Download } from "lucide-react";
import { GetServerSideProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import PageTitle from "@/ui/page-title";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";

import { createClient } from "@/utils/supabase/server-props";

import { ZatcaComplianceBadge } from "@/components/zatca/ZatcaComplianceBadge";
import { ZatcaQRCode } from "@/components/zatca/ZatcaQRCode";

import { getNotesValue } from "@/lib/utils";
import { generateZatcaXml } from "@/lib/zatca/zatca-xml";

import { useInvoiceById } from "@/invoice/invoice.hooks";

import { useClient } from "@/modules/client/client.hooks";

export default function InvoiceDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const router = useRouter();
  const { id } = router.query;
  const { data: invoice, isLoading, error } = useInvoiceById(id as string);
  const [isGeneratingXml, setIsGeneratingXml] = useState(false);
  const [clientData, setClientData] = useState<any>(null);

  // Fetch client data if needed
  const { data: clientFromHook } = useClient(invoice?.client_id || "");

  useEffect(() => {
    if (invoice?.client) {
      // Client data is already included in the invoice
      setClientData(invoice.client);
    } else if (clientFromHook && invoice?.client_id) {
      // Client data fetched separately
      setClientData(clientFromHook);
    }
  }, [invoice, clientFromHook]);

  console.log("invoice", invoice);
  // Debug client data availability
  console.log(
    "Client info:",
    invoice?.client,
    "Client ID:",
    invoice?.client_id,
    "Fetched client:",
    clientData,
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="mt-8 grid grid-cols-1 gap-6">
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container py-8" dir={dir}>
        <h1 className="text-2xl font-bold">{t("Invoices.detail_notFound")}</h1>
        <p className="text-muted-foreground mt-4">{t("Invoices.detail.notFoundDescription")}</p>
      </div>
    );
  }

  // Use clientData for display and XML generation
  const client = clientData || invoice.client;

  const handleDownloadXml = () => {
    if (!invoice) return;

    setIsGeneratingXml(true);

    try {
      // Generate ZATCA XML
      const xmlData = generateZatcaXml({
        invoiceNumber: invoice.invoice_number,
        issueDate: invoice.issue_date || "",
        dueDate: invoice.due_date || undefined,
        invoiceType: "SIMPLIFIED",

        sellerName: invoice.seller_name || "Default Company",
        sellerVatNumber: invoice.vat_number || "000000000000000",
        sellerAddress: {
          countryCode: "SA",
          city: "Riyadh",
          postalCode: "12345",
        },

        buyerName: client?.name || "Client",
        buyerVatNumber: client?.additional_number || undefined,
        buyerAddress: client
          ? {
              street: client.street_name || "",
              city: client.city || "",
              countryCode: client.country || "SA",
            }
          : undefined,
        items: invoice.items
          ? invoice.items.map((item) => ({
              name: item.description || "Item",
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              vatRate: (invoice.tax_rate || 0) * 100,
              vatAmount: item.unit_price * item.quantity * (invoice.tax_rate || 0),
              subtotal: item.unit_price * item.quantity,
              total: item.unit_price * item.quantity * (1 + (invoice.tax_rate || 0)),
            }))
          : [],

        subtotal: invoice.subtotal || 0,
        vatAmount: invoice.tax_amount || 0,
        total: invoice.total || 0,
      });

      // Create a download link
      const element = document.createElement("a");
      const file = new Blob([xmlData], { type: "application/xml" });
      element.href = URL.createObjectURL(file);
      element.download = `zatca-invoice-${invoice.invoice_number}.xml`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success(t("Invoices.zatca.xmlSuccess"), {
        description: t("Invoices.zatca.xmlSuccessDescription"),
      });
    } catch (error) {
      console.error("Failed to generate ZATCA XML:", error);
      toast.error(t("Invoices.zatca.xmlError"), {
        description: t("Invoices.zatca.xmlErrorDescription"),
      });
    } finally {
      setIsGeneratingXml(false);
    }
  };

  return (
    <div dir={dir}>
      <PageTitle
        formButtons
        formId="invoice-form"
        loading={isLoading}
        onCancel={() => router.push("/invoices")}
        texts={{
          title: `${t("Invoices.detail.invoiceHash")}${invoice.invoice_number}`,
          submit_form: t("Invoices.detail.edit"),
          cancel: t("Invoices.detail.cancel"),
        }}
      />

      <div className="p-4 flex flex-col gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("Pages.Invoices.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground text-sm font-medium">
                    {t("Invoices.detail.invoiceNumber")}
                  </div>
                  <div className="font-medium">{invoice.invoice_number}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm font-medium">
                    {t("Invoices.detail.status")}
                  </div>
                  <div className="font-medium capitalize">
                    {t(`Invoices.form.status.${invoice.status}`)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm font-medium">
                    {t("Invoices.detail.issueDate")}
                  </div>
                  <div className="flex items-center font-medium">
                    <CalendarIcon className={`${locale === "ar" ? "ml-1" : "mr-1"} h-3 w-3`} />
                    {new Date(invoice.issue_date || "").toLocaleDateString(
                      locale === "ar" ? "ar-SA" : "en-US",
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm font-medium">
                    {t("Invoices.detail.dueDate")}
                  </div>
                  <div className="flex items-center font-medium">
                    <CalendarIcon className={`${locale === "ar" ? "ml-1" : "mr-1"} h-3 w-3`} />
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString(
                          locale === "ar" ? "ar-SA" : "en-US",
                        )
                      : t("Invoices.detail.na")}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <div className="text-muted-foreground text-sm font-medium">
                  {t("Invoices.detail.client")}
                </div>
                <div className="font-medium">
                  {client?.name || t("Invoices.detail.unknownClient")}
                </div>
                {client?.email && <div className="text-sm">{client.email}</div>}
                {client?.phone && <div className="text-sm">{client.phone}</div>}
                {client?.additional_number && (
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-1">
                      {t("Clients.vat_number", { fallback: "VAT Number" })}:
                    </span>
                    {client.additional_number}
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <div className="text-muted-foreground mb-2 text-sm font-medium">
                  {t("Invoices.detail.items")}
                </div>

                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground bg-muted text-left text-xs">
                      <tr>
                        <th className="p-2 font-medium">{t("Invoices.detail.description")}</th>
                        <th className="p-2 font-medium">{t("Invoices.detail.quantity")}</th>
                        <th className="p-2 font-medium">{t("Invoices.detail.unitPrice")}</th>
                        <th className="p-2 font-medium">{t("Invoices.detail.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{item.description}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">{item.unit_price.toFixed(2)}</td>
                            <td className="p-2">{(item.quantity * item.unit_price).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-muted-foreground p-4 text-center">
                            No items found for this invoice
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-end">
                <div className="grid w-64 grid-cols-2 gap-2">
                  <div className="text-right text-sm">{t("Invoices.detail.subtotal")}:</div>
                  <div className="text-right text-sm font-medium">
                    {(invoice.subtotal || 0).toFixed(2)}
                  </div>
                  <div className="text-right text-sm">
                    {t("Invoices.detail.vat")} ({((invoice.tax_rate || 0) * 100).toFixed(0)}%):
                  </div>
                  <div className="text-right text-sm font-medium">
                    {(invoice.tax_amount || 0).toFixed(2)}
                  </div>
                  <div className="text-right font-medium">{t("Invoices.detail.total")}:</div>
                  <div className="text-right font-bold">{(invoice.total || 0).toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* {invoice.zatca_enabled && ( */}
            <Card className="border-green-100 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800">{t("Invoices.zatca.information")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center pt-2">
                  <ZatcaQRCode
                    sellerName={invoice.seller_name || ""}
                    vatNumber={invoice.vat_number || ""}
                    invoiceTimestamp={invoice.issue_date || ""}
                    invoiceTotal={invoice.total || 0}
                    vatAmount={invoice.tax_amount || 0}
                    size={150}
                  />
                  <div className="mt-2 text-xs text-green-700">
                    {t("Invoices.zatca.compliantQR")}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div>
                    <div className="text-muted-foreground text-sm font-medium">
                      {t("Invoices.zatca.sellerName")}
                    </div>
                    <div className="text-sm font-semibold text-green-800">
                      {invoice.seller_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm font-medium">
                      {t("Invoices.zatca.vatNumber")}
                    </div>
                    <div className="text-sm font-semibold text-green-800">{invoice.vat_number}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <ZatcaComplianceBadge invoice={invoice} />
                </div>

                <div className="pt-2">
                  <button
                    className="text-primary hover:text-primary/90 flex w-full items-center justify-center rounded-md border border-green-300 bg-green-50 py-2 text-sm font-medium transition-colors"
                    onClick={handleDownloadXml}
                    disabled={isGeneratingXml}
                  >
                    {isGeneratingXml ? (
                      t("Invoices.zatca.generatingXml")
                    ) : (
                      <>
                        <Download className={`${locale === "ar" ? "ml-2" : "mr-2"} h-4 w-4`} />
                        {t("Invoices.zatca.downloadXml")}
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          {/* )} */}

          {/* ZATCA Phase 2 Section */}
          <ZatcaPhase2Section
            invoiceData={{
              invoiceNumber: invoice.invoice_number,
              issueDate: invoice.issue_date || "",
              dueDate: invoice.due_date || undefined,
              sellerName: invoice.seller_name || "Default Company",
              sellerVatNumber: invoice.vat_number || "000000000000000",
              buyerName: client?.name || "Client",
              buyerVatNumber: client?.additional_number || undefined,
              items: invoice.items
                ? invoice.items.map((item) => ({
                    name: item.description || "Item",
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    vatRate: (invoice.tax_rate || 0) * 100,
                    vatAmount: item.unit_price * item.quantity * (invoice.tax_rate || 0),
                    subtotal: item.unit_price * item.quantity,
                    total: item.unit_price * item.quantity * (1 + (invoice.tax_rate || 0)),
                  }))
                : [],
              subtotal: invoice.subtotal || 0,
              vatAmount: invoice.tax_amount || 0,
              total: invoice.total || 0,
            }}
            enabled={true} // You can make this conditional based on invoice.zatca_enabled
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t("Invoices.detail.notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.notes ? (
                <div className="text-sm">{getNotesValue(invoice.notes)}</div>
              ) : (
                <div className="text-muted-foreground text-sm">{t("Invoices.detail.noNotes")}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

InvoiceDetailPage.messages = ["Metadata", "Notes", "Pages", "Invoices", "General"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, locale, req, res } = context;
  const invoice_id = params?.id as string;

  if (!invoice_id) {
    return { notFound: true };
  }

  const supabase = createClient({ req, res, query: {}, resolvedUrl: "" });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(">>> Supabase auth error:", userError);
    return { notFound: true };
  }

  try {
    const invoiceData = await supabase.from("invoices").select("*").eq("id", invoice_id).single();

    if (!invoiceData) {
      return { notFound: true };
    }

    return {
      props: {
        messages: pick(
          (await import(`../../../locales/${locale}.json`)).default,
          InvoiceDetailPage.messages,
        ),
      },
    };
  } catch (error) {
    console.error(">>> Error fetching invoice details directly:", error);
    return { notFound: true };
  }
};
