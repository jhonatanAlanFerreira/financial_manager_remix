import {
  Account,
  Company,
  Expense,
  Income,
  Transaction,
  TransactionClassification,
} from "@prisma/client";
import { FormikProps } from "formik";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export interface TransactionFiltersFormInterface {
  name: string;
  is_personal_or_company: "personal" | "company" | "all";
  is_income_or_expense: "income" | "expense" | "all";
  company: Company | null;
  expense: Expense | null;
  income: Income | null;
  date_after: string;
  date_before: string;
  amount_greater: number;
  amount_less: number;
}

export interface TransactionFormInterface {
  id: string;
  transaction_date: string;
  amount: number;
  is_personal_transaction: boolean;
  is_income: boolean;
  classifications: TransactionClassification[];
  income: Income | null;
  company: Company | null;
  expense: Expense | null;
  account: Account | null;
  name: string;
}

export interface TransactionAddPropsInterface {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  setSkipEffect: (value: boolean) => void;
  onModalCancel: () => void;
  formik: FormikProps<TransactionFormInterface>;
  skipEffect: boolean;
  isSubmitting: boolean;
  responseErrors: ServerResponseInterface<any>; //WIP
  companies: Company[];
  expenses: Expense[];
  incomes: Income[];
  classifications: TransactionClassification[];
  accounts: Account[];
}

export interface TransactionFiltersPropsInterface {
  companies: Company[];
  expenses: Expense[];
  incomes: Income[];
  formik: FormikProps<TransactionFiltersFormInterface>;
  onSubmit: () => void;
}

export interface TransactionsWithTotalsInterface {
  transactions: Transaction[];
  totalIncomeValue: number;
  totalExpenseValue: number;
}
