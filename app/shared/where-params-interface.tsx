import { IsPersonalOrCompanyType } from "~/shared/shared-types";

export interface WhereParamsInterface {
  name?: string;
  company_id?: string;
  is_personal_or_company?: IsPersonalOrCompanyType;
}
