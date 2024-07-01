import { TransactionFiltersForm } from "~/interfaces/forms/transaction/TransactionFiltersForm";
import { formatDate } from "~/utilities";

export const TransactionFilterTagsConfig: {
  fieldName: keyof TransactionFiltersForm;
  label: string;
  closeBtn: boolean;
  getValue: (fieldValue: any) => string;
}[] = [
  {
    fieldName: "is_income_or_expense",
    label: "Income/Expense",
    closeBtn: false,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "is_personal_or_company",
    label: "Personal/Company",
    closeBtn: false,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "date_after",
    label: "Date After",
    closeBtn: true,
    getValue: (fieldValue: any) => formatDate(fieldValue)?.toString() || "",
  },
  {
    fieldName: "date_before",
    label: "Date Before",
    closeBtn: true,
    getValue: (fieldValue: any) => formatDate(fieldValue)?.toString() || "",
  },
  {
    fieldName: "name",
    label: "Name",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "company",
    label: "Company",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue.name,
  },
  {
    fieldName: "expense",
    label: "Expense",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue.name,
  },
  {
    fieldName: "income",
    label: "Income",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue.name,
  },
  {
    fieldName: "amount_greater",
    label: "Amount Greater",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "amount_less",
    label: "Amount Less",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue,
  },
];
