import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
          .select("id", { count: 'exact' });

        if (productError) throw productError;

        const totalRevenue = invoiceStats?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
        const pendingInvoices = invoiceStats?.filter(invoice => invoice.status.toLowerCase() === 'pending').length || 0;

        setStats({
          totalInvoices: invoiceStats?.length || 0,
          totalProducts: productCount || 0,
          totalRevenue,
          pendingInvoices,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching dashboard stats"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/invoices">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingInvoices} pending
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Products
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
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Coming soon: Recent invoices list
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Coming soon: Popular products list
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 