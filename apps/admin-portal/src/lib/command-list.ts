import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  CircleDollarSign,
  FileText,
  Calendar,
  Settings,
  Filter,
  FileInput,
  Warehouse,
  Store,
} from "lucide-react";

export const commandList = [
  {
    heading: "Administration.title",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard.title",
        shortcut: "⌘D",
        href: "/dashboard",
      },
      {
        icon: Users,
        label: "Clients.title",
        shortcut: "⌘C",
        href: "/clients",
      },
      // Vendors
      {
        icon: Users,
        label: "Vendors.title",
        shortcut: "⌘V",
        href: "/vendors",
      },
    ],
  },
  {
    heading: "Sales.title",
    items: [
      {
        icon: FileText,
        label: "Invoices.title",
        shortcut: "⌘I",
        href: "/invoices",
      },
      {
        icon: FileInput,
        label: "Quotes.title",
        shortcut: "⌘Q",
        href: "/quotes",
      },

      {
        icon: Filter,
        label: "Products.title",
        shortcut: "⌘P",
        href: "/products",
      },
    ],
  },
  {
    heading: "Locations.title",
    items: [
      {
        icon: Building2,
        label: "Offices.title",
        shortcut: "⌘O",
        href: "/offices",
      },
      {
        icon: Warehouse,
        label: "Warehouses.title",
        shortcut: "⌘W",
        href: "/warehouses",
      },
      {
        icon: Store,
        label: "Branches.title",
        shortcut: "⌘B",
        href: "/branches",
      },
    ],
  },
  {
    heading: "HumanResources.title",
    items: [
      {
        icon: Briefcase,
        label: "Employees.title",
        shortcut: "⌘E",
        href: "/employees",
      },
      {
        icon: Briefcase,
        label: "Jobs.title",
        shortcut: "⌘J",
        href: "/jobs",
      },
      {
        icon: Building2,
        label: "HumanResources.title",
        shortcut: "⌘E",
        href: "/employees",
      },
      {
        icon: Building2,
        label: "Departments.title",
        shortcut: "⌘D",
        href: "/departments",
      },
      {
        icon: CircleDollarSign,
        label: "Expenses.title",
        shortcut: "⌘X",
        href: "/expenses",
      },
    ],
  },
  {
    heading: "Navigation.organization",
    items: [
      {
        icon: Building2,
        label: "Companies.title",
        shortcut: "⌘O",
        href: "/companies",
      },
      {
        icon: Settings,
        label: "Settings.title",
        shortcut: "⌘S",
        href: "/settings",
      },
    ],
  },
];
