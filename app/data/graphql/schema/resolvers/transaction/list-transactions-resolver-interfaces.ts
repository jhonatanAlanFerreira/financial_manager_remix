import {
  IsIncomeOrExpenseGraphqlType,
  IsPersonalOrCompanyGraphqlType,
} from "~/data/graphql/schema/graphql-globals";

export interface ListTransactionResolverParamsInterface {
  name: string;
  is_personal_or_company: IsPersonalOrCompanyGraphqlType;
  is_income_or_expense: IsIncomeOrExpenseGraphqlType;
}
