import { Company, Expense, Income } from "@prisma/client";
import { FormikProps } from "formik";
import { TransactionFiltersForm } from "~/interfaces/forms/TransactionFiltersForm";

export interface FiltersProps {
  companies: Company[];
  expenses: Expense[];
  incomes: Income[];
  formik: FormikProps<TransactionFiltersForm>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}
