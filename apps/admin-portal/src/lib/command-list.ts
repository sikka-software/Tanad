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
        icon: ModulesOptions.analytics.icon,
        label: ModulesOptions.analytics.label,
        shortcut: "⌘A",
        href: ModulesOptions.analytics.url,
      },
      {
        icon: ModulesOptions.activity_logs.icon,
        label: ModulesOptions.activity_logs.label,
        shortcut: "⌘L",
        href: ModulesOptions.activity_logs.url,
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
        icon: ModulesOptions.employee_requests.icon,
        label: ModulesOptions.employee_requests.label,
        shortcut: "⌘R",
        href: ModulesOptions.employee_requests.url,
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
    heading: "Internet.title",
    items: [
      {
        icon: ModulesOptions.domains.icon,
        label: ModulesOptions.domains.label,
        shortcut: "⌘D",
        href: ModulesOptions.domains.url,
      },

      {
        icon: ModulesOptions.websites.icon,
        label: ModulesOptions.websites.label,
        shortcut: "⌘W",
        href: ModulesOptions.websites.url,
      },
      {
        icon: ModulesOptions.online_stores.icon,
        label: ModulesOptions.online_stores.label,
        shortcut: "⌘O",
        href: ModulesOptions.online_stores.url,
      },
      {
        icon: ModulesOptions.servers.icon,
        label: ModulesOptions.servers.label,
        shortcut: "⌘S",
        href: ModulesOptions.servers.url,
      },
    ],
  },
  {
    heading: "Fleet.title",
    items: [
      {
        icon: ModulesOptions.cars.icon,
        label: ModulesOptions.cars.label,
        shortcut: "⌘D",
        href: ModulesOptions.cars.url,
      },

      {
        icon: ModulesOptions.trucks.icon,
        label: ModulesOptions.trucks.label,
        shortcut: "⌘T",
        href: ModulesOptions.trucks.url,
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
