import { IResolvers } from "@graphql-tools/utils";

export interface SchemaDefInterface {
  typeDefs: string;
  resolvers: IResolvers<any, any>;
}

export type IsPersonalOrCompanyGraphqlType =
  | "PERSONAL_ONLY"
  | "COMPANY_ONLY"
  | "ALL";

export type IsIncomeOrExpenseGraphqlType =
  | "EXPENSE_ONLY"
  | "INCOME_ONLY"
  | "ALL";
