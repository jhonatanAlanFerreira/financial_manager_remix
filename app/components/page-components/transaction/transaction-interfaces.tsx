import {
  Account,
  Company,
  Expense,
  Income,
  Merchant,
  TransactionClassification,
} from "@prisma/client";
import { TransactionsWithTotalsInterface } from "~/data/transaction/transaction-types";
import { BasePageStoreInterface } from "~/shared/base-page-store-interface";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";

export interface TransactionFiltersFormInterface {
  name: string;
  is_personal_or_company: IsPersonalOrCompanyType;
  is_income_or_expense: IsIncomeOrExpenseType;
  company: Company | null;
  expense: Expense | null;
  income: Income | null;
  merchant: Merchant | null;
  date_after: string;
  date_before: string;
  amount_greater: number;
  amount_less: number;
  account: Account | null;
  has_classification: TransactionClassification | null;
}

export interface TransactionFormInterface {
  id: string;
  date: string;
  amount: number;
  is_personal: boolean;
  is_income: boolean;
  transaction_classifications: TransactionClassification[];
  income: Income | null;
  company: Company | null;
  expense: Expense | null;
  account: Account | null;
  merchant: Merchant | null;
  name: string;
  description: string | null;
}

export interface TransactionAddPropsInterface {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onModalCancel: () => void;
  isSubmitting: boolean;
  responseErrors: ServerResponseErrorInterface;
}

export interface TransactionFiltersPropsInterface {
  onSubmit: () => void;
}

export interface TransactionStoreInterface extends BasePageStoreInterface {
  totalExpenseValue: number;
  setTotalExpenseValue: (value: number) => void;
  totalIncomeValue: number;
  setTotalIncomeValue: (value: number) => void;
  transactions: ServerResponseInterface<TransactionsWithTotalsInterface>;
  setTransactions: (
    value: ServerResponseInterface<TransactionsWithTotalsInterface>
  ) => void;
}
