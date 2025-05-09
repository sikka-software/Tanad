import {
  Building2,
  Briefcase,
  FileInput,
  FileText,
  Filter,
  LayoutDashboard,
  ShieldPlus,
  Store,
  UserRoundCog,
  Users,
  Warehouse,
  CircleDollarSign,
  SaudiRiyal,
  Settings,
  ShoppingCart,
  BriefcaseBusiness,
  Globe,
  Server,
  Link,
  TableOfContents,
  BarChart,
  Car,
  Truck,
  Package,
  LucideIcon,
} from "lucide-react";

const ModulesOptions: Record<
  string,
  {
    icon: LucideIcon;
    label: string;
    translationKey: string;
    url: string;
  }
> = {
  dashboard: {
    icon: LayoutDashboard,
    label: "Pages.Dashboard.title",
    translationKey: "Pages.Dashboard.title",
    url: "/dashboard",
  },
  analytics: {
    icon: BarChart,
    label: "Pages.Analytics.title",
    translationKey: "Pages.Analytics.title",
    url: "/analytics",
  },
  activity_logs: {
    icon: TableOfContents,
    label: "Pages.ActivityLogs.title",
    translationKey: "Pages.ActivityLogs.title",
    url: "/activity",
  },
  sales: {
    icon: SaudiRiyal,
    label: "Pages.Sales.title",
    translationKey: "Pages.Sales.title",
    url: "/sales",
  },
  job_listings: {
    icon: Briefcase,
    label: "Pages.JobListings.title",
    translationKey: "Pages.JobListings.title",
    url: "/job_listings",
  },
  companies: {
    icon: Building2,
    label: "Pages.Companies.title",
    translationKey: "Pages.Companies.title",
    url: "/companies",
  },
  roles: {
    icon: ShieldPlus,
    label: "Pages.Roles.title",
    translationKey: "Pages.Roles.title",
    url: "/roles",
  },
  applicants: {
    icon: Users,
    label: "Pages.Applicants.title",
    translationKey: "Pages.Applicants.title",
    url: "/applicants",
  },
  purchases: {
    icon: ShoppingCart,
    label: "Pages.Purchases.title",
    translationKey: "Pages.Purchases.title",
    url: "/purchases",
  },
  clients: {
    icon: Users,
    label: "Pages.Clients.title",
    translationKey: "Pages.Clients.title",
    url: "/clients",
  },
  vendors: {
    icon: Users,
    label: "Pages.Vendors.title",
    translationKey: "Pages.Vendors.title",
    url: "/vendors",
  },
  invoices: {
    icon: FileText,
    label: "Pages.Invoices.title",
    translationKey: "Pages.Invoices.title",
    url: "/invoices",
  },
  quotes: {
    icon: FileInput,
    label: "Pages.Quotes.title",
    translationKey: "Pages.Quotes.title",
    url: "/quotes",
  },
  products: {
    icon: Filter,
    label: "Pages.Products.title",
    translationKey: "Pages.Products.title",
    url: "/products",
  },
  offices: {
    icon: Building2,
    label: "Pages.Offices.title",
    translationKey: "Pages.Offices.title",
    url: "/offices",
  },
  warehouses: {
    icon: Warehouse,
    label: "Pages.Warehouses.title",
    translationKey: "Pages.Warehouses.title",
    url: "/warehouses",
  },
  branches: {
    icon: Store,
    label: "Pages.Branches.title",
    translationKey: "Pages.Branches.title",
    url: "/branches",
  },
  employees: {
    icon: BriefcaseBusiness,
    label: "Pages.Employees.title",
    translationKey: "Pages.Employees.title",
    url: "/employees",
  },
  departments: {
    icon: Building2,
    label: "Pages.Departments.title",
    translationKey: "Pages.Departments.title",
    url: "/departments",
  },
  employee_requests: {
    icon: Briefcase,
    label: "Pages.EmployeeRequests.title",
    translationKey: "Pages.EmployeeRequests.title",
    url: "/employee_requests",
  },
  jobs: {
    icon: Briefcase,
    label: "Pages.Jobs.title",
    translationKey: "Pages.Jobs.title",
    url: "/jobs",
  },
  expenses: {
    icon: CircleDollarSign,
    label: "Pages.Expenses.title",
    translationKey: "Pages.Expenses.title",
    url: "/expenses",
  },
  salaries: {
    icon: SaudiRiyal,
    label: "Pages.Salaries.title",
    translationKey: "Pages.Salaries.title",
    url: "/salaries",
  },
  users: {
    icon: UserRoundCog,
    label: "Pages.Users.title",
    translationKey: "Pages.Users.title",
    url: "/users",
  },
  settings: {
    icon: Settings,
    label: "Pages.Settings.title",
    translationKey: "Pages.Settings.title",
    url: "/settings",
  },
  internet: {
    icon: Globe,
    label: "Pages.Internet.title",
    translationKey: "Pages.Internet.title",
    url: "/internet",
  },
  websites: {
    icon: Globe,
    label: "Pages.Websites.title",
    translationKey: "Pages.Websites.title",
    url: "/websites",
  },
  servers: {
    icon: Server,
    label: "Pages.Servers.title",
    translationKey: "Pages.Servers.title",
    url: "/servers",
  },
  domains: {
    icon: Link,
    label: "Pages.Domains.title",
    translationKey: "Pages.Domains.title",
    url: "/domains",
  },
  online_stores: {
    icon: Store,
    label: "Pages.OnlineStores.title",
    translationKey: "Pages.OnlineStores.title",
    url: "/online_stores",
  },
  cars: {
    icon: Car,
    label: "Pages.Cars.title",
    translationKey: "Pages.Cars.title",
    url: "/cars",
  },
  trucks: {
    icon: Truck,
    label: "Pages.Trucks.title",
    translationKey: "Pages.Trucks.title",
    url: "/trucks",
  },
  storage: {
    icon: Package,
    label: "Pages.Storage.title",
    translationKey: "Pages.Storage.title",
    url: "/storage",
  },
  recruitment: {
    icon: Briefcase,
    label: "Pages.Recruitment.title",
    translationKey: "Pages.Recruitment.title",
    url: "/recruitment",
  },
};

const currencies = [
  "sar",
  "usd",
  "bhd",
  "kwd",
  "qar",
  "aed",
  "omr",
  "try",
  "iqd",
  "eur",
  "gbp",
  "jpy",
] as const;

export { ModulesOptions, currencies };
