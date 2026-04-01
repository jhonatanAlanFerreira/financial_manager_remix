import { Company } from "@prisma/client";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";
import { ExpenseWithRelationsInterface } from "~/data/expense/expense-types";
import { BasePageStoreInterface } from "~/shared/base-page-store-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export interface ExpenseFiltersFormInterface {
  name: string;
  amount_greater: number;
  amount_less: number;
  has_company: Company | null;
  is_personal_or_company: IsPersonalOrCompanyType;
}

export interface ExpenseFormInterface {
  id: string;
  name: string;
  amount: number | null;
  companies: Company[];
  is_personal: boolean;
}

export interface ExpenseStoreInterface extends BasePageStoreInterface {
  expenses: ServerResponseInterface<ExpenseWithRelationsInterface[]>;
  setExpenses: (
    value: ServerResponseInterface<ExpenseWithRelationsInterface[]>
  ) => void;
  companies: ServerResponseInterface<Company[]>;
  setCompanies: (value: ServerResponseInterface<Company[]>) => void;
}
