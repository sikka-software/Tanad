import { ModulesOptions } from "@tanad.config";
import {
  Users,
  LucideIcon,
  LayoutDashboard,
  BarChart,
  MapPin,
  FileUser,
  TableOfContents,
} from "lucide-react";

export type SidebarMenuGroupProps = {
  title: string;
  items: {
    title: string;
    translationKey: string;
    url: string;
    icon?: LucideIcon;
    is_active?: boolean;
    action?: string;
    requiredPermission?: string;
    items?: {
      title: string;
      translationKey: string;
      is_active?: boolean;
      url: string;
      action?: string;
      requiredPermission?: string;
    }[];
  }[];
};

// Main menu items
function getAdministrationMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: "Dashboard",
      translationKey: "Pages.Dashboard.title",
      url: "/dashboard",
      icon: LayoutDashboard,
      is_active: pathname.startsWith("/dashboard"),
    },
    {
      title: "Analytics",
      translationKey: "Pages.Analytics.title",
      url: "/analytics",
      icon: BarChart,
      is_active: pathname.startsWith("/analytics"),
      requiredPermission: "analytics.read",
    },
    {
      title: "Activity Logs",
      translationKey: "Pages.ActivityLogs.title",
      url: "/activity",
      icon: TableOfContents,
      is_active: pathname.startsWith("/activity"),
      requiredPermission: "activity_logs.read",
    },

    {
      title: "Contacts",
      translationKey: "Pages.Contacts.title",
      url: "/contacts",
      icon: Users,
      is_active: pathname.startsWith("/contacts"),
      requiredPermission: "contacts.read",
      items: [
        // {
        //   title: "All Contacts",
        //   translationKey: "Pages.Contacts.all",
        //   is_active: pathname === "/contacts",
        //   url: "/contacts",
        //   requiredPermission: "contacts.read",
        // },
        {
          title: ModulesOptions.individuals.label,
          translationKey: ModulesOptions.individuals.label,
          is_active: pathname.startsWith(ModulesOptions.individuals.url),
          action: ModulesOptions.individuals.url + "/add",
          url: ModulesOptions.individuals.url,
          requiredPermission: "individuals.read",
        },
        {
          title: ModulesOptions.companies.label,
          translationKey: ModulesOptions.companies.label,
          is_active: pathname.startsWith(ModulesOptions.companies.url),
          action: ModulesOptions.companies.url + "/add",
          url: ModulesOptions.companies.url,
          requiredPermission: "companies.read",
        },
        {
          title: ModulesOptions.clients.label,
          translationKey: ModulesOptions.clients.label,
          is_active: pathname.startsWith(ModulesOptions.clients.url),
          action: ModulesOptions.clients.url + "/add",
          url: ModulesOptions.clients.url,
          requiredPermission: "clients.read",
        },
        {
          title: ModulesOptions.vendors.label,
          translationKey: ModulesOptions.vendors.label,
          is_active: pathname.startsWith(ModulesOptions.vendors.url),
          action: ModulesOptions.vendors.url + "/add",
          url: ModulesOptions.vendors.url,
          requiredPermission: "vendors.read",
        },
      ],
    },
    {
      title: "Locations",
      translationKey: "Pages.Locations.title",
      url: "/locations",
      icon: MapPin,
      is_active: pathname.startsWith("/warehouses") || pathname.startsWith("/branches"),
      items: [
        {
          title: ModulesOptions.offices.label,
          translationKey: ModulesOptions.offices.label,
          url: ModulesOptions.offices.url,
          action: ModulesOptions.offices.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.offices.url),
          requiredPermission: "offices.read",
        },
        {
          title: ModulesOptions.warehouses.label,
          translationKey: ModulesOptions.warehouses.label,
          url: ModulesOptions.warehouses.url,
          action: ModulesOptions.warehouses.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.warehouses.url),
          requiredPermission: "warehouses.read",
        },
        {
          title: ModulesOptions.branches.label,
          translationKey: ModulesOptions.branches.label,
          url: ModulesOptions.branches.url,
          action: ModulesOptions.branches.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.branches.url),
          requiredPermission: "branches.read",
        },
      ],
    },
  ];
}

// Accounting menu items
function getAccountingMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: ModulesOptions.sales.label,
      translationKey: ModulesOptions.sales.label,
      url: "",
      icon: ModulesOptions.sales.icon,
      is_active: pathname.startsWith("/products"),
      items: [
        {
          title: ModulesOptions.invoices.label,
          translationKey: ModulesOptions.invoices.label,
          is_active: pathname.startsWith(ModulesOptions.invoices.url),
          url: ModulesOptions.invoices.url,
          action: ModulesOptions.invoices.url + "/add",
          requiredPermission: "invoices.read",
        },
        {
          title: ModulesOptions.quotes.label,
          translationKey: ModulesOptions.quotes.label,
          is_active: pathname.startsWith(ModulesOptions.quotes.url),
          url: ModulesOptions.quotes.url,
          action: ModulesOptions.quotes.url + "/add",
          requiredPermission: "quotes.read",
        },
        {
          title: ModulesOptions.expenses.label,
          translationKey: ModulesOptions.expenses.label,
          is_active: pathname.startsWith(ModulesOptions.expenses.url),
          url: ModulesOptions.expenses.url,
          action: ModulesOptions.expenses.url + "/add",
          requiredPermission: "expenses.read",
        },
      ],
    },
    {
      title: ModulesOptions.storage.label,
      translationKey: ModulesOptions.storage.label,
      url: "",
      icon: ModulesOptions.storage.icon,
      is_active: pathname.startsWith("/products"),
      items: [
        {
          title: ModulesOptions.purchases.label,
          translationKey: ModulesOptions.purchases.label,
          is_active: pathname.startsWith(ModulesOptions.purchases.url),
          url: ModulesOptions.purchases.url,
          action: ModulesOptions.purchases.url + "/add",
          requiredPermission: "purchases.read",
        },
        {
          title: ModulesOptions.products.label,
          translationKey: ModulesOptions.products.label,
          is_active: pathname.startsWith(ModulesOptions.products.url),
          url: ModulesOptions.products.url,
          action: ModulesOptions.products.url + "/add",
          requiredPermission: "products.read",
        },
        {
          title: ModulesOptions.warehouses.label,
          translationKey: ModulesOptions.warehouses.label,
          is_active: pathname.startsWith(ModulesOptions.warehouses.url),
          url: ModulesOptions.warehouses.url,
          action: ModulesOptions.warehouses.url + "/add",
          requiredPermission: "warehouses.read",
        },
      ],
    },
    {
      title: ModulesOptions.bank_accounts.label,
      translationKey: ModulesOptions.bank_accounts.label,
      url: ModulesOptions.bank_accounts.url,
      icon: ModulesOptions.bank_accounts.icon,
      is_active: pathname.startsWith(ModulesOptions.bank_accounts.url),
    },
  ];
}

// HR menu items
function getHrMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: ModulesOptions.employees.label,
      translationKey: ModulesOptions.employees.label,
      url: ModulesOptions.employees.url,
      icon: ModulesOptions.employees.icon,
      is_active: pathname.startsWith(ModulesOptions.employees.url),
      requiredPermission: "human_resources.read",
      items: [
        {
          title: ModulesOptions.employees.label,
          translationKey: "Pages.Employees.all",
          url: ModulesOptions.employees.url,
          action: ModulesOptions.employees.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.employees.url),
          requiredPermission: "employees.read",
        },
        {
          title: ModulesOptions.departments.label,
          translationKey: ModulesOptions.departments.label,
          url: ModulesOptions.departments.url,
          action: ModulesOptions.departments.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.departments.url),
          requiredPermission: "departments.read",
        },
        {
          title: ModulesOptions.salaries.label,
          translationKey: ModulesOptions.salaries.label,
          url: ModulesOptions.salaries.url,
          action: ModulesOptions.salaries.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.salaries.url),
          requiredPermission: "salaries.read",
        },
        // {
        //   title: "Leave",
        //   translationKey: "Leave.title",
        //   url: "/leave",
        //   action: "/leave/add",
        //   is_active: pathname === "/leave",
        // },
        // {
        //   title: "Holidays",
        //   translationKey: "Holidays.title",
        //   url: "/holidays",
        //   action: "/holidays/add",
        //   is_active: pathname === "/holidays",
        // },
        // {
        //   title: "Reports",
        //   translationKey: "Reports.title",
        //   url: "/reports",
        //   is_active: pathname === "/reports",
        // },
        {
          title: ModulesOptions.employee_requests.label,
          translationKey: ModulesOptions.employee_requests.label,
          url: ModulesOptions.employee_requests.url,
          action: ModulesOptions.employee_requests.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.employee_requests.url),
          requiredPermission: "employee_requests.read",
        },
      ],
    },
    {
      title: ModulesOptions.recruitment.label,
      translationKey: ModulesOptions.recruitment.label,
      url: "",
      icon: FileUser,
      is_active: pathname.startsWith("/recruitment"),
      requiredPermission: "recruitment.read",
      items: [
        {
          title: ModulesOptions.job_listings.label,
          translationKey: ModulesOptions.job_listings.label,
          url: ModulesOptions.job_listings.url,
          action: ModulesOptions.job_listings.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.job_listings.url),
          requiredPermission: "job_listings.read",
        },
        {
          title: ModulesOptions.jobs.label,
          translationKey: ModulesOptions.jobs.label,
          url: ModulesOptions.jobs.url,
          action: ModulesOptions.jobs.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.jobs.url),
          requiredPermission: "jobs.read",
        },
        {
          title: ModulesOptions.applicants.label,
          translationKey: ModulesOptions.applicants.label,
          url: ModulesOptions.applicants.url,
          action: ModulesOptions.applicants.url + "/add",
          is_active: pathname.startsWith(ModulesOptions.applicants.url),
          requiredPermission: "applicants.read",
        },
      ],
    },

    // {
    //   href: "/attendance",
    //   label: "Attendance",
    //   translationKey: "Attendance.title",
    //   icon: Tag,
    //   active: pathname === "/attendance",
    // },
  ];
}
// Internet menu items
function getInternetMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: ModulesOptions.domains.label,
      translationKey: ModulesOptions.domains.label,
      url: ModulesOptions.domains.url,
      icon: ModulesOptions.domains.icon,
      action: ModulesOptions.domains.url + "/add",
      is_active: pathname.startsWith(ModulesOptions.domains.url),
      requiredPermission: "domains.read",
    },
    {
      title: ModulesOptions.servers.label,
      translationKey: ModulesOptions.servers.label,
      url: ModulesOptions.servers.url,
      icon: ModulesOptions.servers.icon,
      action: ModulesOptions.servers.url + "/add",
      is_active: pathname.startsWith(ModulesOptions.servers.url),
    },
    {
      title: ModulesOptions.websites.label,
      translationKey: ModulesOptions.websites.label,
      url: ModulesOptions.websites.url,
      icon: ModulesOptions.websites.icon,
      action: ModulesOptions.websites.url + "/add",
      is_active: pathname.startsWith(ModulesOptions.websites.url),
      requiredPermission: "websites.read",
    },
    {
      title: ModulesOptions.online_stores.label,
      translationKey: ModulesOptions.online_stores.label,
      url: ModulesOptions.online_stores.url,
      icon: ModulesOptions.online_stores.icon,
      action: ModulesOptions.online_stores.url + "/add",
      is_active: pathname.startsWith(ModulesOptions.online_stores.url),
      requiredPermission: "online_stores.read",
    },
  ];
}
// System admin menu items
function getSystemAdminMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: ModulesOptions.documents.label,
      translationKey: ModulesOptions.documents.label,
      url: ModulesOptions.documents.url,
      icon: ModulesOptions.documents.icon,
      is_active: pathname.startsWith(ModulesOptions.documents.url),
      requiredPermission: "documents.read",
    },
    {
      title: ModulesOptions.users.label,
      translationKey: ModulesOptions.users.label,
      icon: ModulesOptions.users.icon,
      url: ModulesOptions.users.url,
      is_active: pathname.startsWith(ModulesOptions.users.url),
      requiredPermission: "users.read",
    },
    {
      title: ModulesOptions.roles.label,
      translationKey: ModulesOptions.roles.label,
      icon: ModulesOptions.roles.icon,
      url: ModulesOptions.roles.url,
      is_active: pathname.startsWith(ModulesOptions.roles.url),
      requiredPermission: "roles.read",
    },
  ];
}

function getFleetMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: ModulesOptions.vehicles.label,
      translationKey: ModulesOptions.vehicles.label,
      icon: ModulesOptions.vehicles.icon,
      url: ModulesOptions.vehicles.url,
      is_active: pathname.startsWith(ModulesOptions.vehicles.url),
      action: ModulesOptions.vehicles.url + "/add",
    },
    {
      title: ModulesOptions.drivers.label,
      translationKey: ModulesOptions.drivers.label,
      icon: ModulesOptions.drivers.icon,
      url: ModulesOptions.drivers.url,
      is_active: pathname.startsWith(ModulesOptions.drivers.url),
      action: ModulesOptions.drivers.url + "/add",
    },
    // {
    //   title: ModulesOptions.cars.label,
    //   translationKey: ModulesOptions.cars.label,
    //   icon: ModulesOptions.cars.icon,
    //   url: ModulesOptions.cars.url,
    //   is_active: pathname.startsWith(ModulesOptions.cars.url),
    //   action: ModulesOptions.cars.url + "/add",
    // },
    // {
    //   title: ModulesOptions.trucks.label,
    //   translationKey: ModulesOptions.trucks.label,
    //   icon: ModulesOptions.trucks.icon,
    //   url: ModulesOptions.trucks.url,
    //   is_active: pathname.startsWith(ModulesOptions.trucks.url),
    //   action: ModulesOptions.trucks.url + "/add",
    // },
  ];
}

export function getMenuList(pathname?: string): Record<string, SidebarMenuGroupProps["items"]> {
  return {
    Administration: getAdministrationMenus(pathname || ""),
    Accounting: getAccountingMenus(pathname || ""),
    HumanResources: getHrMenus(pathname || ""),
    Internet: getInternetMenus(pathname || ""),
    Fleet: getFleetMenus(pathname || ""),
    SystemAdmin: getSystemAdminMenus(pathname || ""),
  };
}

/**
 * Apply custom order from user preferences to the default menu list
 * @param defaultMenuList - The default menu list from getMenuList
 * @param savedNavigation - The saved navigation order from user settings
 * @returns A new menu list with items reordered according to saved preferences
 */
export function applyCustomMenuOrder(
  defaultMenuList: Record<string, SidebarMenuGroupProps["items"]>,
  savedNavigation: Record<string, Array<{ title: string }>>,
): Record<string, SidebarMenuGroupProps["items"]> {
  const resultMenu = { ...defaultMenuList };

  // For each group in the saved navigation
  Object.keys(savedNavigation).forEach((groupName) => {
    if (defaultMenuList[groupName] && savedNavigation[groupName]) {
      // Create an array to hold the reordered items
      const orderedItems: SidebarMenuGroupProps["items"] = [];

      // First add items that exist in both saved navigation and default menu
      savedNavigation[groupName].forEach((savedItem: { title: string }) => {
        const originalItem = defaultMenuList[groupName].find(
          (item) => item.title === savedItem.title,
        );
        if (originalItem) {
          orderedItems.push(originalItem);
        }
      });

      // Then add any items that exist in the default menu but not in saved navigation
      defaultMenuList[groupName].forEach((defaultItem) => {
        if (!orderedItems.some((item) => item.title === defaultItem.title)) {
          orderedItems.push(defaultItem);
        }
      });

      // Replace the default menu with the ordered one
      resultMenu[groupName] = orderedItems;
    }
  });

  return resultMenu;
}
