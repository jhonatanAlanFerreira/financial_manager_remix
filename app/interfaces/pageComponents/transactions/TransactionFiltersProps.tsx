import { Company, Expense, Income } from "@prisma/client";
import { FormikProps } from "formik";
import { TransactionFiltersForm } from "~/interfaces/forms/transaction/TransactionFiltersForm";

export interface TransactionFiltersProps {
  companies: Company[];
  expenses: Expense[];
  incomes: Income[];
  formik: FormikProps<TransactionFiltersForm>;
  onSubmit: () => void;
}
