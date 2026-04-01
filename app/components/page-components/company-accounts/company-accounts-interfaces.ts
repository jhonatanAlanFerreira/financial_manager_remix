import { Account } from "@prisma/client";
import { CompanyWithRelationsInterface } from "~/data/company/company-types";

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
}

export interface CompanyFormInterface {
  id: string;
  name: string;
}

export interface AccountDropdownPropsInterface {
  company?: CompanyWithRelationsInterface;
  userAccounts?: Account[];
  onSave: () => void;
  onAccountRemove: () => void;
}
