import { ModulesOptions } from "../../tanad.config";

export const commandList = [
  {
    heading: "Administration.title",
    items: [
      {
        icon: ModulesOptions.dashboard.icon,
        label: ModulesOptions.dashboard.label,
        shortcut: "⌘D",
        href: ModulesOptions.dashboard.url,
      },
      {
        icon: ModulesOptions.companies.icon,
        label: ModulesOptions.companies.label,
        shortcut: "⌘C",
        href: ModulesOptions.companies.url,
      },
      {
        icon: ModulesOptions.clients.icon,
        label: ModulesOptions.clients.label,
        shortcut: "⌘C",
        href: ModulesOptions.clients.url,
      },
      {
        icon: ModulesOptions.vendors.icon,
        label: ModulesOptions.vendors.label,
        shortcut: "⌘V",
        href: ModulesOptions.vendors.url,
      },
    ],
  },
  {
    heading: "Sales.title",
    items: [
      {
        icon: ModulesOptions.invoices.icon,
        label: ModulesOptions.invoices.label,
        shortcut: "⌘I",
        href: ModulesOptions.invoices.url,
      },
      {
        icon: ModulesOptions.quotes.icon,
        label: ModulesOptions.quotes.label,
        shortcut: "⌘Q",
        href: ModulesOptions.quotes.url,
      },

      {
        icon: ModulesOptions.products.icon,
        label: ModulesOptions.products.label,
        shortcut: "⌘P",
        href: ModulesOptions.products.url,
      },
    ],
  },
  {
    heading: "Locations.title",
    items: [
      {
        icon: ModulesOptions.offices.icon,
        label: ModulesOptions.offices.label,
        shortcut: "⌘O",
        href: ModulesOptions.offices.url,
      },
      {
        icon: ModulesOptions.warehouses.icon,
        label: ModulesOptions.warehouses.label,
        shortcut: "⌘W",
        href: ModulesOptions.warehouses.url,
      },
      {
        icon: ModulesOptions.branches.icon,
        label: ModulesOptions.branches.label,
        shortcut: "⌘B",
        href: ModulesOptions.branches.url,
      },
    ],
  },
  {
    heading: "HumanResources.title",
    items: [
      {
        icon: ModulesOptions.employees.icon,
        label: ModulesOptions.employees.label,
        shortcut: "⌘E",
        href: ModulesOptions.employees.url,
      },
      {
        icon: ModulesOptions.employeeRequests.icon,
        label: ModulesOptions.employeeRequests.label,
        shortcut: "⌘R",
        href: ModulesOptions.employeeRequests.url,
      },
      {
        icon: ModulesOptions.jobs.icon,
        label: ModulesOptions.jobs.label,
        shortcut: "⌘J",
        href: ModulesOptions.jobs.url,
      },
      {
        icon: ModulesOptions.departments.icon,
        label: ModulesOptions.departments.label,
        shortcut: "⌘D",
        href: ModulesOptions.departments.url,
      },

      {
        icon: ModulesOptions.expenses.icon,
        label: ModulesOptions.expenses.label,
        shortcut: "⌘X",
        href: ModulesOptions.expenses.url,
      },
      {
        icon: ModulesOptions.salaries.icon,
        label: ModulesOptions.salaries.label,
        shortcut: "⌘S",
        href: ModulesOptions.salaries.url,
      },
    ],
  },
  {
    heading: "Navigation.organization",
    items: [
      {
        icon: ModulesOptions.users.icon,
        label: ModulesOptions.users.label,
        shortcut: "⌘U",
        href: ModulesOptions.users.url,
      },
      {
        icon: ModulesOptions.roles.icon,
        label: ModulesOptions.roles.label,
        shortcut: "⌘R",
        href: ModulesOptions.roles.url,
      },
      {
        icon: ModulesOptions.settings.icon,
        label: ModulesOptions.settings.label,
        shortcut: "⌘S",
        href: ModulesOptions.settings.url,
      },
    ],
  },
];
