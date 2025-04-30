import {
  Users,
  Settings,
  LucideIcon,
  LayoutDashboard,
  Package,
  BarChart,
  CreditCard,
  Briefcase,
  MapPin,
  SaudiRiyal,
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

type Submenu = {
  href: string;
  label: string;
  translationKey: string;
  active?: boolean;
  plusAction?: string;
};

type Menu = {
  href: string;
  label: string;
  translationKey: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel?: string;
  groupLabelTranslationKey?: string;
  icon: LucideIcon;
  menus: Menu[];
};

type SimplifiedMenuItem = {
  title: string;
  items?: SimplifiedMenuItem[];
};

type SimplifiedMenu = {
  group: string;
  items: SimplifiedMenuItem[];
};

let simplifiedMenu: SimplifiedMenu = {
  group: "Administration",
  items: [
    { title: "Dashboard" },
    { title: "Analytics" },
    {
      title: "Contacts",
      items: [
        { title: "All Contacts" },
        { title: "Companies" },
        { title: "Clients" },
        { title: "Vendors" },
      ],
    },
    {
      title: "Locations",
      items: [{ title: "Offices" }, { title: "Warehouses" }, { title: "Branches" }],
    },
    {
      title: "Sales",
      items: [{ title: "Products" }, { title: "Invoices" }, { title: "Quotes" }],
    },
    {
      title: "Human Resources",
      items: [{ title: "Employees" }, { title: "Departments" }, { title: "Salaries" }],
    },
    {
      title: "Settings",
      items: [{ title: "Users" }, { title: "Billing" }, { title: "Settings" }],
    },
  ],
};

// Main menu items
function getAdministrationMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: "Dashboard",
      translationKey: "Dashboard.title",
      url: "/dashboard",
      icon: LayoutDashboard,
      is_active: pathname.startsWith("/dashboard"),
    },
    {
      title: "Analytics",
      translationKey: "Analytics.title",
      url: "/analytics",
      icon: BarChart,
      is_active: pathname.startsWith("/analytics"),
      requiredPermission: "analytics.read",
    },

    {
      title: "Contacts",
      translationKey: "Contacts.title",
      url: "/contacts",
      icon: Users,
      is_active: pathname.startsWith("/contacts"),
      requiredPermission: "contacts.read",
      items: [
        {
          title: "All Contacts",
          translationKey: "Contacts.all",
          is_active: pathname === "/contacts",
          url: "/contacts",
          requiredPermission: "contacts.read",
        },
        {
          title: "Companies",
          translationKey: "Companies.title",
          is_active: pathname === "/companies",
          action: "/companies/add",
          url: "/companies",
          requiredPermission: "companies.read",
        },
        {
          title: "Clients",
          translationKey: "Clients.title",
          is_active: pathname.startsWith("/clients"),
          action: "/clients/add",
          url: "/clients",
          requiredPermission: "clients.read",
        },
        {
          title: "Vendors",
          translationKey: "Vendors.title",
          is_active: pathname.startsWith("/vendors"),
          action: "/vendors/add",
          url: "/vendors",
          requiredPermission: "vendors.read",
        },
      ],
    },
    {
      title: "Locations",
      translationKey: "Locations.title",
      url: "/locations",
      icon: MapPin,
      is_active: pathname.startsWith("/warehouses") || pathname.startsWith("/branches"),
      items: [
        {
          title: "Offices",
          translationKey: "Offices.title",
          url: "/offices",
          action: "/offices/add",
          is_active: pathname.startsWith("/offices"),
          requiredPermission: "offices.read",
        },
        {
          title: "Warehouses",
          translationKey: "Warehouses.title",
          url: "/warehouses",
          action: "/warehouses/add",
          is_active: pathname.startsWith("/warehouses"),
          requiredPermission: "warehouses.read",
        },
        {
          title: "Branches",
          translationKey: "Branches.title",
          url: "/branches",
          action: "/branches/add",
          is_active: pathname.startsWith("/branches"),
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
      title: "Sales",
      translationKey: "Sales.title",
      url: "",
      icon: SaudiRiyal,
      is_active: pathname.startsWith("/products"),
      items: [
        {
          title: "Invoices",
          translationKey: "Invoices.title",
          is_active: pathname.startsWith("/invoices"),
          url: "/invoices",
          action: "/invoices/add",
          requiredPermission: "invoices.read",
        },
        {
          title: "Quotes",
          translationKey: "Quotes.title",
          is_active: pathname.startsWith("/quotes"),
          url: "/quotes",
          action: "/quotes/add",
          requiredPermission: "quotes.read",
        },
        {
          title: "Expenses",
          translationKey: "Expenses.title",
          is_active: pathname.startsWith("/expenses"),
          url: "/expenses",
          action: "/expenses/add",
          requiredPermission: "expenses.read",
        },
      ],
    },
    {
      title: "Storage",
      translationKey: "Storage.title",
      url: "",
      icon: Package,
      is_active: pathname.startsWith("/products"),
      items: [
        {
          title: "Purchases",
          translationKey: "Purchases.title",
          is_active: pathname.startsWith("/purchases"),
          url: "/purchases",
          action: "/purchases/add",
          requiredPermission: "purchases.read",
        },
        {
          title: "Products",
          translationKey: "Products.title",
          is_active: pathname.startsWith("/products"),
          url: "/products",
          action: "/products/add",
          requiredPermission: "products.read",
        },
        {
          title: "Warehouses",
          translationKey: "Warehouses.title",
          is_active: pathname.startsWith("/warehouses"),
          url: "/warehouses",
          action: "/warehouses/add",
          requiredPermission: "warehouses.read",
        },
      ],
    },
  ];
}

// HR menu items
function getHrMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: "Employees",
      translationKey: "Employees.title",
      url: "",
      icon: Users,
      is_active: pathname.startsWith("/employees"),
      requiredPermission: "human_resources.read",
      items: [
        {
          title: "All Employees",
          translationKey: "Employees.allEmployees",
          url: "/employees",
          action: "/employees/add",
          is_active: pathname === "/employees",
          requiredPermission: "employees.read",
        },
        {
          title: "Departments",
          translationKey: "Departments.title",
          url: "/departments",
          action: "/departments/add",
          is_active: pathname.startsWith("/departments"),
          requiredPermission: "departments.read",
        },
        {
          title: "Salaries",
          translationKey: "Salaries.title",
          url: "/salaries",
          action: "/salaries/add",
          is_active: pathname === "/salaries",
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
          title: "Employee Requests",
          translationKey: "EmployeeRequests.title",
          url: "/employee-requests",
          action: "/employee-requests/add",
          is_active: pathname.startsWith("/employee-requests"),
          requiredPermission: "employee_requests.read",
        },
      ],
    },
    {
      title: "Recruitment",
      translationKey: "Recruitment.title",
      url: "",
      icon: Briefcase,
      is_active: pathname.startsWith("/recruitment"),
      requiredPermission: "recruitment.read",
      items: [
        {
          title: "Job Listing",
          translationKey: "JobListings.title",
          url: "/jobs/listings",
          action: "/jobs/listings/add",
          is_active: pathname === "/jobs/listings",
          requiredPermission: "job_listings.read",
        },
        {
          title: "Jobs",
          translationKey: "Jobs.title",
          url: "/jobs",
          action: "/jobs/add",
          is_active: pathname === "/jobs",
          requiredPermission: "jobs.read",
        },
        {
          title: "Applicants",
          translationKey: "Applicants.title",
          url: "/applicants",
          action: "/applicants/add",
          is_active: pathname === "/applicants",
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
// Settings menu items
function getSettingsMenus(pathname: string): SidebarMenuGroupProps["items"] {
  return [
    {
      title: "Users",
      translationKey: "Users.title",
      icon: Users,
      url: "/users",
      is_active: pathname === "/users",
    },
    {
      title: "Roles",
      translationKey: "Roles.title",
      icon: Users,
      url: "/roles",
      is_active: pathname === "/roles",
    },
    {
      title: "Billing",
      translationKey: "Billing.title",
      icon: CreditCard,
      url: "/billing",
      is_active: pathname === "/billing",
    },
    {
      title: "Settings",
      translationKey: "Settings.title",
      icon: Settings,
      url: "/settings",
      is_active: pathname === "/settings",
    },
  ];
}

export function getMenuList(pathname?: string): Record<string, SidebarMenuGroupProps["items"]> {
  return {
    Administration: getAdministrationMenus(pathname || ""),
    Accounting: getAccountingMenus(pathname || ""),
    HumanResources: getHrMenus(pathname || ""),
    Settings: getSettingsMenus(pathname || ""),
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

// Mapper function to convert simplified menu to the existing format
function mapSimplifiedMenuToSidebarMenu(
  menu: SimplifiedMenu,
  pathname: string = "",
): Record<string, SidebarMenuGroupProps["items"]> {
  const getIcon = (title: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      Dashboard: LayoutDashboard,
      Analytics: BarChart,
      Contacts: Users,
      Locations: MapPin,
      Sales: Package,
      "Human Resources": Users,
      Settings: Settings,
      Billing: CreditCard,
    };
    return iconMap[title] || Users; // Default to Users icon if not found
  };

  const mapMenuItem = (
    item: SimplifiedMenuItem,
    parentUrl: string = "",
  ): SidebarMenuGroupProps["items"][0] => {
    const baseUrl = parentUrl || `/${item.title.toLowerCase().replace(/\s+/g, "-")}`;
    const mappedItem = {
      title: item.title,
      translationKey: `${item.title.replace(/\s+/g, "")}.title`,
      url: baseUrl,
      icon: getIcon(item.title),
      is_active: pathname.startsWith(baseUrl),
    };

    if (item.items) {
      return {
        ...mappedItem,
        items: item.items.map((subItem) => ({
          title: subItem.title,
          translationKey: `${subItem.title.replace(/\s+/g, "")}.title`,
          url: `${baseUrl}${subItem.title === "All " + item.title ? "" : "/" + subItem.title.toLowerCase().replace(/\s+/g, "-")}`,
          action: `${baseUrl}${subItem.title === "All " + item.title ? "" : "/" + subItem.title.toLowerCase().replace(/\s+/g, "-")}/add`,
          is_active: pathname.startsWith(
            `${baseUrl}${subItem.title === "All " + item.title ? "" : "/" + subItem.title.toLowerCase().replace(/\s+/g, "-")}`,
          ),
        })),
      };
    }

    return mappedItem;
  };

  const result: Record<string, SidebarMenuGroupProps["items"]> = {
    [menu.group]: menu.items.map((item) => mapMenuItem(item)),
  };

  return result;
}

// Example usage:
// const mappedMenu = mapSimplifiedMenuToSidebarMenu(simplifiedMenu);
