// Define route mappings
type RouteMap = {
  [key: string]: {
    label: string;
    translationKey?: string;
  };
};

// Main route mapping
export const routeMap: RouteMap = {
  "/dashboard": { label: "Pages.Dashboard.title", translationKey: "Pages.Dashboard.title" },
  "/activity": { label: "Pages.ActivityLogs.title", translationKey: "Pages.ActivityLogs.title" },
  "/analytics": { label: "Pages.Analytics.title", translationKey: "Pages.Analytics.title" },
  "/settings": { label: "Pages.Settings.title", translationKey: "Pages.Settings.title" },
  "/roles": { label: "Pages.Roles.title", translationKey: "Pages.Roles.title" },
  "/users": { label: "Pages.Users.title", translationKey: "Pages.Users.title" },

  "/invoices": { label: "Pages.Invoices.title", translationKey: "Pages.Invoices.title" },
  "/quotes": { label: "Pages.Quotes.title", translationKey: "Pages.Quotes.title" },
  "/companies": { label: "Pages.Companies.title", translationKey: "Pages.Companies.title" },
  "/clients": { label: "Pages.Clients.title", translationKey: "Pages.Clients.title" },
  "/products": { label: "Pages.Products.title", translationKey: "Pages.Products.title" },
  "/employees": { label: "Pages.Employees.title", translationKey: "Pages.Employees.title" },
  "/employee_requests": {
    label: "Pages.EmployeeRequests.title",
    translationKey: "Pages.EmployeeRequests.title",
  },
  "/jobs": { label: "Pages.Jobs.title", translationKey: "Pages.Jobs.title" },
  "/job_listings": { label: "Pages.JobListings.title", translationKey: "Pages.JobListings.title" },
  "/applicants": { label: "Pages.Applicants.title", translationKey: "Pages.Applicants.title" },
  "/vendors": { label: "Pages.Vendors.title", translationKey: "Pages.Vendors.title" },
  "/salaries": { label: "Pages.Salaries.title", translationKey: "Pages.Salaries.title" },
  "/reports": { label: "Pages.Reports.title", translationKey: "Pages.Reports.title" },
  "/warehouses": { label: "Pages.Warehouses.title", translationKey: "Pages.Warehouses.title" },
  "/branches": { label: "Pages.Branches.title", translationKey: "Pages.Branches.title" },
  "/departments": { label: "Pages.Departments.title", translationKey: "Pages.Departments.title" },
  "/offices": { label: "Pages.Offices.title", translationKey: "Pages.Offices.title" },
  "/expenses": { label: "Pages.Expenses.title", translationKey: "Pages.Expenses.title" },
  "/purchases": { label: "Pages.Purchases.title", translationKey: "Pages.Purchases.title" },
  "/domains": { label: "Pages.Domains.title", translationKey: "Pages.Domains.title" },
  "/servers": { label: "Pages.Servers.title", translationKey: "Pages.Servers.title" },
  "/websites": { label: "Pages.Websites.title", translationKey: "Pages.Websites.title" },
  "/online_stores": {
    label: "Pages.OnlineStores.title",
    translationKey: "Pages.OnlineStores.title",
  },
  "/cars": { label: "Pages.Cars.title", translationKey: "Pages.Cars.title" },
  "/trucks": { label: "Pages.Trucks.title", translationKey: "Pages.Trucks.title" },
  "/individuals": { label: "Pages.Individuals.title", translationKey: "Pages.Individuals.title" },
  "/documents": { label: "Pages.Documents.title", translationKey: "Pages.Documents.title" },
};

// Dynamic route patterns and their handling
export const dynamicRoutePatterns = [
  { pattern: /^\/dashboard$/, breadcrumbs: [] },
  {
    pattern: /^\/invoices\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/invoices", labelKey: "Pages.Invoices.title" },
      { path: "", labelKey: "Pages.Invoices.add", is_active: true },
    ],
  },
  {
    pattern: /^\/quotes\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/quotes", labelKey: "Pages.Quotes.title" },
      { path: "", labelKey: "Pages.Quotes.add", is_active: true },
    ],
  },
  {
    pattern: /^\/clients\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/clients", labelKey: "Pages.Clients.title" },
      { path: "", labelKey: "Pages.Clients.add", is_active: true },
    ],
  },
  {
    pattern: /^\/products\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/products", labelKey: "Pages.Products.title" },
      { path: "", labelKey: "Pages.Products.add", is_active: true },
    ],
  },
  {
    pattern: /^\/employees\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/employees", labelKey: "Pages.Employees.title" },
      { path: "", labelKey: "Pages.Employees.add", is_active: true },
    ],
  },

  {
    pattern: /^\/employee_requests\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/employee_requests", labelKey: "Pages.EmployeeRequests.title" },
      { path: "", labelKey: "Pages.EmployeeRequests.add", is_active: true },
    ],
  },

  {
    pattern: /^\/jobs\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/jobs", labelKey: "Pages.Jobs.title" },
      { path: "", labelKey: "Pages.Jobs.add", is_active: true },
    ],
  },
  {
    pattern: /^\/job_listings\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/job_listings", labelKey: "Pages.JobListings.title" },
      { path: "", labelKey: "Pages.JobListings.add", is_active: true },
    ],
  },

  {
    pattern: /^\/warehouses\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/warehouses", labelKey: "Pages.Warehouses.title" },
      { path: "", labelKey: "Pages.Warehouses.add", is_active: true },
    ],
  },

  {
    pattern: /^\/branches\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/branches", labelKey: "Pages.Branches.title" },
      { path: "", labelKey: "Pages.Branches.add", is_active: true },
    ],
  },

  {
    pattern: /^\/companies\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/companies", labelKey: "Pages.Companies.title" },
      { path: "", labelKey: "Pages.Companies.add", is_active: true },
    ],
  },

  {
    pattern: /^\/vendors\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/vendors", labelKey: "Pages.Vendors.title" },
      { path: "", labelKey: "Pages.Vendors.add", is_active: true },
    ],
  },

  {
    pattern: /^\/salaries\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/salaries", labelKey: "Pages.Salaries.title" },
      { path: "", labelKey: "Pages.Salaries.add", is_active: true },
    ],
  },

  {
    pattern: /^\/departments\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/departments", labelKey: "Pages.Departments.title" },
      { path: "", labelKey: "Pages.Departments.add", is_active: true },
    ],
  },

  {
    pattern: /^\/offices\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/offices", labelKey: "Pages.Offices.title" },
      { path: "", labelKey: "Pages.Offices.add", is_active: true },
    ],
  },

  {
    pattern: /^\/expenses\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/expenses", labelKey: "Pages.Expenses.title" },
      { path: "", labelKey: "Pages.Expenses.add", is_active: true },
    ],
  },
  {
    pattern: /^\/roles\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/roles", labelKey: "Pages.Roles.title" },
      { path: "", labelKey: "Pages.Roles.add", is_active: true },
    ],
  },
  {
    pattern: /^\/activity$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/activity", labelKey: "Pages.ActivityLogs.title", is_active: true },
    ],
  },
  // domains
  {
    pattern: /^\/domains\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/domains", labelKey: "Pages.Domains.title" },
      { path: "", labelKey: "Pages.Domains.add", is_active: true },
    ],
  },
  // servers
  {
    pattern: /^\/servers\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/servers", labelKey: "Pages.Servers.title" },
      { path: "", labelKey: "Pages.Servers.add", is_active: true },
    ],
  },
  // websites
  {
    pattern: /^\/websites\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/websites", labelKey: "Pages.Websites.title" },
      { path: "", labelKey: "Pages.Websites.add", is_active: true },
    ],
  },
  // online_stores
  {
    pattern: /^\/online_stores\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/online_stores", labelKey: "Pages.OnlineStores.title" },
      { path: "", labelKey: "Pages.OnlineStores.add", is_active: true },
    ],
  },
  {
    pattern: /^\/purchases\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/purchases", labelKey: "Pages.Purchases.title" },
      { path: "", labelKey: "Pages.Purchases.add", is_active: true },
    ],
  },
  // cars
  {
    pattern: /^\/cars\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/cars", labelKey: "Pages.Cars.title" },
      { path: "", labelKey: "Pages.Cars.add", is_active: true },
    ],
  },
  // trucks
  {
    pattern: /^\/trucks\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Pages.Dashboard.title" },
      { path: "/trucks", labelKey: "Pages.Trucks.title" },
      { path: "", labelKey: "Pages.Trucks.add", is_active: true },
    ],
  },
];
