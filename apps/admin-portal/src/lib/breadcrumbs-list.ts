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
  "/employee-requests": { label: "Employee Requests", translationKey: "EmployeeRequests.title" },
  "/jobs": { label: "Jobs", translationKey: "Jobs.title" },
  "/job-listings": { label: "Job Listings", translationKey: "JobListings.title" },
  "/applicants": { label: "Applicants", translationKey: "Applicants.title" },
  "/settings": { label: "Settings", translationKey: "Settings.title" },
  "/vendors": { label: "Vendors", translationKey: "Vendors.title" },
  "/salaries": { label: "Salaries", translationKey: "Salaries.title" },
  "/reports": { label: "Reports", translationKey: "Reports.title" },
  "/warehouses": { label: "Warehouses", translationKey: "Warehouses.title" },
  "/branches": { label: "Branches", translationKey: "Branches.title" },
  "/departments": { label: "Departments", translationKey: "Departments.title" },
  "/offices": { label: "Offices", translationKey: "Offices.title" },
  "/expenses": { label: "Expenses", translationKey: "Expenses.title" },
  "/roles": { label: "Roles", translationKey: "Roles.title" },
};

// Dynamic route patterns and their handling
export const dynamicRoutePatterns = [
  {
    pattern: /^\/dashboard$/,
    breadcrumbs: [{ path: "/dashboard", labelKey: "Dashboard.title" }],
  },
  {
    pattern: /^\/invoices\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/invoices", labelKey: "Invoices.title" },
      { path: "", labelKey: "Invoices.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/invoices\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/invoices", labelKey: "Invoices.title" },
      { path: "", labelKey: "Invoices.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/quotes\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/quotes", labelKey: "Quotes.title" },
      { path: "/quotes/add", labelKey: "Quotes.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/clients\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/clients", labelKey: "Clients.title" },
      { path: "/clients/add", labelKey: "Clients.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/clients\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/clients", labelKey: "Clients.title" },
      { path: "", labelKey: "Clients.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/products\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/products", labelKey: "Products.title" },
      { path: "/products/add", labelKey: "Products.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/products\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/products", labelKey: "Products.title" },
      { path: "", labelKey: "Products.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/employees\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/employees", labelKey: "Employees.title" },
      { path: "/employees/add", labelKey: "Employees.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/employees\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/employees", labelKey: "Employees.title" },
      { path: "", labelKey: "Employees.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/employee-requests\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/employee-requests", labelKey: "EmployeeRequests.title" },
      { path: "/employee-requests/add", labelKey: "EmployeeRequests.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/employee-requests\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/employee-requests", labelKey: "EmployeeRequests.title" },
      { path: "", labelKey: "EmployeeRequests.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/jobs\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/jobs", labelKey: "Jobs.title" },
      { path: "/jobs/add", labelKey: "Jobs.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/jobs\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/jobs", labelKey: "Jobs.title" },
      { path: "", labelKey: "Jobs.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/warehouses\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/warehouses", labelKey: "Warehouses.title" },
      { path: "/warehouses/add", labelKey: "Warehouses.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/warehouses\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/warehouses", labelKey: "Warehouses.title" },
      { path: "", labelKey: "Warehouses.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/branches\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/branches", labelKey: "Branches.title" },
      { path: "/branches/add", labelKey: "Branches.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/branches\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/branches", labelKey: "Branches.title" },
      { path: "", labelKey: "Branches.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/companies\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/companies", labelKey: "Companies.title" },
      { path: "/companies/add", labelKey: "Companies.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/companies\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/companies", labelKey: "Companies.title" },
      { path: "", labelKey: "Companies.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/vendors\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/vendors", labelKey: "Vendors.title" },
      { path: "/vendors/add", labelKey: "Vendors.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/vendors\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/vendors", labelKey: "Vendors.title" },
      { path: "", labelKey: "Vendors.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/salaries\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/salaries", labelKey: "Salaries.title" },
      { path: "/salaries/add", labelKey: "Salaries.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/salaries\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/salaries", labelKey: "Salaries.title" },
      { path: "", labelKey: "Salaries.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/departments\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/departments", labelKey: "Departments.title" },
      { path: "/departments/add", labelKey: "Departments.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/departments\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/departments", labelKey: "Departments.title" },
      { path: "", labelKey: "Departments.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/offices\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/offices", labelKey: "Offices.title" },
      { path: "/offices/add", labelKey: "Offices.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/offices\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/offices", labelKey: "Offices.title" },
      { path: "", labelKey: "Offices.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/expenses\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/expenses", labelKey: "Expenses.title" },
      { path: "/expenses/add", labelKey: "Expenses.add_new", is_active: true },
    ],
  },
  {
    pattern: /^\/expenses\/edit\/(.+)$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/expenses", labelKey: "Expenses.title" },
      { path: "", labelKey: "Expenses.edit", is_active: true },
    ],
  },
  {
    pattern: /^\/roles\/add$/,
    breadcrumbs: [
      { path: "/dashboard", labelKey: "Dashboard.title" },
      { path: "/roles", labelKey: "Roles.title" },
    ],
  },
];
