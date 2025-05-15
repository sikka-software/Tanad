import { currencies } from "@/lib/constants/currencies";
import { locales } from "@/lib/constants/locales";

import { Constants } from "../lib/database.types";

export const CommonStatus = Constants.public.Enums.common_status;
export type CommonStatusProps = (typeof CommonStatus)[number];

export const PaymentCycle = Constants.public.Enums.payment_cycle;
export type PaymentCycleProps = (typeof PaymentCycle)[number];

export const VehicleStatus = Constants.public.Enums.vehicle_status;
export type VehicleStatusProps = (typeof VehicleStatus)[number];

export type LanguageProps = (typeof locales)[number];
export type CurrencyProps = (typeof currencies)[number];

export type ThemeProps = "light" | "dark";

export type ViewMode = "table" | "cards";

export type SortRule = {
  field: string;
  direction: "asc" | "desc";
};
export type CalendarProps = "gregorian" | "hijri";
export type MultiLangString = {
  [key: string]: string | undefined;
  ar?: string;
  en?: string;
};

export type inlineCardProps = {
  id: string;
  brand: string;
};

export interface FilterCondition {
  id: number;
  field: string;
  operator: string;
  value: string;
  type: "text" | "number" | "date";
  conjunction: "and" | "or";
}

export interface SortableColumn {
  value: string;
  translationKey: string;
}

export interface FilterableField {
  id: string;
  type: "text" | "number" | "date";
  translationKey: string;
}

export interface ModuleTableProps<T> {
  data: T[];
  isLoading?: boolean;
  error?: Error | null;
  onActionClicked: (action: string, rowId: string) => void;
}

export interface ModuleFormProps<T> {
  formHtmlId?: string;
  onSuccess?: () => void;
  onError?: () => void;
  defaultValues?: T | null;
  editMode?: boolean;
  nestedForm?: boolean;
}

export interface AddressProps {
  short_address?: string;
  building_number?: string;
  street_name?: string;
  city?: string;
  region?: string;
  country?: string;
  zip_code?: string;
  additional_number?: string;
}
