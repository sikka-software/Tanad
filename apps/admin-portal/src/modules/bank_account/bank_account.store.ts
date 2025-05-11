import { createGenericStore } from "@/utils/generic-store";

import { BankAccount } from "./bank_account.type";

const useBankAccountStore = createGenericStore<BankAccount>("bank_accounts");

export default useBankAccountStore;
