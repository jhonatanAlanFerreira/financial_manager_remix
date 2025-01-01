import {
  Account,
  Company,
  Expense,
  Income,
  Prisma,
  Transaction,
  TransactionClassification,
  User,
  Merchant,
} from "@prisma/client";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";

export interface ListParamsInterface extends PaginationParamsInterface {
  name?: string;
  company?: string;
  is_personal_or_company?: "all" | "personal" | "company";
}

export type Models =
  | Account
  | User
  | Company
  | Expense
  | Transaction
  | TransactionClassification
  | Income
  | Merchant;

export type CountArgs =
  | Prisma.AccountCountArgs
  | Prisma.UserCountArgs
  | Prisma.CompanyCountArgs
  | Prisma.ExpenseCountArgs
  | Prisma.TransactionCountArgs
  | Prisma.TransactionClassificationCountArgs
  | Prisma.IncomeCountArgs
  | Prisma.MerchantCountArgs;

export type FindManyArgs =
  | Prisma.AccountFindManyArgs
  | Prisma.UserFindManyArgs
  | Prisma.CompanyFindManyArgs
  | Prisma.ExpenseFindManyArgs
  | Prisma.TransactionFindManyArgs
  | Prisma.TransactionClassificationFindManyArgs
  | Prisma.IncomeFindManyArgs
  | Prisma.MerchantFindManyArgs;

export type WhereInputs =
  | Prisma.AccountWhereInput
  | Prisma.UserWhereInput
  | Prisma.CompanyWhereInput
  | Prisma.ExpenseWhereInput
  | Prisma.TransactionWhereInput
  | Prisma.TransactionClassificationWhereInput
  | Prisma.IncomeWhereInput
  | Prisma.MerchantWhereInput;

export type AdditionalArgs = Omit<FindManyArgs, "where" | "skip" | "take">;
