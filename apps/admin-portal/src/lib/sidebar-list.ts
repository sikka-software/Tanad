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
    items?: {
      title: string;
      translationKey: string;
      is_active?: boolean;
      url: string;
      action?: string;
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
    },

    {
      title: "Contacts",
      translationKey: "Contacts.title",
      url: "/contacts",
      icon: Users,
      is_active: pathname.startsWith("/contacts"),
      items: [
        {
          title: "All Contacts",
          translationKey: "Contacts.all",
          is_active: pathname === "/contacts",
          url: "/contacts",
        },
        {
          title: "Companies",
          translationKey: "Companies.title",
          is_active: pathname === "/companies",
          action: "/companies/add",
          url: "/companies",
        },
        {
          title: "Clients",
          translationKey: "Clients.title",
          is_active: pathname.startsWith("/clients"),
          action: "/clients/add",
          url: "/clients",
        },
        {
          title: "Vendors",
          translationKey: "Vendors.title",
          is_active: pathname.startsWith("/vendors"),
          action: "/vendors/add",
          url: "/vendors",
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
        },
        {
          title: "Warehouses",
          translationKey: "Warehouses.title",
          url: "/warehouses",
          action: "/warehouses/add",
          is_active: pathname.startsWith("/warehouses"),
        },
        {
          title: "Branches",
          translationKey: "Branches.title",
          url: "/branches",
          action: "/branches/add",
          is_active: pathname.startsWith("/branches"),
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
      icon: Package,
      is_active: pathname.startsWith("/products"),
      items: [
        {
          title: "Products",
          translationKey: "Products.title",
          is_active: pathname.startsWith("/products"),
          url: "/products",
          action: "/products/add",
        },
        {
          title: "Invoices",
          translationKey: "Invoices.title",
          is_active: pathname.startsWith("/invoices"),
          url: "/invoices",
          action: "/invoices/add",
        },
        {
          title: "Quotes",
          translationKey: "Quotes.title",
          is_active: pathname.startsWith("/quotes"),
          url: "/quotes",
          action: "/quotes/add",
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
      items: [
        {
          title: "All Employees",
          translationKey: "Employees.allEmployees",
          url: "/employees",
          action: "/employees/add",
          is_active: pathname === "/employees",
        },
        {
          title: "Departments",
          translationKey: "Departments.title",
          url: "/departments",
          action: "/departments/add",
          is_active: pathname.startsWith("/departments"),
        },
        {
          title: "Salaries",
          translationKey: "Salaries.title",
          url: "/salaries",
          action: "/salaries/add",
          is_active: pathname === "/salaries",
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
          title: "Requests",
          translationKey: "Requests.title",
          url: "/employees/requests",
          action: "/employees/requests/add",
          is_active: pathname.startsWith("/employees/requests"),
        },
      ],
    },
    {
      title: "Recruitment",
      translationKey: "Recruitment.title",
      url: "",
      icon: Briefcase,
      is_active: pathname.startsWith("/recruitment"),
      items: [
        {
          title: "Job Listing",
          translationKey: "JobListings.title",
          url: "/jobs/listings",
          action: "/jobs/listings/add",
          is_active: pathname === "/jobs/listings",
        },
        {
          title: "Jobs",
          translationKey: "Jobs.title",
          url: "/jobs",
          action: "/jobs/add",
          is_active: pathname === "/jobs",
        },
        {
          title: "Applicants",
          translationKey: "Applicants.title",
          url: "/applicants",
          action: "/applicants/add",
          is_active: pathname === "/applicants",
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
