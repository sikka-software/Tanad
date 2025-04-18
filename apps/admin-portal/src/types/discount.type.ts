import { CommentProps } from "@/types/comment.type";
import { MultiLangString } from "@/types/common.type";
import { InvoiceProps } from "@/types/invoice.type";
import { NoteProps } from "@/types/note.type";

export type DiscountProps = {
  _id: string;
  title: MultiLangString;
  description: MultiLangString;
  fixed_amount: string;
  percent_amount: string;
  discount_type: "fixed" | "percent";
  invoices?: InvoiceProps[];

  note?: NoteProps;
  comments?: CommentProps[];

  created_at?: string;
  updated_at?: string;
};

export type DiscountInput = Partial<DiscountProps>;
