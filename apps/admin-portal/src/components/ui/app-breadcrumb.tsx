import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";

import { routeMap } from "@/lib/breadcrumbs-list";
import { dynamicRoutePatterns } from "@/lib/breadcrumbs-list";

export function AppBreadcrumb() {
  const router = useRouter();
  const t = useTranslations();

  // Rather than creating a new translation context, handle namespace translation differently
  const getTranslatedKey = (key: string) => {
    console.log("key", key);
    if (!key) return "";

    const [namespace, translationKey, translationSubKey] = key.split(".");
    // Use the default t function if no namespace is provided
    if (!translationKey) {
      return t(key);
    }

    try {
      // Try to use the namespace and key directly from the base t function
      return t(`${namespace}.${translationKey}${translationSubKey ? `.${translationSubKey}` : ""}`);
    } catch (error) {
      // Fallback to just the key if namespace doesn't exist
      return translationKey;
    }
  };

  // Generate breadcrumbs based on the current path
  const getBreadcrumbs = () => {
    const { pathname } = router;

    // Check for dynamic route patterns first
    for (const { pattern, breadcrumbs } of dynamicRoutePatterns) {
      if (pattern.test(pathname)) {
        return breadcrumbs.map((crumb) => ({
          ...crumb,
          label: crumb.labelKey ? getTranslatedKey(crumb.labelKey) : "",
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
          label: t("Pages.Dashboard.title"),
          is_active: false,
        });
      }

      // Add current page
      breadcrumbs.push({
        path: pathname,
        label: routeMap[pathname].translationKey
          ? getTranslatedKey(routeMap[pathname].translationKey!)
          : routeMap[pathname].label,
        is_active: true,
      });

      return breadcrumbs;
    }

    // Default to just showing dashboard
    return [
      {
        path: "/dashboard",
        label: t("Pages.Dashboard.title"),
        is_active: pathname === "/",
      },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  // if (breadcrumbs.length <= 1) {
  //   return null;
  // }

  return (
    <nav
      className="text-muted-foreground flex items-center space-x-1 p-0 px-2 text-sm"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="text-muted-foreground/60 mx-1 h-4 w-4 rtl:rotate-180" />
          )}

          {crumb.is_active ? (
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
