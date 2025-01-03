import { IncomeFiltersFormInterface } from "~/components/page-components/income/income-interfaces";

export const IncomeFilterTagsConfig: {
  fieldName: keyof IncomeFiltersFormInterface;
  label: string;
  closeBtn: boolean;
  getValue: (fieldValue: any) => string;
}[] = [
  {
    fieldName: "is_personal_or_company",
    label: "Personal/Company",
    closeBtn: false,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "name",
    label: "Name",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "has_company",
    label: "Company",
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
