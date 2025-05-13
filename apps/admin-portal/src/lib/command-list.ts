import { ModulesOptions } from "../../tanad.config";

export const commandList = [
  {
    heading: "Pages.Administration.title",
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
        addHref: ModulesOptions.companies.url + "/add",
      },
      {
        icon: ModulesOptions.clients.icon,
        label: ModulesOptions.clients.label,
        shortcut: "⌘C",
        href: ModulesOptions.clients.url,
        addHref: ModulesOptions.clients.url + "/add",
      },
      {
        icon: ModulesOptions.vendors.icon,
        label: ModulesOptions.vendors.label,
        shortcut: "⌘V",
        href: ModulesOptions.vendors.url,
        addHref: ModulesOptions.vendors.url + "/add",
      },
    ],
  },
  {
    heading: "Pages.Sales.title",
    items: [
      {
        icon: ModulesOptions.invoices.icon,
        label: ModulesOptions.invoices.label,
        shortcut: "⌘I",
        href: ModulesOptions.invoices.url,
        addHref: ModulesOptions.invoices.url + "/add",
      },
      {
        icon: ModulesOptions.quotes.icon,
        label: ModulesOptions.quotes.label,
        shortcut: "⌘Q",
        href: ModulesOptions.quotes.url,
        addHref: ModulesOptions.quotes.url + "/add",
      },

      {
        icon: ModulesOptions.products.icon,
        label: ModulesOptions.products.label,
        shortcut: "⌘P",
        href: ModulesOptions.products.url,
        addHref: ModulesOptions.products.url + "/add",
      },
    ],
  },
  {
    heading: "Pages.Locations.title",
    items: [
      {
        icon: ModulesOptions.offices.icon,
        label: ModulesOptions.offices.label,
        shortcut: "⌘O",
        href: ModulesOptions.offices.url,
        addHref: ModulesOptions.offices.url + "/add",
      },
      {
        icon: ModulesOptions.warehouses.icon,
        label: ModulesOptions.warehouses.label,
        shortcut: "⌘W",
        href: ModulesOptions.warehouses.url,
        addHref: ModulesOptions.warehouses.url + "/add",
      },
      {
        icon: ModulesOptions.branches.icon,
        label: ModulesOptions.branches.label,
        shortcut: "⌘B",
        href: ModulesOptions.branches.url,
        addHref: ModulesOptions.branches.url + "/add",
      },
    ],
  },
  {
    heading: "Pages.HumanResources.title",
    items: [
      {
        icon: ModulesOptions.employees.icon,
        label: ModulesOptions.employees.label,
        shortcut: "⌘E",
        href: ModulesOptions.employees.url,
        addHref: ModulesOptions.employees.url + "/add",
      },
      {
        icon: ModulesOptions.employee_requests.icon,
        label: ModulesOptions.employee_requests.label,
        shortcut: "⌘R",
        href: ModulesOptions.employee_requests.url,
        addHref: ModulesOptions.employee_requests.url + "/add",
      },
      {
        icon: ModulesOptions.jobs.icon,
        label: ModulesOptions.jobs.label,
        shortcut: "⌘J",
        href: ModulesOptions.jobs.url,
        addHref: ModulesOptions.jobs.url + "/add",
      },
      {
        icon: ModulesOptions.departments.icon,
        label: ModulesOptions.departments.label,
        shortcut: "⌘D",
        href: ModulesOptions.departments.url,
        addHref: ModulesOptions.departments.url + "/add",
      },

      {
        icon: ModulesOptions.expenses.icon,
        label: ModulesOptions.expenses.label,
        shortcut: "⌘X",
        href: ModulesOptions.expenses.url,
        addHref: ModulesOptions.expenses.url + "/add",
      },
      {
        icon: ModulesOptions.salaries.icon,
        label: ModulesOptions.salaries.label,
        shortcut: "⌘S",
        href: ModulesOptions.salaries.url,
        addHref: ModulesOptions.salaries.url + "/add",
      },
    ],
  },
  {
    heading: "Pages.Internet.title",
    items: [
      {
        icon: ModulesOptions.domains.icon,
        label: ModulesOptions.domains.label,
        shortcut: "⌘D",
        href: ModulesOptions.domains.url,
        addHref: ModulesOptions.domains.url + "/add",
      },

      {
        icon: ModulesOptions.websites.icon,
        label: ModulesOptions.websites.label,
        shortcut: "⌘W",
        href: ModulesOptions.websites.url,
        addHref: ModulesOptions.websites.url + "/add",
      },
      {
        icon: ModulesOptions.online_stores.icon,
        label: ModulesOptions.online_stores.label,
        shortcut: "⌘O",
        href: ModulesOptions.online_stores.url,
        addHref: ModulesOptions.online_stores.url + "/add",
      },
      {
        icon: ModulesOptions.servers.icon,
        label: ModulesOptions.servers.label,
        shortcut: "⌘S",
        href: ModulesOptions.servers.url,
        addHref: ModulesOptions.servers.url + "/add",
      },
    ],
  },
  {
    heading: "Pages.Fleet.title",
    items: [
      {
        icon: ModulesOptions.cars.icon,
        label: ModulesOptions.cars.label,
        shortcut: "⌘D",
        href: ModulesOptions.cars.url,
        addHref: ModulesOptions.cars.url + "/add",
      },

      {
        icon: ModulesOptions.trucks.icon,
        label: ModulesOptions.trucks.label,
        shortcut: "⌘T",
        href: ModulesOptions.trucks.url,
        addHref: ModulesOptions.trucks.url + "/add",
      },
    ],
  },
  {
    heading: "Pages.SystemAdmin.title",
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
