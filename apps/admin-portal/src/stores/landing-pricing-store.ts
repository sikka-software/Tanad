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
    name: "Offices",
    description: "Manage office locations and resources",
    icon: "Building2",
    category: "infrastructure",
    basePrice: 49,
  },
  {
    id: "branches",
    name: "Branches",
    description: "Track branch operations and performance",
    icon: "Building2",
    category: "infrastructure",
    basePrice: 39,
  },
  {
    id: "warehouses",
    name: "Warehouses",
    description: "Inventory and warehouse management",
    icon: "Warehouse",
    category: "infrastructure",
    basePrice: 59,
  },
  {
    id: "clients",
    name: "Clients",
    description: "Client relationship management",
    icon: "Users",
    category: "business",
    basePrice: 69,
  },
  {
    id: "vendors",
    name: "Vendors",
    description: "Vendor relationship management",
    icon: "Store",
    category: "business",
    basePrice: 49,
  },
  {
    id: "invoices",
    name: "Invoices",
    description: "Invoice generation and tracking",
    icon: "FileText",
    category: "finance",
    basePrice: 49,
  },
  {
    id: "products",
    name: "Products",
    description: "Product catalog and management",
    icon: "ShoppingCart",
    category: "business",
    basePrice: 59,
  },
  {
    id: "quotes",
    name: "Quotes",
    description: "Quote generation and tracking",
    icon: "FileText",
    category: "business",
    basePrice: 39,
  },
  {
    id: "expenses",
    name: "Expenses",
    description: "Expense tracking and management",
    icon: "DollarSign",
    category: "finance",
    basePrice: 39,
  },
  {
    id: "purchases",
    name: "Purchases",
    description: "Purchase order management",
    icon: "CreditCard",
    category: "finance",
    basePrice: 49,
  },
  {
    id: "employees",
    name: "Employees",
    description: "Employee management and records",
    icon: "User",
    category: "hr",
    basePrice: 59,
  },
  {
    id: "jobs",
    name: "Jobs",
    description: "Job role definitions and assignments",
    icon: "Briefcase",
    category: "hr",
    basePrice: 39,
  },
  {
    id: "departments",
    name: "Departments",
    description: "Department structure and management",
    icon: "Users",
    category: "hr",
    basePrice: 39,
  },
  {
    id: "job_listings",
    name: "Job Listings",
    description: "Post and manage job openings",
    icon: "FileText",
    category: "hr",
    basePrice: 49,
  },
  {
    id: "applicants",
    name: "Applicants",
    description: "Track and manage job applicants",
    icon: "User",
    category: "hr",
    basePrice: 49,
  },
  {
    id: "servers",
    name: "Servers",
    description: "Server infrastructure management",
    icon: "Server",
    category: "it",
    basePrice: 69,
  },
  {
    id: "domains",
    name: "Domains",
    description: "Domain registration and management",
    icon: "Globe",
    category: "it",
    basePrice: 39,
  },
  {
    id: "websites",
    name: "Websites",
    description: "Website hosting and management",
    icon: "Globe",
    category: "it",
    basePrice: 59,
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "E-commerce platform integration",
    icon: "ShoppingBag",
    category: "it",
    basePrice: 79,
  },
];

export const initialDepartments: Department[] = [
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Physical assets and locations",
    icon: "Building2",
    color: "bg-blue-500",
    modules: [],
  },
  {
    id: "business",
    name: "Business",
    description: "Core business operations",
    icon: "Briefcase",
    color: "bg-purple-500",
    modules: [],
  },
  {
    id: "finance",
    name: "Finance",
    description: "Financial management",
    icon: "DollarSign",
    color: "bg-green-500",
    modules: [],
  },
  {
    id: "hr",
    name: "Human Resources",
    description: "Employee management",
    icon: "Users",
    color: "bg-orange-500",
    modules: [],
  },
  {
    id: "it",
    name: "IT & Digital",
    description: "Technology infrastructure",
    icon: "Server",
    color: "bg-indigo-500",
    modules: [],
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    description: "Perfect for small businesses",
    basePrice: 99,
    maxModules: 5,
    discount: 0,
  },
  {
    name: "Professional",
    description: "Ideal for growing businesses",
    basePrice: 199,
    maxModules: 10,
    discount: 0.1,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    basePrice: 399,
    maxModules: 999,
    discount: 0.15,
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
  basePrice: number;
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
  maxModules: number;
  discount: number;
}

// Helper function to calculate total price based on departments and tier
const calculateTotalPriceHelper = (
  departments: Department[],
  selectedTier: PricingTier,
): number => {
  const modulesPrice = departments.reduce((total, dept) => {
    // Ensure dept.modules is always an array
    const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
    return (
      total + currentDeptModules.reduce((deptTotal, module) => deptTotal + module.basePrice, 0)
    );
  }, 0);

  const totalBeforeDiscount = selectedTier.basePrice + modulesPrice;
  const discount = totalBeforeDiscount * selectedTier.discount;

  // Apply tier limits if necessary (e.g., Enterprise has unlimited)
  const moduleCount = departments.reduce((count, dept) => {
    const currentDeptModules = Array.isArray(dept.modules) ? dept.modules : [];
    return count + currentDeptModules.length;
  }, 0);

  if (selectedTier.name !== "Enterprise" && moduleCount > selectedTier.maxModules) {
    // Handle pricing if module limit is exceeded - perhaps return Infinity or a specific error state?
    // For now, let's just calculate based on selected modules, but this might need adjustment
    // based on business rules.
  }

  return Math.round(totalBeforeDiscount - discount);
};

interface LandingPricingState {
  departments: Department[];
  selectedTier: PricingTier;
  totalPrice: number;
  allModules: Module[]; // Keep track of all available modules if needed for toggling
  toggleModule: (moduleId: string, departmentId: string) => void;
  resetModules: () => void;
  setSelectedTier: (tier: PricingTier) => void;
  getTotalModulesCount: () => number;
  // calculateTotalPrice is now implicitly handled by updates
}

export const useLandingPricingStore = create<LandingPricingState>((set, get) => ({
  departments: initialDepartments.map((dept: Department) => ({ ...dept, modules: [] })), // Start with empty modules in each department
  selectedTier: pricingTiers[0],
  totalPrice: pricingTiers[0].basePrice,
  allModules: allModules, // Store all modules for easy lookup

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
          // Module doesn't exist, add it, respecting tier limits
          if (currentTier.name !== "Enterprise" && moduleCount >= currentTier.maxModules) {
            // Optionally show a notification to the user
            console.warn(
              `Cannot add module. ${currentTier.name} plan limit of ${currentTier.maxModules} modules reached.`,
            );
            return dept; // Return department unchanged
          }
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

      const newTotalPrice = calculateTotalPriceHelper(newDepartments, state.selectedTier);
      return { departments: newDepartments, totalPrice: newTotalPrice };
    });
  },

  resetModules: () => {
    set((state) => {
      const resetDepartments = initialDepartments.map((dept: Department) => ({
        ...dept,
        modules: [],
      }));
      const newTotalPrice = calculateTotalPriceHelper(resetDepartments, state.selectedTier);
      return { departments: resetDepartments, totalPrice: newTotalPrice };
    });
  },

  setSelectedTier: (tier: PricingTier) => {
    set((state) => {
      // When changing tiers, re-evaluate module limits and potentially remove excess modules
      let currentDepartments = state.departments;
      let moduleCount = state.getTotalModulesCount();
      let adjustedDepartments = currentDepartments;

      if (tier.name !== "Enterprise" && moduleCount > tier.maxModules) {
        console.warn(
          `Switching to ${tier.name}. Module limit is ${tier.maxModules}. You currently have ${moduleCount}. Excess modules may need to be removed.`,
        );
        // Implement logic here if modules should be automatically removed or user prompted
        // For now, we'll just recalculate price based on the new tier rules with existing modules.
        // A better UX might involve clearing modules or prompting the user.
      }

      const newTotalPrice = calculateTotalPriceHelper(adjustedDepartments, tier);
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
