import { Account } from "@prisma/client";
import { CompanyWithAccountsType } from "~/data/company/company-types";

export interface AccountFormInterface {
  id: string;
  name: string;
  balance: number;
  company: string;
}

export interface CompanyFiltersFormInterface {
  name: string;
  working_capital_greater: number;
  working_capital_less: number;
  with_accounts: boolean;
}

export interface CompanyFormInterface {
  id: string;
  name: string;
}

export interface AccountDropdownPropsInterface {
  company?: CompanyWithAccountsType;
  userAccounts?: Account[];
  onSave: () => void;
  onAccountRemove: () => void;
}