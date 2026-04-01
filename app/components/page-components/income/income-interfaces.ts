import { Company } from "@prisma/client";
import { IncomeWithRelationsInterface } from "~/data/income/income-types";
import { BasePageStoreInterface } from "~/shared/base-page-store-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";

export interface IncomeFiltersFormInterface {
  name: string;
  amount_greater: number;
  amount_less: number;
  has_company: Company | null;
  is_personal_or_company: IsPersonalOrCompanyType;
}

export interface IncomeFormInterface {
  id: string;
  name: string;
  amount: number | null;
  companies: Company[];
  is_personal: boolean;
}

export interface IncomeStoreInterface extends BasePageStoreInterface {
  incomes: ServerResponseInterface<IncomeWithRelationsInterface[]>;
  setIncomes: (
    value: ServerResponseInterface<IncomeWithRelationsInterface[]>
  ) => void;
  companies: ServerResponseInterface<Company[]>;
  setCompanies: (value: ServerResponseInterface<Company[]>) => void;
}
