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
} from "lucide-react";
import { create } from "zustand";

export const allModules: Module[] = [
  {
    id: "offices",
    name: "Pricing.custom_pricing.offices.title",
    description: "Pricing.custom_pricing.offices.description",
    icon: "Building2",
    category: "infrastructure",
    annualPrice: 99,
    monthlyPrice: 9,
  },
  {
    id: "branches",
    name: "Pricing.custom_pricing.branches.title",
    description: "Pricing.custom_pricing.branches.description",
    icon: "Building2",
    category: "infrastructure",
    annualPrice: 89,
    monthlyPrice: 8,
  },
  {
    id: "warehouses",
    name: "Pricing.custom_pricing.warehouses.title",
    description: "Pricing.custom_pricing.warehouses.description",
    icon: "Warehouse",
    category: "infrastructure",
    annualPrice: 129,
    monthlyPrice: 12,
  },
  {
    id: "clients",
    name: "Pricing.custom_pricing.clients.title",
    description: "Pricing.custom_pricing.clients.description",
    icon: "Users",
    category: "business",
    annualPrice: 149,
    monthlyPrice: 14,
  },
  {
    id: "vendors",
    name: "Pricing.custom_pricing.vendors.title",
    description: "Pricing.custom_pricing.vendors.description",
    icon: "Store",
    category: "business",
    annualPrice: 109,
    monthlyPrice: 10,
  },
  {
    id: "invoices",
    name: "Pricing.custom_pricing.invoices.title",
    description: "Pricing.custom_pricing.invoices.description",
    icon: "FileText",
    category: "finance",
    annualPrice: 139,
    monthlyPrice: 13,
  },
  {
    id: "products",
    name: "Pricing.custom_pricing.products.title",
    description: "Pricing.custom_pricing.products.description",
    icon: "ShoppingCart",
    category: "business",
    annualPrice: 139,
    monthlyPrice: 13,
  },
  {
    id: "quotes",
    name: "Pricing.custom_pricing.quotes.title",
    description: "Pricing.custom_pricing.quotes.description",
    icon: "FileText",
    category: "business",
    annualPrice: 89,
    monthlyPrice: 8,
  },
  {
    id: "expenses",
    name: "Pricing.custom_pricing.expenses.title",
    description: "Pricing.custom_pricing.expenses.description",
    icon: "DollarSign",
    category: "finance",
    annualPrice: 99,
    monthlyPrice: 9,
  },
  {
    id: "purchases",
    name: "Pricing.custom_pricing.purchases.title",
    description: "Pricing.custom_pricing.purchases.description",
    icon: "CreditCard",
    category: "finance",
    annualPrice: 119,
    monthlyPrice: 11,
  },
  {
    id: "employees",
    name: "Pricing.custom_pricing.employees.title",
    description: "Pricing.custom_pricing.employees.description",
    icon: "User",
    category: "hr",
    annualPrice: 149,
    monthlyPrice: 14,
  },
  {
    id: "jobs",
    name: "Pricing.custom_pricing.jobs.title",
    description: "Pricing.custom_pricing.jobs.description",
    icon: "Briefcase",
    category: "hr",
    annualPrice: 89,
    monthlyPrice: 8,
  },
  {
    id: "departments",
    name: "Pricing.custom_pricing.departments.title",
    description: "Pricing.custom_pricing.departments.description",
    icon: "Users",
    category: "hr",
    annualPrice: 89,
    monthlyPrice: 8,
  },
  {
    id: "job_listings",
    name: "Pricing.custom_pricing.job_listings.title",
    description: "Pricing.custom_pricing.job_listings.description",
    icon: "FileText",
    category: "hr",
    annualPrice: 109,
    monthlyPrice: 10,
  },
  {
    id: "applicants",
    name: "Pricing.custom_pricing.applicants.title",
    description: "Pricing.custom_pricing.applicants.description",
    icon: "User",
    category: "hr",
    annualPrice: 109,
    monthlyPrice: 10,
  },
  {
    id: "servers",
    name: "Pricing.custom_pricing.servers.title",
    description: "Pricing.custom_pricing.servers.description",
    icon: "Server",
    category: "it",
    annualPrice: 149,
    monthlyPrice: 14,
  },
  {
    id: "domains",
    name: "Pricing.custom_pricing.domains.title",
    description: "Pricing.custom_pricing.domains.description",
    icon: "Globe",
    category: "it",
    annualPrice: 89,
    monthlyPrice: 8,
  },
  {
    id: "websites",
    name: "Pricing.custom_pricing.websites.title",
    description: "Pricing.custom_pricing.websites.description",
    icon: "Globe",
    category: "it",
    annualPrice: 129,
    monthlyPrice: 12,
  },
  {
    id: "ecommerce",
    name: "Pricing.custom_pricing.ecommerce.title",
    description: "Pricing.custom_pricing.ecommerce.description",
    icon: "ShoppingBag",
    category: "it",
    annualPrice: 169,
    monthlyPrice: 15,
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
  };

  return icons[iconName] || Building2;
};
// Assuming this data exists

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  annualPrice: number;
  monthlyPrice: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
}

export interface PricingTier {
  name: string;
  description: string;
  basePrice: number;
  monthlyPrice: number;
  annualPrice: number;
  discount: number;
}

// Helper function to calculate total price based on departments and tier
const calculateTotalPriceHelper = (
  departments: Department[],
  currentCycle: string,
  selectedTier: PricingTier,
): number => {
  const modulesPrice = departments.reduce((total, dept) => {
    // Ensure dept.modules is always an array
    const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
    return (
      total +
      currentDeptModules.reduce((deptTotal, module) => {
        if (currentCycle === "monthly") {
          return deptTotal + module.monthlyPrice;
        } else {
          return deptTotal + module.annualPrice;
        }
      }, 0)
    );
  }, 0);

  const totalBeforeDiscount = selectedTier.basePrice + modulesPrice;
  const discount = totalBeforeDiscount * selectedTier.discount;

  // Apply tier limits if necessary (e.g., Enterprise has unlimited)
  const moduleCount = departments.reduce((count, dept) => {
    const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
    return count + currentDeptModules.length;
  }, 0);

  return Math.round(totalBeforeDiscount - discount);
};

interface LandingPricingState {
  departments: Department[];
  currentCycle: string;
  currentCurrency: string;
  selectedTier: PricingTier;
  totalPrice: number;
  allModules: Module[]; // Keep track of all available modules if needed for toggling
  toggleModule: (moduleId: string, departmentId: string) => void;
  resetModules: () => void;
  setSelectedTier: (tier: PricingTier) => void;
  getTotalModulesCount: () => number;
  setCurrentCycle: (cycle: string) => void;
  setCurrentCurrency: (currency: string) => void;
  // calculateTotalPrice is now implicitly handled by updates
}

export const useLandingPricingStore = create<LandingPricingState>((set, get) => ({
  departments: initialDepartments.map((dept: Department) => ({ ...dept, modules: [] })), // Start with empty modules in each department
  selectedTier: pricingTiers[0],
  currentCycle: "monthly",
  currentCurrency: "sar",
  totalPrice: pricingTiers[0].basePrice,
  allModules: allModules, // Store all modules for easy lookup
  setCurrentCycle: (cycle: string) =>
    set((state) => {
      const newPrice = calculateTotalPriceHelper(state.departments, cycle, state.selectedTier);
      return { currentCycle: cycle, totalPrice: newPrice };
    }),
  setCurrentCurrency: (currency: string) => set({ currentCurrency: currency }),
  toggleModule: (moduleId: string, departmentId: string) => {
    const moduleToAdd = get().allModules.find((m) => m.id === moduleId);
    // Ensure the module exists and belongs to the correct category (department)
    if (!moduleToAdd || moduleToAdd.category !== departmentId) {
      console.warn(`Module ${moduleId} not found or does not belong to department ${departmentId}`);
      return;
    }

    set((state) => {
      const currentTier = state.selectedTier;
      const currentDepartments = state.departments;
      let moduleCount = state.getTotalModulesCount();

      const newDepartments = currentDepartments.map((dept) => {
        if (dept.id !== departmentId) return dept;

        // Ensure dept.modules is always an array
        const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
        const moduleIndex = currentDeptModules.findIndex((m) => m.id === moduleId);

        if (moduleIndex > -1) {
          // Module exists, remove it
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

      // Only update if departments actually changed
      if (newDepartments === currentDepartments) {
        return {}; // No change needed
      }

      const newTotalPrice = calculateTotalPriceHelper(
        newDepartments,
        state.currentCycle,
        state.selectedTier,
      );
      return { departments: newDepartments, totalPrice: newTotalPrice };
    });
  },

  resetModules: () => {
    set((state) => {
      const resetDepartments = initialDepartments.map((dept: Department) => ({
        ...dept,
        modules: [],
      }));
      const newTotalPrice = calculateTotalPriceHelper(
        resetDepartments,
        state.currentCycle,
        state.selectedTier,
      );
      return { departments: resetDepartments, totalPrice: newTotalPrice };
    });
  },

  setSelectedTier: (tier: PricingTier) => {
    set((state) => {
      // When changing tiers, re-evaluate module limits and potentially remove excess modules
      let currentDepartments = state.departments;
      let moduleCount = state.getTotalModulesCount();
      let adjustedDepartments = currentDepartments;

      const newTotalPrice = calculateTotalPriceHelper(
        adjustedDepartments,
        state.currentCycle,
        tier,
      );
      return { selectedTier: tier, totalPrice: newTotalPrice, departments: adjustedDepartments };
    });
  },

  getTotalModulesCount: () => {
    const state = get();
    return state.departments.reduce((count, dept) => {
      const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
      return count + currentDeptModules.length;
    }, 0);
  },
}));
