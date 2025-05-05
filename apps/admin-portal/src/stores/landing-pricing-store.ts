import {
  Building2,
  Warehouse,
  Users,
  Store,
  FileText,
  ShoppingCart,
  DollarSign,
  CreditCard,
  User,
  Briefcase,
  Server,
  Globe,
  ShoppingBag,
  Truck,
  Car,
} from "lucide-react";
import { create } from "zustand";

export interface ModuleIntegration {
  id: string; // e.g., 'gosi', 'ejar'
  label: string; // Translation key e.g., 'Integrations.gosi'
  pricingType: "fixed" | "per_unit";
  monthlyPrice: number; // Fixed price or price per unit
  annualPrice: number; // Fixed price or price per unit
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  annualPrice: number; // Price per unit/step per year
  monthlyPrice: number; // Price per unit/step per month
  quantity: number; // Selected quantity/steps
  unit: string; // Unit of measurement (e.g., 'invoices', 'users')
  step: number; // Slider step increment
  maxQuantity: number; // Maximum value for the slider
  minQuantity: number; // Minimum value for the slider (usually same as step or 1)
  integrations?: ModuleIntegration[]; // Optional integrations for the module
  selectedIntegrations?: string[]; // IDs of selected integrations
  contactUsThreshold?: number; // Quantity threshold to show "Contact Us"
  freeUnits?: number; // Number of units provided for free
}

export const allModules: Module[] = [
  {
    id: "offices",
    name: "Pricing.custom_pricing.offices.title",
    description: "Pricing.custom_pricing.offices.description",
    icon: "Building2",
    category: "infrastructure",
    annualPrice: 99,
    monthlyPrice: 3,
    quantity: 1,
    unit: "office",
    step: 1,
    maxQuantity: 10,
    minQuantity: 1,
    freeUnits: 3, // Offer first 3 offices for free
  },
  {
    id: "branches",
    name: "Pricing.custom_pricing.branches.title",
    description: "Pricing.custom_pricing.branches.description",
    icon: "Building2",
    category: "infrastructure",
    annualPrice: 89,
    monthlyPrice: 8,
    quantity: 1,
    unit: "branch",
    step: 1,
    maxQuantity: 20,
    minQuantity: 1,
  },
  {
    id: "warehouses",
    name: "Pricing.custom_pricing.warehouses.title",
    description: "Pricing.custom_pricing.warehouses.description",
    icon: "Warehouse",
    category: "infrastructure",
    annualPrice: 129,
    monthlyPrice: 12,
    quantity: 1,
    unit: "warehouse",
    step: 1,
    maxQuantity: 5,
    minQuantity: 1,
  },
  {
    id: "clients",
    name: "Pricing.custom_pricing.clients.title",
    description: "Pricing.custom_pricing.clients.description",
    icon: "Users",
    category: "business",
    annualPrice: 30,
    monthlyPrice: 3,
    quantity: 50,
    unit: "client",
    step: 50,
    maxQuantity: 1000,
    minQuantity: 50,
  },
  {
    id: "vendors",
    name: "Pricing.custom_pricing.vendors.title",
    description: "Pricing.custom_pricing.vendors.description",
    icon: "Store",
    category: "business",
    annualPrice: 109,
    monthlyPrice: 10,
    quantity: 10,
    unit: "vendor",
    step: 10,
    maxQuantity: 500,
    minQuantity: 10,
  },
  {
    id: "invoices",
    name: "Pricing.custom_pricing.invoices.title",
    description: "Pricing.custom_pricing.invoices.description",
    icon: "FileText",
    category: "finance",
    annualPrice: 20,
    monthlyPrice: 2,
    quantity: 100,
    unit: "invoice",
    step: 100,
    maxQuantity: 5000,
    minQuantity: 100,
    contactUsThreshold: 4500, // Example threshold
    freeUnits: 10, // Offer first 4500 invoices for free
  },
  {
    id: "products",
    name: "Pricing.custom_pricing.products.title",
    description: "Pricing.custom_pricing.products.description",
    icon: "ShoppingCart",
    category: "business",
    annualPrice: 50,
    monthlyPrice: 5,
    quantity: 1000,
    unit: "product",
    step: 1000,
    maxQuantity: 10000,
    minQuantity: 1000,
    contactUsThreshold: 9000, // Example threshold
  },
  {
    id: "quotes",
    name: "Pricing.custom_pricing.quotes.title",
    description: "Pricing.custom_pricing.quotes.description",
    icon: "FileText",
    category: "business",
    annualPrice: 15,
    monthlyPrice: 1.5,
    quantity: 100,
    unit: "quote",
    step: 100,
    maxQuantity: 2000,
    minQuantity: 100,
  },
  {
    id: "expenses",
    name: "Pricing.custom_pricing.expenses.title",
    description: "Pricing.custom_pricing.expenses.description",
    icon: "DollarSign",
    category: "finance",
    annualPrice: 10,
    monthlyPrice: 1,
    quantity: 50,
    unit: "expense",
    step: 50,
    maxQuantity: 1000,
    minQuantity: 50,
  },
  {
    id: "purchases",
    name: "Pricing.custom_pricing.purchases.title",
    description: "Pricing.custom_pricing.purchases.description",
    icon: "CreditCard",
    category: "finance",
    annualPrice: 12,
    monthlyPrice: 1.2,
    quantity: 50,
    unit: "purchase",
    step: 50,
    maxQuantity: 1000,
    minQuantity: 50,
  },
  {
    id: "employees",
    name: "Pricing.custom_pricing.employees.title",
    description: "Pricing.custom_pricing.employees.description",
    icon: "User",
    category: "hr",
    annualPrice: 10,
    monthlyPrice: 1,
    quantity: 10,
    unit: "employee",
    step: 1,
    maxQuantity: 100,
    minQuantity: 1,
  },
  {
    id: "salaries",
    name: "Pricing.custom_pricing.salaries.title",
    description: "Pricing.custom_pricing.salaries.description",
    icon: "DollarSign",
    category: "finance",
    annualPrice: 10,
    monthlyPrice: 100,
    quantity: 10,
    unit: "salary",
    step: 1,
    maxQuantity: 100,
    minQuantity: 1,
    integrations: [
      {
        id: "gosi",
        label: "Pricing.custom_pricing.integrations.gosi",
        pricingType: "per_unit",
        monthlyPrice: 50.5, // 0.5 per employee per month
        annualPrice: 5, // 5 per employee per year
      },
    ],
  },
  {
    id: "jobs",
    name: "Pricing.custom_pricing.jobs.title",
    description: "Pricing.custom_pricing.jobs.description",
    icon: "Briefcase",
    category: "hr",
    annualPrice: 20,
    monthlyPrice: 2,
    quantity: 5,
    unit: "job",
    step: 5,
    maxQuantity: 50,
    minQuantity: 5,
  },
  {
    id: "departments",
    name: "Pricing.custom_pricing.departments.title",
    description: "Pricing.custom_pricing.departments.description",
    icon: "Users",
    category: "hr",
    annualPrice: 30,
    monthlyPrice: 3,
    quantity: 1,
    unit: "department",
    step: 1,
    maxQuantity: 20,
    minQuantity: 1,
  },
  {
    id: "job_listings",
    name: "Pricing.custom_pricing.job_listings.title",
    description: "Pricing.custom_pricing.job_listings.description",
    icon: "FileText",
    category: "hr",
    annualPrice: 25,
    monthlyPrice: 2.5,
    quantity: 5,
    unit: "job_listing",
    step: 5,
    maxQuantity: 30,
    minQuantity: 5,
  },
  {
    id: "applicants",
    name: "Pricing.custom_pricing.applicants.title",
    description: "Pricing.custom_pricing.applicants.description",
    icon: "User",
    category: "hr",
    annualPrice: 15,
    monthlyPrice: 1.5,
    quantity: 100,
    unit: "applicant",
    step: 100,
    maxQuantity: 1000,
    minQuantity: 100,
  },
  {
    id: "servers",
    name: "Pricing.custom_pricing.servers.title",
    description: "Pricing.custom_pricing.servers.description",
    icon: "Server",
    category: "it",
    annualPrice: 149,
    monthlyPrice: 14,
    quantity: 1,
    unit: "server",
    step: 1,
    maxQuantity: 10,
    minQuantity: 1,
  },
  {
    id: "domains",
    name: "Pricing.custom_pricing.domains.title",
    description: "Pricing.custom_pricing.domains.description",
    icon: "Globe",
    category: "it",
    annualPrice: 10,
    monthlyPrice: 1,
    quantity: 1,
    unit: "domain",
    step: 1,
    maxQuantity: 50,
    minQuantity: 1,
  },
  {
    id: "websites",
    name: "Pricing.custom_pricing.websites.title",
    description: "Pricing.custom_pricing.websites.description",
    icon: "Globe",
    category: "it",
    annualPrice: 129,
    monthlyPrice: 12,
    quantity: 1,
    unit: "website",
    step: 1,
    maxQuantity: 10,
    minQuantity: 1,
  },
  {
    id: "ecommerce",
    name: "Pricing.custom_pricing.ecommerce.title",
    description: "Pricing.custom_pricing.ecommerce.description",
    icon: "ShoppingBag",
    category: "it",
    annualPrice: 169,
    monthlyPrice: 15,
    quantity: 1,
    unit: "online_store",
    step: 1,
    maxQuantity: 5,
    minQuantity: 1,
  },
  {
    id: "employee_requests",
    name: "Pricing.custom_pricing.employee_requests.title",
    description: "Pricing.custom_pricing.employee_requests.description",
    icon: "User",
    category: "hr",
    annualPrice: 10,
    monthlyPrice: 1,
    quantity: 10,
    unit: "employee_request",
    step: 1,
    maxQuantity: 100,
    minQuantity: 1,
  },
  // Trucks
  {
    id: "trucks",
    name: "Pricing.custom_pricing.trucks.title",
    description: "Pricing.custom_pricing.trucks.description",
    icon: "Truck",
    category: "logistics",
    annualPrice: 10,
    monthlyPrice: 1,
    quantity: 1,
    unit: "truck",
    step: 1,
    maxQuantity: 10,
    minQuantity: 1,
  },
  // cars
  {
    id: "cars",
    name: "Pricing.custom_pricing.cars.title",
    description: "Pricing.custom_pricing.cars.description",
    icon: "Car",
    category: "logistics",
    annualPrice: 10,
    monthlyPrice: 1,
    quantity: 1,
    unit: "car",
    step: 1,
    maxQuantity: 10,
    minQuantity: 1,
  },
];

export const initialDepartments: Department[] = [
  {
    id: "infrastructure",
    name: "Pricing.custom_pricing.infrastructure.title",
    description: "Pricing.custom_pricing.infrastructure.description",
    icon: "Building2",
    color: "bg-blue-500",
    modules: [],
  },
  {
    id: "business",
    name: "Pricing.custom_pricing.business.title",
    description: "Pricing.custom_pricing.business.description",
    icon: "Briefcase",
    color: "bg-purple-500",
    modules: [],
  },
  {
    id: "finance",
    name: "Pricing.custom_pricing.finance.title",
    description: "Pricing.custom_pricing.finance.description",
    icon: "DollarSign",
    color: "bg-green-500",
    modules: [],
  },
  {
    id: "hr",
    name: "Pricing.custom_pricing.hr.title",
    description: "Pricing.custom_pricing.hr.description",
    icon: "Users",
    color: "bg-orange-500",
    modules: [],
  },
  {
    id: "it",
    name: "Pricing.custom_pricing.it.title",
    description: "Pricing.custom_pricing.it.description",
    icon: "Server",
    color: "bg-indigo-500",
    modules: [],
  },
  {
    id: "logistics",
    name: "Pricing.custom_pricing.logistics.title",
    description: "Pricing.custom_pricing.logistics.description",
    icon: "Truck",
    color: "bg-red-500",
    modules: [],
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Pricing.custom_pricing.starter.title",
    description: "Pricing.custom_pricing.starter.description",
    basePrice: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    discount: 0,
  },
  {
    name: "Pricing.custom_pricing.professional.title",
    description: "Pricing.custom_pricing.professional.description",
    basePrice: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    discount: 0,
  },
  {
    name: "Pricing.custom_pricing.enterprise.title",
    description: "Pricing.custom_pricing.enterprise.description",
    basePrice: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    discount: 0,
  },
];

export const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ElementType> = {
    Building2,
    Warehouse,
    Users,
    Store,
    FileText,
    ShoppingCart,
    DollarSign,
    CreditCard,
    User,
    Briefcase,
    Server,
    Globe,
    ShoppingBag,
    Truck,
    Car,
  };

  return icons[iconName] || Building2;
};

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  modules: (Module & { selectedIntegrations?: string[] })[]; // Ensure selectedIntegrations is tracked here
}

export interface PricingTier {
  name: string;
  description: string;
  basePrice: number;
  monthlyPrice: number;
  annualPrice: number;
  discount: number;
}

const calculatePriceAndThreshold = (
  departments: Department[],
  currentCycle: string,
  selectedTier: PricingTier,
): { totalPrice: number; showContactUs: boolean } => {
  let modulesTotal = 0;
  let contactUsTriggered = false;

  departments.forEach((dept) => {
    dept.modules.forEach((mod) => {
      // Base module price calculation
      const pricePerUnit = currentCycle === "monthly" ? mod.monthlyPrice : mod.annualPrice;
      const fullModuleData = allModules.find((m) => m.id === mod.id);
      const freeUnits = fullModuleData?.freeUnits ?? 0;
      const chargeableQuantity = Math.max(0, mod.quantity - freeUnits);

      // Use chargeable quantity for base price
      const moduleBasePrice = pricePerUnit * (chargeableQuantity / mod.step);
      modulesTotal += moduleBasePrice;

      // Check for contact us threshold
      if (fullModuleData?.contactUsThreshold && mod.quantity >= fullModuleData.contactUsThreshold) {
        contactUsTriggered = true;
        // No need to calculate further price if threshold is met for this calculation?
        // Or maybe calculate full price anyway but just set the flag?
        // Let's calculate full price for now, UI will handle display.
      }

      // Integration price calculation
      if (mod.selectedIntegrations && mod.selectedIntegrations.length > 0) {
        if (fullModuleData && fullModuleData.integrations) {
          mod.selectedIntegrations.forEach((integrationId) => {
            const integrationData = fullModuleData.integrations!.find(
              (int) => int.id === integrationId,
            );
            if (integrationData) {
              const integrationPricePerCycle =
                currentCycle === "monthly"
                  ? integrationData.monthlyPrice
                  : integrationData.annualPrice;

              if (integrationData.pricingType === "fixed") {
                modulesTotal += integrationPricePerCycle;
              } else if (integrationData.pricingType === "per_unit") {
                // Use chargeable quantity for per-unit integration pricing
                modulesTotal += integrationPricePerCycle * (chargeableQuantity / mod.step);
              }
            }
          });
        }
      }
    });
  });

  const basePrice = selectedTier.basePrice;
  const totalBeforeDiscount = basePrice + modulesTotal;
  const discountAmount =
    selectedTier.discount > 0 ? totalBeforeDiscount * selectedTier.discount : 0;

  const finalTotal = totalBeforeDiscount - discountAmount;
  return {
    totalPrice: Math.round(finalTotal * 100) / 100,
    showContactUs: contactUsTriggered,
  };
};

interface LandingPricingState {
  departments: Department[];
  currentCycle: string;
  currentCurrency: string;
  selectedTier: PricingTier;
  totalPrice: number;
  allModules: Module[];
  toggleModule: (moduleId: string, departmentId: string) => void;
  updateModuleQuantity: (moduleId: string, quantity: number) => void;
  resetModules: () => void;
  setSelectedTier: (tier: PricingTier) => void;
  getTotalModulesCount: () => number;
  setCurrentCycle: (cycle: string) => void;
  setCurrentCurrency: (currency: string) => void;
  toggleIntegration: (departmentId: string, moduleId: string, integrationId: string) => void;
  showContactUs: boolean; // Add state for contact us flag
}

export const useLandingPricingStore = create<LandingPricingState>((set, get) => ({
  departments: initialDepartments.map((dept: Department) => ({ ...dept, modules: [] })),
  selectedTier: pricingTiers[0],
  currentCycle: "monthly",
  currentCurrency: "sar",
  totalPrice: pricingTiers[0].basePrice,
  allModules: allModules.map((m) => ({ ...m, quantity: m.minQuantity || m.step || 1 })),
  showContactUs: false, // Initial state

  setCurrentCycle: (cycle: string) =>
    set((state) => {
      const { totalPrice, showContactUs } = calculatePriceAndThreshold(
        state.departments,
        cycle,
        state.selectedTier,
      );
      return { currentCycle: cycle, totalPrice, showContactUs };
    }),
  setCurrentCurrency: (currency: string) => set({ currentCurrency: currency }),

  updateModuleQuantity: (moduleId: string, quantity: number) => {
    set((state) => {
      const newDepartments = state.departments.map((dept) => ({
        ...dept,
        modules: dept.modules.map((mod) =>
          mod.id === moduleId ? { ...mod, quantity: quantity } : mod,
        ),
      }));

      const { totalPrice, showContactUs } = calculatePriceAndThreshold(
        newDepartments,
        state.currentCycle,
        state.selectedTier,
      );
      return { departments: newDepartments, totalPrice, showContactUs };
    });
  },

  toggleModule: (moduleId: string, departmentId: string) => {
    const moduleData = get().allModules.find((m) => m.id === moduleId);
    if (!moduleData) {
      console.warn(`Module definition ${moduleId} not found in allModules`);
      return;
    }
    if (moduleData.category !== departmentId) {
      console.warn(
        `Module ${moduleId} category ${moduleData.category} does not match department ${departmentId}`,
      );
      return;
    }
    const moduleToAdd = { ...moduleData, quantity: moduleData.minQuantity || moduleData.step || 1 };

    set((state) => {
      let moduleExistsInDept = false;
      const newDepartments = state.departments.map((dept) => {
        if (dept.id !== departmentId) return dept;

        const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
        const moduleIndex = currentDeptModules.findIndex((m) => m.id === moduleId);

        if (moduleIndex > -1) {
          moduleExistsInDept = true;
          return {
            ...dept,
            modules: currentDeptModules.filter((m) => m.id !== moduleId),
          };
        } else {
          return {
            ...dept,
            modules: [...currentDeptModules, moduleToAdd],
          };
        }
      });

      const wasAdded =
        !moduleExistsInDept &&
        newDepartments.find((d) => d.id === departmentId)?.modules.some((m) => m.id === moduleId);
      const wasRemoved =
        moduleExistsInDept &&
        !newDepartments.find((d) => d.id === departmentId)?.modules.some((m) => m.id === moduleId);

      if (!wasAdded && !wasRemoved) {
        return {};
      }

      const { totalPrice, showContactUs } = calculatePriceAndThreshold(
        newDepartments,
        state.currentCycle,
        state.selectedTier,
      );
      return { departments: newDepartments, totalPrice, showContactUs };
    });
  },

  resetModules: () =>
    set((state) => {
      const initialDeps = initialDepartments.map((dept: Department) => ({
        ...dept,
        modules: [],
      }));
      const { totalPrice, showContactUs } = calculatePriceAndThreshold(
        initialDeps,
        state.currentCycle,
        state.selectedTier,
      );
      return {
        departments: initialDeps,
        totalPrice,
        showContactUs, // Reset flag as well
        currentCurrency: state.currentCurrency,
      };
    }),

  setSelectedTier: (tier: PricingTier) => {
    set((state) => {
      const { totalPrice, showContactUs } = calculatePriceAndThreshold(
        state.departments,
        state.currentCycle,
        tier,
      );
      return { selectedTier: tier, totalPrice, showContactUs };
    });
  },

  getTotalModulesCount: () => {
    const state = get();
    return state.departments.reduce((count, dept) => {
      const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
      return count + currentDeptModules.length;
    }, 0);
  },

  toggleIntegration: (departmentId, moduleId, integrationId) =>
    set((state) => {
      const newDepartments = state.departments.map((dept) => {
        if (dept.id === departmentId) {
          const newModules = dept.modules.map((mod) => {
            if (mod.id === moduleId) {
              const currentIntegrations = mod.selectedIntegrations || [];
              const isSelected = currentIntegrations.includes(integrationId);
              const updatedIntegrations = isSelected
                ? currentIntegrations.filter((id) => id !== integrationId)
                : [...currentIntegrations, integrationId];
              return { ...mod, selectedIntegrations: updatedIntegrations };
            }
            return mod;
          });
          return { ...dept, modules: newModules };
        }
        return dept;
      });

      const { totalPrice, showContactUs } = calculatePriceAndThreshold(
        newDepartments,
        state.currentCycle,
        state.selectedTier,
      );
      return { departments: newDepartments, totalPrice, showContactUs };
    }),
}));
