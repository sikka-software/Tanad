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
  Landmark,
  User,
} from "lucide-react";

export type TanadModules =
  | "dashboard"
  | "analytics"
  | "activity_logs"
  | "users"
  | "roles"
  | "sales"
  | "job_listings"
  | "companies"
  | "applicants"
  | "purchases"
  | "clients"
  | "vendors"
  | "invoices"
  | "quotes"
  | "products"
  | "offices"
  | "warehouses"
  | "branches"
  | "employees"
  | "departments"
  | "employee_requests"
  | "jobs"
  | "expenses"
  | "salaries"
  | "settings"
  | "internet"
  | "websites"
  | "servers"
  | "domains"
  | "online_stores"
  | "vehicles"
  | "cars"
  | "drivers"
  | "trucks"
  | "storage"
  | "recruitment"
  | "bank_accounts"
  | "individuals"
  | "documents";

const ModulesOptions: Record<
  TanadModules,
  {
    icon: LucideIcon;
    label: string;
    translationKey: string;
    url: string;
    category: string;
    dashboardOptions?: {
      size?: "sm" | "md" | "lg";
    };
  }
> = {
  users: {
    icon: UserRoundCog,
    label: "Pages.Users.title",
    translationKey: "Pages.Users.title",
    url: "/users",
    category: "Administration",
    dashboardOptions: {
      size: "sm",
    },
  },
  roles: {
    icon: ShieldPlus,
    label: "Pages.Roles.title",
    translationKey: "Pages.Roles.title",
    url: "/roles",
    category: "Administration",
    dashboardOptions: {
      size: "sm",
    },
  },
  documents: {
    icon: FileText,
    label: "Pages.Documents.title",
    translationKey: "Pages.Documents.title",
    url: "/documents",
    category: "Administration",
  },
  dashboard: {
    icon: LayoutDashboard,
    label: "Pages.Dashboard.title",
    translationKey: "Pages.Dashboard.title",
    url: "/dashboard",
    category: "",
  },
  analytics: {
    icon: BarChart,
    label: "Pages.Analytics.title",
    translationKey: "Pages.Analytics.title",
    url: "/analytics",
    category: "",
  },
  activity_logs: {
    icon: TableOfContents,
    label: "Pages.ActivityLogs.title",
    translationKey: "Pages.ActivityLogs.title",
    url: "/activity",
    category: "",
  },
  sales: {
    icon: SaudiRiyal,
    label: "Pages.Sales.title",
    translationKey: "Pages.Sales.title",
    url: "/sales",
    category: "Finance",
  },
  job_listings: {
    icon: Briefcase,
    label: "Pages.JobListings.title",
    translationKey: "Pages.JobListings.title",
    url: "/job_listings",
    category: "HumanResources",
  },
  companies: {
    icon: Building2,
    label: "Pages.Companies.title",
    translationKey: "Pages.Companies.title",
    url: "/companies",
    category: "CRM",
  },
  applicants: {
    icon: Users,
    label: "Pages.Applicants.title",
    translationKey: "Pages.Applicants.title",
    url: "/applicants",
    category: "HumanResources",
  },
  purchases: {
    icon: ShoppingCart,
    label: "Pages.Purchases.title",
    translationKey: "Pages.Purchases.title",
    url: "/purchases",
    category: "Finance",
  },
  clients: {
    icon: Users,
    label: "Pages.Clients.title",
    translationKey: "Pages.Clients.title",
    url: "/clients",
    category: "CRM",
  },
  vendors: {
    icon: Users,
    label: "Pages.Vendors.title",
    translationKey: "Pages.Vendors.title",
    url: "/vendors",
    category: "CRM",
  },
  invoices: {
    icon: FileText,
    label: "Pages.Invoices.title",
    translationKey: "Pages.Invoices.title",
    url: "/invoices",
    category: "Finance",
  },
  quotes: {
    icon: FileInput,
    label: "Pages.Quotes.title",
    translationKey: "Pages.Quotes.title",
    url: "/quotes",
    category: "Finance",
  },
  products: {
    icon: Filter,
    label: "Pages.Products.title",
    translationKey: "Pages.Products.title",
    url: "/products",
    category: "Operations",
  },
  offices: {
    icon: Building2,
    label: "Pages.Offices.title",
    translationKey: "Pages.Offices.title",
    url: "/offices",
    category: "Operations",
  },
  warehouses: {
    icon: Warehouse,
    label: "Pages.Warehouses.title",
    translationKey: "Pages.Warehouses.title",
    url: "/warehouses",
    category: "Operations",
  },
  branches: {
    icon: Store,
    label: "Pages.Branches.title",
    translationKey: "Pages.Branches.title",
    url: "/branches",
    category: "Operations",
  },
  employees: {
    icon: BriefcaseBusiness,
    label: "Pages.Employees.title",
    translationKey: "Pages.Employees.title",
    url: "/employees",
    category: "HumanResources",
  },
  departments: {
    icon: Building2,
    label: "Pages.Departments.title",
    translationKey: "Pages.Departments.title",
    url: "/departments",
    category: "HumanResources",
  },
  employee_requests: {
    icon: Briefcase,
    label: "Pages.EmployeeRequests.title",
    translationKey: "Pages.EmployeeRequests.title",
    url: "/employee_requests",
    category: "HumanResources",
  },
  jobs: {
    icon: Briefcase,
    label: "Pages.Jobs.title",
    translationKey: "Pages.Jobs.title",
    url: "/jobs",
    category: "HumanResources",
  },
  expenses: {
    icon: CircleDollarSign,
    label: "Pages.Expenses.title",
    translationKey: "Pages.Expenses.title",
    url: "/expenses",
    category: "Finance",
  },
  salaries: {
    icon: SaudiRiyal,
    label: "Pages.Salaries.title",
    translationKey: "Pages.Salaries.title",
    url: "/salaries",
    category: "Finance",
  },

  settings: {
    icon: Settings,
    label: "Pages.Settings.title",
    translationKey: "Pages.Settings.title",
    url: "/settings",
    category: "Administration",
  },
  internet: {
    icon: Globe,
    label: "Pages.Internet.title",
    translationKey: "Pages.Internet.title",
    url: "/internet",
    category: "IT",
  },
  websites: {
    icon: Globe,
    label: "Pages.Websites.title",
    translationKey: "Pages.Websites.title",
    url: "/websites",
    category: "IT",
  },
  servers: {
    icon: Server,
    label: "Pages.Servers.title",
    translationKey: "Pages.Servers.title",
    url: "/servers",
    category: "IT",
  },
  domains: {
    icon: Link,
    label: "Pages.Domains.title",
    translationKey: "Pages.Domains.title",
    url: "/domains",
    category: "IT",
  },
  online_stores: {
    icon: Store,
    label: "Pages.OnlineStores.title",
    translationKey: "Pages.OnlineStores.title",
    url: "/online_stores",
    category: "IT",
  },
  vehicles: {
    icon: Car,
    label: "Pages.Vehicles.title",
    translationKey: "Pages.Vehicles.title",
    url: "/vehicles",
    category: "Fleet",
  },
  cars: {
    icon: Car,
    label: "Pages.Cars.title",
    translationKey: "Pages.Cars.title",
    url: "/cars",
    category: "Fleet",
  },
  drivers: {
    icon: User,
    label: "Pages.Drivers.title",
    translationKey: "Pages.Drivers.title",
    url: "/drivers",
    category: "Fleet",
  },
  trucks: {
    icon: Truck,
    label: "Pages.Trucks.title",
    translationKey: "Pages.Trucks.title",
    url: "/trucks",
    category: "Fleet",
  },
  storage: {
    icon: Package,
    label: "Pages.Storage.title",
    translationKey: "Pages.Storage.title",
    url: "/storage",
    category: "Operations",
  },
  recruitment: {
    icon: Briefcase,
    label: "Pages.Recruitment.title",
    translationKey: "Pages.Recruitment.title",
    url: "/recruitment",
    category: "HumanResources",
  },
  bank_accounts: {
    icon: Landmark,
    label: "Pages.BankAccounts.title",
    translationKey: "Pages.BankAccounts.title",
    url: "/bank_accounts",
    category: "Finance",
  },
  individuals: {
    icon: User,
    label: "Pages.Individuals.title",
    translationKey: "Pages.Individuals.title",
    url: "/individuals",
    category: "Finance",
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
