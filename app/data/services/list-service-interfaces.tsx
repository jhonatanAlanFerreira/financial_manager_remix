import {
  Account,
  Company,
  Expense,
  Income,
  Prisma,
  Transaction,
  TransactionClassification,
  User,
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
  | Income;

export type CountArgs =
  | Prisma.AccountCountArgs
  | Prisma.UserCountArgs
  | Prisma.CompanyCountArgs
  | Prisma.ExpenseCountArgs
  | Prisma.TransactionCountArgs
  | Prisma.TransactionClassificationCountArgs
  | Prisma.IncomeCountArgs;

export type FindManyArgs =
  | Prisma.AccountFindManyArgs
  | Prisma.UserFindManyArgs
  | Prisma.CompanyFindManyArgs
  | Prisma.ExpenseFindManyArgs
  | Prisma.TransactionFindManyArgs
  | Prisma.TransactionClassificationFindManyArgs
  | Prisma.IncomeFindManyArgs;

export type WhereInputs =
  | Prisma.AccountWhereInput
  | Prisma.UserWhereInput
  | Prisma.CompanyWhereInput
  | Prisma.ExpenseWhereInput
  | Prisma.TransactionWhereInput
  | Prisma.TransactionClassificationWhereInput
  | Prisma.IncomeWhereInput;

export type AdditionalArgs = Omit<FindManyArgs, "where" | "skip" | "take">;
