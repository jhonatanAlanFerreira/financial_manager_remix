import ExpenseFiltersForm from "~/interfaces/forms/expense/ExpenseFiltersForm";

export const ExpenseFilterTagsConfig: {
  fieldName: keyof ExpenseFiltersForm;
  label: string;
  getValue: (fieldValue: any) => string;
}[] = [
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
    fieldName: "amount_greater",
    label: "Amount Greater",
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "amount_less",
    label: "Amount Less",
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "is_personal_expense",
    label: "Personal Expense",
    getValue: (fieldValue: any) => "",
  },
];
