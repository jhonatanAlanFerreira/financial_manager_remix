import { Company } from "@prisma/client";
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
