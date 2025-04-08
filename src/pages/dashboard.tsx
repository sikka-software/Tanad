import { useEffect, useState } from "react";

import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";

import { Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import PageTitle from "@/components/ui/page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
  totalInvoices: number;
  totalProducts: number;
  totalRevenue: number;
  pendingInvoices: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();
  const router = useRouter();

  const createOptions = [
    {
      label: t("Dashboard.add_product"),
      value: "product",
      path: "/products/add",
    },
    {
      label: t("Dashboard.add_invoice"),
      value: "invoice",
      path: "/invoices/add",
    },
    { label: t("Dashboard.add_client"), value: "client", path: "/clients/add" },
    {
      label: t("Dashboard.add_employee"),
      value: "employee",
      path: "/employees/add",
    },
    {
      label: t("Dashboard.add_warehouse"),
      value: "warehouse",
      path: "/warehouses/add",
    },
  ];

  const handleCreateOption = (value: string) => {
    const option = createOptions.find((opt) => opt.value === value);
    if (option) {
      router.push(option.path);
    }
  };

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        // Fetch total invoices and revenue
        const { data: invoiceStats, error: invoiceError } = await supabase
          .from("invoices")
          .select("id, total, status");

        if (invoiceError) throw invoiceError;

        // Fetch total products
        const { count: productCount, error: productError } = await supabase
          .from("products")
          .select("id", { count: "exact" });

        if (productError) throw productError;

        const totalRevenue =
          invoiceStats?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
        const pendingInvoices =
          invoiceStats?.filter((invoice) => invoice.status.toLowerCase() === "pending").length || 0;

        setStats({
          totalInvoices: invoiceStats?.length || 0,
          totalProducts: productCount || 0,
          totalRevenue,
          pendingInvoices,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred while fetching dashboard stats",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="">
        <PageTitle title={t("Dashboard.title")} />{" "}
        <div className="p-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto">
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <PageTitle
        title={t("Dashboard.title")}
        customButton={
          <div className="flex items-center">
            <Combobox
              data={createOptions}
              onChange={handleCreateOption}
              texts={{
                placeholder: t("Dashboard.select_create_option"),
                noItems: t("General.no_results"),
                searchPlaceholder: t("General.search"),
              }}
              width="fit"
              inputProps={{
                className: "focus:ring-0",
              }}
              renderSelected={(item) => (
                <div className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  {item.label}
                </div>
              )}
            />
          </div>
        }
      />
      <div className="p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/invoices">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Dashboard.total_invoices")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                <p className="mt-1 text-xs text-gray-500">
                  {stats.pendingInvoices} {t("Dashboard.pending")}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Dashboard.total_products")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                {t("Dashboard.total_revenue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                {t("Dashboard.pending_invoices")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
              <p className="mt-1 text-xs text-gray-500">
                {((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1)}
                {t("Dashboard.of_total")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("Dashboard.recent_invoices")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{t("Dashboard.recent_invoices_list")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Dashboard.popular_products")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{t("Dashboard.popular_products_list")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
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
