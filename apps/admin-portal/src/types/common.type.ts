import { currencies } from "@/lib/constants/currencies";
import { locales } from "@/lib/constants/locales";

export type LanguageProps = (typeof locales)[number];
export type CurrencyProps = (typeof currencies)[number];

export type ThemeProps = "light" | "dark";

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
