import {
  CalendarProps,
  CurrencyProps,
  LanguageProps,
  MultiLangString,
  ThemeProps,
} from "@/types/common.type";

import { CommentProps } from "./comment.type";
import { NoteProps } from "./note.type";

export type UserProps = {
  _id: string;

  status: "active" | "inactive" | "deactivated" | "blocked" | "verified" | "unverified";

  email: string;
  phone?: string;
  username?: string;
  password: string;

  first_name?: MultiLangString;
  last_name?: MultiLangString;

  stripe_customer_id?: string;

  default_card: string | null;
  cards: any[];
  user_agreement_id: string;

  settings: UserSettingsProps;

  paymentMethods: {
    cards: any[];
    paypal: string;
    googlePay: string;
  };

  note?: NoteProps;
  comments?: CommentProps[];

  admin_id?: string;
  client_id?: string;
  employee_id?: string;

  created_at?: string;
  updated_at?: string;
};

export type UserInputProps = {
  username: string;
  email: string;
  password: string;
  phone?: string;
  user_type: "admin" | "client" | "employee";
  first_name?: MultiLangString;
  last_name?: MultiLangString;

  role?: string;
};

export type UserSettingsProps = {
  timezone?: string;
  currency?: CurrencyProps;
  theme?: ThemeProps;
  lang?: LanguageProps;
  calendar?: CalendarProps;
};
