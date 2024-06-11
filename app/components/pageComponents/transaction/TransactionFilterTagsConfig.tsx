import { TransactionFiltersForm } from "~/interfaces/forms/transaction/TransactionFiltersForm";
import { formatDate } from "~/utilities";

export const TransactionFilterTagsConfig: {
  fieldName: keyof TransactionFiltersForm;
  label: string;
  getValue: (fieldValue: any) => string;
}[] = [
  {
    fieldName: "date_after",
    label: "Date After",
    getValue: (fieldValue: any) => formatDate(fieldValue)?.toString() || "",
  },
  {
    fieldName: "date_before",
    label: "Date Before",
    getValue: (fieldValue: any) => formatDate(fieldValue)?.toString() || "",
  },
  {
    fieldName: "is_personal_transaction",
    label: "Personal Transaction",
    getValue: (fieldValue: any) => "",
  },
  {
    fieldName: "is_income_transaction",
    label: "Income Transaction",
    getValue: (fieldValue: any) => "",
  },
  {
    fieldName: "name",
    label: "Name",
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "company",
    label: "Company",
    getValue: (fieldValue: any) => fieldValue.name,
  },
  {
    fieldName: "expense",
    label: "Expense",
    getValue: (fieldValue: any) => fieldValue.name,
  },
  {
    fieldName: "income",
    label: "Income",
    getValue: (fieldValue: any) => fieldValue.name,
  },
  {
    fieldName: "amount_greater",
    label: "Amount Greater",
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "amount_less",
    label: "Amount Less",
    getValue: (fieldValue: any) => fieldValue,
  },
];
