import { Plus, Users, Building2, Briefcase, Package, MapPin } from "lucide-react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import CustomPageMeta from "@/components/landing/CustomPageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import PageTitle from "@/components/ui/page-title";
import { Skeleton } from "@/components/ui/skeleton";

import { useBranches } from "@/hooks/useBranches";
import { useClients } from "@/hooks/useClients";
import { useCompanies } from "@/hooks/useCompanies";
import { useDepartments } from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { useJobs } from "@/hooks/useJobs";
import { useOffices } from "@/hooks/useOffices";
import { useVendors } from "@/hooks/useVendors";
import { useWarehouses } from "@/hooks/useWarehouses";
import useUserStore from "@/stores/use-user-store";
import { createClient } from "@/utils/supabase/component";

interface DashboardStats {
  totalInvoices: number;
  totalProducts: number;
  totalRevenue: number;
  pendingInvoices: number;
  totalEmployees: number;
  totalDepartments: number;
  totalJobs: number;
  totalClients: number;
  totalCompanies: number;
  totalVendors: number;
  totalOffices: number;
  totalWarehouses: number;
  totalBranches: number;
}

export default function Dashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalEmployees: 0,
    totalDepartments: 0,
    totalJobs: 0,
    totalClients: 0,
    totalCompanies: 0,
    totalVendors: 0,
    totalOffices: 0,
    totalWarehouses: 0,
    totalBranches: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();
  const router = useRouter();
  const { user } = useUserStore();

  // Use our existing hooks
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: jobs } = useJobs();
  const { data: clients } = useClients();
  const { data: companies } = useCompanies();
  const { data: vendors } = useVendors();
  const { data: offices } = useOffices();
  const { data: warehouses } = useWarehouses();
  const { data: branches } = useBranches();

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

  // Fetch dashboard stats
  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardStats() {
      if (!isMounted || !user?.id) {
        console.log("[Dashboard] Skipping fetch - conditions not met:", {
          isMounted,
          hasUser: !!user?.id,
        });
        return;
      }

      console.log("[Dashboard] Starting stats fetch for user:", user.id);
      setLoading(true);
      setError(null);

      try {
        // Fetch total invoices and revenue
        const { data: invoiceStats, error: invoiceError } = await supabase
          .from("invoices")
          .select("id, total, status")
          .eq("user_id", user.id);

        if (invoiceError) throw invoiceError;

        // Fetch total products
        const { count: productCount, error: productError } = await supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        if (productError) throw productError;

        if (!isMounted) return;

        const totalRevenue =
          invoiceStats?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
        const pendingInvoices =
          invoiceStats?.filter((invoice) => invoice.status.toLowerCase() === "pending").length || 0;

        setStats({
          totalInvoices: invoiceStats?.length || 0,
          totalProducts: productCount || 0,
          totalRevenue,
          pendingInvoices,
          totalEmployees: employees?.length || 0,
          totalDepartments: departments?.length || 0,
          totalJobs: jobs?.length || 0,
          totalClients: clients?.length || 0,
          totalCompanies: companies?.length || 0,
          totalVendors: vendors?.length || 0,
          totalOffices: offices?.length || 0,
          totalWarehouses: warehouses?.length || 0,
          totalBranches: branches?.length || 0,
        });
      } catch (err) {
        console.error("[Dashboard] Error fetching stats:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "An error occurred while fetching dashboard stats",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, [
    user?.id,
    employees,
    departments,
    jobs,
    clients,
    companies,
    vendors,
    offices,
    warehouses,
    branches,
  ]);

  if (error) {
    return (
      <div>
        <CustomPageMeta title={t("Dashboard.title")} description={t("Dashboard.description")} />
        <PageTitle title={t("Dashboard.title")} />
        <div className="p-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CustomPageMeta title={t("Dashboard.title")} description={t("Dashboard.description")} />
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
                  <Plus className="me-2 h-4 w-4" />
                  {item.label}
                </div>
              )}
            />
          </div>
        }
      />
      <div className="space-y-8 p-4">
        {/* Sales & Revenue Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Dashboard.sales_and_revenue")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/invoices">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {t("Invoices.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                  )}
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
                    {t("Products.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Revenue.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-1/2" />
                ) : (
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Revenue.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-1/2" />
                ) : (
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Invoices.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-1/2" />
                ) : (
                  <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1)}%{" "}
                  {t("Dashboard.of_total")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contacts Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Contacts.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/clients">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <Users className="me-2 h-4 w-4" />
                    {t("Clients.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalClients}</div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/companies">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <Building2 className="me-2 h-4 w-4" />
                    {t("Companies.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/vendors">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <Package className="me-2 h-4 w-4" />
                    {t("Vendors.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalVendors}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Locations Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Locations.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/offices">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <MapPin className="me-2 h-4 w-4" />
                    {t("Offices.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalOffices}</div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/warehouses">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <MapPin className="me-2 h-4 w-4" />
                    {t("Warehouses.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalWarehouses}</div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/branches">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <MapPin className="me-2 h-4 w-4" />
                    {t("Branches.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalBranches}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Human Resources Section */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("HumanResources.title")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/employees">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <Users className="me-2 h-4 w-4" />
                    {t("Employees.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/departments">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <Building2 className="me-2 h-4 w-4" />
                    {t("Departments.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/jobs">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm font-medium text-gray-500">
                    <Briefcase className="me-2 h-4 w-4" />
                    {t("Jobs.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-1/2" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("Invoices.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <p className="text-sm text-gray-500">{t("Invoices.title")}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Dashboard.popular_products")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <p className="text-sm text-gray-500">{t("Dashboard.popular_products_list")}</p>
              )}
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
