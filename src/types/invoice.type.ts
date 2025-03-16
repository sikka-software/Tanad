import {
  INVOICE_CYCLES,
  INVOICE_RECURRENCE,
  INVOICE_STATUSES,
} from "@/lib/constants/invoice-consts";

import { ClientProps } from "@/types/client.type";
import { CommentProps } from "@/types/comment.type";
import { CompanyProps } from "@/types/company.type";
import { DiscountProps } from "@/types/discount.type";
import { NoteProps } from "@/types/note.type";
import { ProductProps } from "@/types/product.type";
import { TransactionProps } from "@/types/transaction.type";

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type InvoiceRecurrence = (typeof INVOICE_RECURRENCE)[number];
export type InvoiceRecurrenceCycle = (typeof INVOICE_CYCLES)[number];

export type ProductForInvoiceProps = {
  product: ProductProps;
  quantity: number;
  title?: string;
  description?: string;
};

export type InvoiceProps = {
  title: string;
  description: string;
  amount: number;
  date: string;
  expiry_date: string;
  status: InvoiceStatus;
  client: ClientProps;
  company?: CompanyProps | string;
  currency: "sar" | "usd";
  discounts?: DiscountProps[];
  products: ProductForInvoiceProps[];
  vat_enabled?: boolean;
  link?: string;
  s3_link?: string;
  invoice_type?: "one_time" | "recurring";

  total_vat: number;
  total: number;
  total_with_vat: number;
  total_products: number;
  total_discounts: number;
  grand_total: number;
  payment_gateway:
    | "payfort"
    | "mada"
    | "visa"
    | "mastercard"
    | "apple_pay"
    | "google_pay"
    | "sadad"
    | "other"
    | string;

  stripe_price_id?: string;

  agreement_id: string;
  stripe_subscription_id?: string;
  recurrence: InvoiceRecurrenceCycle;
  next_payment: any;
  payment_status: "completed" | "awaiting_payment" | string; //TODO: make this possible options
  increment_id: any;
  payfort_token_tmp: any;
  token_name?: string;
  final_transaction?: TransactionProps | string;
  transactions: (TransactionProps | string)[];

  note?: NoteProps;
  comments?: CommentProps[];

  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceInput = Partial<InvoiceProps>;
