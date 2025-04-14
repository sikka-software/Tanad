import {
  Tag,
  Users,
  Settings,
  LayoutGrid,
  LucideIcon,
  LayoutDashboard,
  Package,
  BarChart,
  CreditCard,
  Briefcase,
  Building2,
  SaudiRiyal,
  File,
  SquareTerminal,
  Settings2,
  BookOpen,
  Bot,
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
      isActive: pathname === "/dashboard",
    },
    {
      title: "Analytics",
      translationKey: "Analytics.title",
      url: "/analytics",
      icon: BarChart,
      isActive: pathname === "/analytics",
    },

    {
      title: "Contacts",
      translationKey: "Contacts.title",
      url: "/contacts",
      icon: Users,
      isActive: pathname === "/contacts",
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
          url: "/companies",
        },
        {
          title: "Clients",
          translationKey: "Clients.title",
          isActive: pathname === "/clients",
          url: "/clients",
        },
        {
          title: "Vendors",
          translationKey: "Vendors.title",
          isActive: pathname === "/vendors",
          action: "/vendors/add",
          url: "/vendors",
        },
      ],
    },
    {
      title: "Locations",
      translationKey: "Locations.title",
      url: "/locations",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/warehouses") || pathname.startsWith("/branches"),
    },
  ];
}

// Accounting menu items
function getAccountingMenus(pathname: string) {
  return [
    {
      href: "/products",
      label: "Sales",
      translationKey: "Sales.title",
      icon: Package,
      active: pathname === "/products",
      submenus: [
        {
          href: "/products",
          label: "Products",
          translationKey: "Products.title",
          active: pathname === "/products",
          plusAction: "/products/add",
        },
        {
          href: "/invoices",
          label: "Invoices",
          translationKey: "Invoices.title",
          active: pathname === "/invoices",
          plusAction: "/invoices/add",
        },
        {
          href: "/quotes",
          label: "Quotes",
          translationKey: "Quotes.title",
          active: pathname === "/quotes",
          plusAction: "/quotes/add",
        },
      ],
    },
  ];
}

// HR menu items
function getHrMenus(pathname: string) {
  return [
    {
      href: "",
      label: "Employees",
      translationKey: "Employees.title",
      icon: Users,
      active: pathname.startsWith("/employees"),
      submenus: [
        {
          href: "/employees",
          label: "All Employees",
          translationKey: "Employees.allEmployees",
          plusAction: "/employees/add",
          active: pathname === "/employees",
        },
        {
          href: "/salaries",
          label: "Salaries",
          translationKey: "Salaries.title",
          active: pathname === "/salaries",
        },
        {
          href: "/leave",
          label: "Leave",
          translationKey: "Leave.title",
          active: pathname === "/leave",
        },
        {
          href: "/holidays",
          label: "Holidays",
          translationKey: "Holidays.title",
          active: pathname === "/holidays",
        },
        {
          href: "/reports",
          label: "Reports",
          translationKey: "Reports.title",
          active: pathname === "/reports",
        },
        {
          href: "/requests",
          label: "Requests",
          translationKey: "Requests.title",
          active: pathname === "/requests",
        },
      ],
    },
    {
      href: "",
      label: "Recruitment",
      translationKey: "Recruitment.title",
      icon: Briefcase,
      active: pathname.startsWith("/recruitment"),
      submenus: [
        {
          href: "/job-listing",
          label: "Job Listing",
          translationKey: "JobListing.title",
          active: pathname === "/job-listing",
        },
        {
          href: "/jobs",
          label: "Jobs",
          translationKey: "Jobs.title",
          plusAction: "/jobs/add",
          active: pathname === "/jobs",
        },
        {
          href: "/applicants",
          label: "Applicants",
          translationKey: "Applicants.title",
          active: pathname === "/applicants",
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
function getSettingsMenus(pathname: string) {
  return [
    {
      href: "/users",
      label: "Users",
      translationKey: "Users.title",
      icon: Users,
      active: pathname === "/users",
    },
    {
      href: "/billing",
      label: "Billing",
      translationKey: "Billing.title",
      icon: CreditCard,
      active: pathname === "/billing",
    },
    {
      href: "/account",
      label: "Account",
      translationKey: "Account.title",
      icon: Settings,
      active: pathname === "/account",
    },
  ];
}

export function getRegularMenuList(pathname: string): {
  // href: string;
  // label: string;
  // translationKey: string;
  // icon: LucideIcon;
  // active: boolean;
  // submenus?: Submenu[];
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}[] {
  return [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ];
}
export function getMenuList(pathname: string) {
  // return [
  return {
    Administration: getAdministrationMenus(pathname),
    Accounting: getAccountingMenus(pathname),
    HumanResources: getHrMenus(pathname),
  };
}
