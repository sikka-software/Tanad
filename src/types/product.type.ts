import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
} from "@/lib/constants/product-consts";

import { CommentProps } from "./comment.type";
import { InvoiceProps } from "./invoice.type";

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ProductProps = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  price_usd?: any;
  explorable?: any;
  status: ProductStatus;
  invoices?: InvoiceProps[];
  product_type?: "" | "physical" | "digital" | "service";
  category?: "" | ProductCategory;
  sku?: string;

  quantity?: number; //TODO: i added this only because the api schema has it

  note?: NoteProps;
  comments?: CommentProps[];

  createdAt?: string;
  updatedAt?: string;
};

export type NoteProps = {
  _id?: string;
  title?: string;
  description?: string;
  content?: any;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
};
