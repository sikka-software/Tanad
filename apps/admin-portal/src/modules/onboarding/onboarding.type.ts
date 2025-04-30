import type { enterprises } from "@/db/schema";

export type Enterprise = {
  id: string;
  name: string;
  description: string;
  logo: string;
  email: string;
  industry: string;
  size: string;
  created_at: string;
};

export type EnterpriseCreateData = Pick<
  Enterprise,
  "name" | "description" | "logo" | "email" | "industry" | "size"
>;

export const INDUSTRY_OPTIONS = [
  { label: "Technology", value: "technology" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Finance", value: "finance" },
  { label: "Education", value: "education" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Retail", value: "retail" },
  { label: "Other", value: "other" },
];

export const SIZE_OPTIONS = [
  { label: "1-10", value: "1-10" },
  { label: "11-50", value: "11-50" },
  { label: "51-200", value: "51-200" },
  { label: "201-500", value: "201-500" },
  { label: "501-1000", value: "501-1000" },
  { label: "1000+", value: "1000+" },
];
