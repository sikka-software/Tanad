import { AcceptedPaymentMethods } from "@/lib/constants/payment-consts";
import { ClientProps } from "@/types/client.type";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "failed"
  | "cancelled"
  | "refunded";

export type TransactionProps = {
  id: string;
  _id: string;
  invoice: string;
  amount: number;
  currency: "sar" | "usd";
  status: TransactionStatus;
  card?: string;
  // APS Data
  fort_id: string;
  token_name: string;
  agreement_id: string;
  invoice_id: any; //TODO: change to InvoiceProps
  invoice_payment: any; //TODO: change to PaymentProps
  invoice_client: ClientProps;
  payment_token: any;
  payment_details?: any;
  payment_method: AcceptedPaymentMethods;
  language: "ar" | "en";

  createdAt: string;
};

export type TransactionInput = Omit<
  Partial<TransactionProps>,
  "invoice_client"
> & {
  invoice_client: string;
};
