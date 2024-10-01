import { ClassificationFiltersFormInterface } from "~/components/page-components/classification/classification-finterfaces";

export const ClassificationFilterTagsConfig: {
  fieldName: keyof ClassificationFiltersFormInterface;
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
];
