import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  LayoutDashboard,
  Package,
  File,
  BarChart,
  CreditCard,
} from "lucide-react";

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
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      // groupLabel: "Main",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          translationKey: "Dashboard.title",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
        {
          href: "/analytics",
          label: "Analytics",
          translationKey: "Analytics.title",
          icon: BarChart,
          active: pathname === "/analytics",
        },
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
        {
          href: "/contacts",
          label: "Contacts",
          translationKey: "Contacts.title",
          icon: Users,
          active: pathname === "/contacts",
          submenus: [
            {
              href: "/contacts",
              label: "All Contacts",
              translationKey: "Contacts.allContacts",
              active: pathname === "/contacts",
              plusAction: "/contacts/add",
            },
            {
              href: "/clients",
              label: "Clients",
              translationKey: "Clients.title",
              active: pathname === "/clients",
              plusAction: "/clients/add",
            },
            {
              href: "/vendors",
              label: "Vendors",
              translationKey: "Vendors.title",
              active: pathname === "/vendors",
              plusAction: "/vendors/add",
            },
          ],
        },
        {
          href: "/locations",
          label: "Locations",
          translationKey: "Locations.title",
          icon: LayoutGrid,
          active: pathname.startsWith("/warehouses") || pathname.startsWith("/branches"),
          submenus: [
            {
              href: "/warehouses",
              label: "Warehouses",
              translationKey: "Warehouses.title",
              active: pathname.startsWith("/warehouses"),
              plusAction: "/warehouses/add",
            },
            {
              href: "/branches",
              label: "Branches",
              translationKey: "Branches.title",
              active: pathname.startsWith("/branches"),
              plusAction: "/branches/add",
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Human Resources",
      menus: [
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

            // requests
            {
              href: "/requests",
              label: "Requests",
              translationKey: "Requests.title",
              active: pathname === "/requests",
            },
            // applications
          ],
        },
        {
          href: "/applicants",
          label: "Applicants",
          translationKey: "Applicants.title",
          icon: Users,
          active: pathname === "/applicants",
        },
        {
          href: "/attendance",
          label: "Attendance",
          translationKey: "Attendance.title",
          icon: Tag,
          active: pathname === "/attendance",
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
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
      ],
    },
  ];
}
