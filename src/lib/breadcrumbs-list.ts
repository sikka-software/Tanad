// Define route mappings
type RouteMap = {
  [key: string]: {
    label: string;
    translationKey?: string;
  };
};

// Main route mapping
export const routeMap: RouteMap = {
  "/dashboard": { label: "Dashboard", translationKey: "Dashboard.title" },
  "/invoices": { label: "Invoices", translationKey: "Invoices.title" },
  "/quotes": { label: "Quotes", translationKey: "Quotes.title" },
  "/companies": { label: "Companies", translationKey: "Companies.title" },
  "/clients": { label: "Clients", translationKey: "Clients.title" },
  "/products": { label: "Products", translationKey: "Products.title" },
  "/employees": { label: "Employees", translationKey: "Employees.title" },
  "/jobs": { label: "Jobs", translationKey: "Jobs.title" },
  "/settings": { label: "Settings", translationKey: "Settings.title" },
  "/vendors": { label: "Vendors", translationKey: "Vendors.title" },
  "/salaries": { label: "Salaries", translationKey: "Salaries.title" },
  "/calendar": { label: "Calendar", translationKey: "Calendar.title" },
  "/reports": { label: "Reports", translationKey: "Reports.title" },
  "/warehouses": { label: "Warehouses", translationKey: "Warehouses.title" },
  "/branches": { label: "Branches", translationKey: "Branches.title" },
};

// Dynamic route patterns and their handling
export const dynamicRoutePatterns = [
  {
    pattern: /^\/invoices\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/invoices", labelKey: "Invoices.title" },
      { path: "/invoices/add", labelKey: "Invoices.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/invoices\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/invoices", labelKey: "Invoices.title" },
      { path: "", labelKey: "Invoices.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/quotes\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/quotes", labelKey: "Quotes.title" },
      { path: "/quotes/add", labelKey: "Quotes.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/clients\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/clients", labelKey: "Clients.title" },
      { path: "/clients/add", labelKey: "Clients.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/clients\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/clients", labelKey: "Clients.title" },
      { path: "", labelKey: "Clients.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/products\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/products", labelKey: "Products.title" },
      { path: "/products/add", labelKey: "Products.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/products\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/products", labelKey: "Products.title" },
      { path: "", labelKey: "Products.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/employees\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/employees", labelKey: "Employees.title" },
      { path: "/employees/add", labelKey: "Employees.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/employees\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/employees", labelKey: "Employees.title" },
      { path: "", labelKey: "Employees.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/jobs\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/jobs", labelKey: "Jobs.title" },
      { path: "/jobs/add", labelKey: "Jobs.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/jobs\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/jobs", labelKey: "Jobs.title" },
      { path: "", labelKey: "Jobs.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/warehouses\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/warehouses", labelKey: "Warehouses.title" },
      { path: "/warehouses/add", labelKey: "Warehouses.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/warehouses\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/warehouses", labelKey: "Warehouses.title" },
      { path: "", labelKey: "Warehouses.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/branches\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/branches", labelKey: "Branches.title" },
      { path: "/branches/add", labelKey: "Branches.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/branches\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/branches", labelKey: "Branches.title" },
      { path: "", labelKey: "Branches.edit", isActive: true },
    ],
  },
  {
    pattern: /^\/companies\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/companies", labelKey: "Companies.title" },
      { path: "/companies/add", labelKey: "Companies.add_new", isActive: true },
    ],
  },
  {
    pattern: /^\/companies\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/companies", labelKey: "Companies.title" },
      { path: "", labelKey: "Companies.edit", isActive: true },
    ],
  },
];
