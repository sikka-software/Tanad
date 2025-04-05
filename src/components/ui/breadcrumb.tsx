import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";

import { ChevronRight } from "lucide-react";

// Define route mappings
type RouteMap = {
  [key: string]: {
    label: string;
    translationKey?: string;
  };
};

// Main route mapping
const routeMap: RouteMap = {
  "/dashboard": { label: "Dashboard", translationKey: "Dashboard.title" },
  "/invoices": { label: "Invoices", translationKey: "Invoices.title" },
  "/clients": { label: "Clients", translationKey: "Clients.title" },
  "/products": { label: "Products", translationKey: "Products.title" },
  "/settings": { label: "Settings", translationKey: "Settings.title" },
};

// Dynamic route patterns and their handling
const dynamicRoutePatterns = [
  {
    pattern: /^\/invoices\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/invoices", labelKey: "Invoices.title" },
      { path: "/invoices/add", labelKey: "Invoices.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/invoices\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/invoices", labelKey: "Invoices.title" },
      { path: "", labelKey: "Invoices.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/clients\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/clients", labelKey: "Clients.title" },
      { path: "/clients/add", labelKey: "Clients.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/clients\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/clients", labelKey: "Clients.title" },
      { path: "", labelKey: "Clients.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/products\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/products", labelKey: "Products.title" },
      { path: "/products/add", labelKey: "Products.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/products\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/products", labelKey: "Products.title" },
      { path: "", labelKey: "Products.edit", isActive: true },
    ],
  },
];

export function Breadcrumb() {
  const router = useRouter();
  const t = useTranslations();
  const getT = (ns: string) => useTranslations(ns);

  // Generate breadcrumbs based on the current path
  const getBreadcrumbs = () => {
    const { pathname } = router;

    // Check for dynamic route patterns first
    for (const { pattern, breadcrumbs } of dynamicRoutePatterns) {
      if (pattern.test(pathname)) {
        return breadcrumbs.map((crumb) => ({
          ...crumb,
          label:
            crumb.label ||
            (crumb.labelKey
              ? getT(crumb.labelKey.split(".")[0])(crumb.labelKey.split(".")[1])
              : ""),
        }));
      }
    }

    // Handle static routes
    if (routeMap[pathname]) {
      const breadcrumbs = [];

      // Always add dashboard
      if (pathname !== "/") {
        breadcrumbs.push({
          path: "/dashboard",
          label: t("Dashboard.title"),
          isActive: false,
        });
      }

      // Add current page
      breadcrumbs.push({
        path: pathname,
        label: routeMap[pathname].translationKey
          ? getT(routeMap[pathname].translationKey!.split(".")[0])(
              routeMap[pathname].translationKey!.split(".")[1],
            )
          : routeMap[pathname].label,
        isActive: true,
      });

      return breadcrumbs;
    }

    // Default to just showing dashboard
    return [
      {
        path: "/dashboard",
        label: t("Dashboard.title"),
        isActive: pathname === "/",
      },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className="text-muted-foreground flex items-center space-x-1 px-4 py-2 text-sm"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="text-muted-foreground/60 mx-1 h-4 w-4 rtl:rotate-180" />
          )}

          {crumb.isActive ? (
            <span className="text-foreground truncate font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.path} className="hover:text-foreground truncate transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
