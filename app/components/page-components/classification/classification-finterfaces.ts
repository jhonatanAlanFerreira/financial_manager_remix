import { Company } from "@prisma/client";
import { ClassificationWithRelationsInterface } from "~/data/classification/classification-types";
import { BasePageStoreInterface } from "~/shared/base-page-store-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";

export interface ClassificationFiltersFormInterface {
  name: string;
  has_company: Company | null;
  is_personal_or_company: IsPersonalOrCompanyType;
  is_income_or_expense: IsIncomeOrExpenseType;
}

export interface ClassificationFormInterface {
  id: string;
  name: string;
  companies: Company[];
  is_personal: boolean;
  is_income: boolean;
}

export interface ClassificationStoreInterface extends BasePageStoreInterface {
  classifications: ServerResponseInterface<
    ClassificationWithRelationsInterface[]
  >;
  setClassifications: (
    value: ServerResponseInterface<ClassificationWithRelationsInterface[]>
  ) => void;
  companies: ServerResponseInterface<Company[]>;
  setCompanies: (value: ServerResponseInterface<Company[]>) => void;
}
