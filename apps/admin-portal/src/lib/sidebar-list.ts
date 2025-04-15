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
    isActive?: boolean;
    action?: string;
    items?: {
      title: string;
      translationKey: string;
      isActive?: boolean;
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
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      title: "Analytics",
      translationKey: "Analytics.title",
      url: "/analytics",
      icon: BarChart,
      isActive: pathname.startsWith("/analytics"),
    },

    {
      title: "Contacts",
      translationKey: "Contacts.title",
      url: "/contacts",
      icon: Users,
      isActive: pathname.startsWith("/contacts"),
      items: [
        {
          title: "All Contacts",
          translationKey: "Contacts.all",
          isActive: pathname === "/contacts",
          url: "/contacts",
        },
        {
          title: "Companies",
          translationKey: "Companies.title",
          isActive: pathname === "/companies",
          action: "/companies/add",
          url: "/companies",
        },
        {
          title: "Clients",
          translationKey: "Clients.title",
          isActive: pathname.startsWith("/clients"),
          action: "/clients/add",
          url: "/clients",
        },
        {
          title: "Vendors",
          translationKey: "Vendors.title",
          isActive: pathname.startsWith("/vendors"),
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
      isActive: pathname.startsWith("/warehouses") || pathname.startsWith("/branches"),
      items: [
        {
          title: "Offices",
          translationKey: "Offices.title",
          url: "/offices",
          action: "/offices/add",
          isActive: pathname.startsWith("/offices"),
        },
        {
          title: "Warehouses",
          translationKey: "Warehouses.title",
          url: "/warehouses",
          action: "/warehouses/add",
          isActive: pathname.startsWith("/warehouses"),
        },
        {
          title: "Branches",
          translationKey: "Branches.title",
          url: "/branches",
          action: "/branches/add",
          isActive: pathname.startsWith("/branches"),
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
      isActive: pathname.startsWith("/products"),
      items: [
        {
          title: "Products",
          translationKey: "Products.title",
          isActive: pathname.startsWith("/products"),
          url: "/products",
          action: "/products/add",
        },
        {
          title: "Invoices",
          translationKey: "Invoices.title",
          isActive: pathname.startsWith("/invoices"),
          url: "/invoices",
          action: "/invoices/add",
        },
        {
          title: "Quotes",
          translationKey: "Quotes.title",
          isActive: pathname.startsWith("/quotes"),
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
      isActive: pathname.startsWith("/employees"),
      items: [
        {
          title: "All Employees",
          translationKey: "Employees.allEmployees",
          url: "/employees",
          action: "/employees/add",
          isActive: pathname === "/employees",
        },
        {
          title: "Departments",
          translationKey: "Departments.title",
          url: "/departments",
          action: "/departments/add",
          isActive: pathname.startsWith("/departments"),
        },
        {
          title: "Salaries",
          translationKey: "Salaries.title",
          url: "/salaries",
          action: "/salaries/add",
          isActive: pathname === "/salaries",
        },
        {
          title: "Leave",
          translationKey: "Leave.title",
          url: "/leave",
          action: "/leave/add",
          isActive: pathname === "/leave",
        },
        {
          title: "Holidays",
          translationKey: "Holidays.title",
          url: "/holidays",
          action: "/holidays/add",
          isActive: pathname === "/holidays",
        },
        {
          title: "Reports",
          translationKey: "Reports.title",
          url: "/reports",
          isActive: pathname === "/reports",
        },
        {
          title: "Requests",
          translationKey: "Requests.title",
          url: "/employees/requests",
          action: "/employees/requests/add",
          isActive: pathname.startsWith("/employees/requests"),
        },
      ],
    },
    {
      title: "Recruitment",
      translationKey: "Recruitment.title",
      url: "",
      icon: Briefcase,
      isActive: pathname.startsWith("/recruitment"),
      items: [
        {
          title: "Job Listing",
          translationKey: "JobListings.title",
          url: "/jobs/listings",
          action: "/jobs/listings/add",
          isActive: pathname === "/jobs/listings",
        },
        {
          title: "Jobs",
          translationKey: "Jobs.title",
          url: "/jobs",
          action: "/jobs/add",
          isActive: pathname === "/jobs",
        },
        {
          title: "Applicants",
          translationKey: "Applicants.title",
          url: "/applicants",
          action: "/applicants/add",
          isActive: pathname === "/applicants",
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
      isActive: pathname === "/users",
    },
    {
      title: "Billing",
      translationKey: "Billing.title",
      icon: CreditCard,
      url: "/billing",
      isActive: pathname === "/billing",
    },
    {
      title: "Account",
      translationKey: "Account.title",
      icon: Settings,
      url: "/account",
      isActive: pathname === "/account",
    },
  ];
}

export function getMenuList(pathname: string) {
  return {
    Administration: getAdministrationMenus(pathname),
    Accounting: getAccountingMenus(pathname),
    HumanResources: getHrMenus(pathname),
    Settings: getSettingsMenus(pathname),
  };
}
