import IncomeFiltersForm from "~/interfaces/forms/income/IncomeFiltersForm";

export const IncomeFilterTagsConfig: {
  fieldName: keyof IncomeFiltersForm;
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
    fieldName: "is_personal_income",
    label: "Personal Income",
    getValue: (fieldValue: any) => "",
  },
];
