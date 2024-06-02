import {
  Company,
  Expense,
  Income,
  TransactionClassification,
} from "@prisma/client";
import { FormikProps } from "formik";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import { TransactionForm } from "~/interfaces/forms/TransactionForm";

export interface AddProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  setSkipEffect: (value: boolean) => void;
  onModalCancel: () => void;
  formik: FormikProps<TransactionForm>;
  skipEffect: boolean;
  isSubmitting: boolean;
  responseErrors: ServerResponse<ValidatedData>;
  companies: Company[];
  expenses: Expense[];
  incomes: Income[];
  classifications: TransactionClassification[];
}
