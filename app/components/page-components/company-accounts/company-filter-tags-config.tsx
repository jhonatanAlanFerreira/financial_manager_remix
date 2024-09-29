import CompanyFiltersForm from "~/interfaces/forms/company/CompanyFiltersForm";

export const CompanyFilterTagsConfig: {
  fieldName: keyof CompanyFiltersForm;
  label: string;
  closeBtn: boolean;
  getValue: (fieldValue: any) => string;
}[] = [
  {
    fieldName: "name",
    label: "Name",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "working_capital_greater",
    label: "Working Capital Greater",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue,
  },
  {
    fieldName: "working_capital_less",
    label: "Working Capital Less",
    closeBtn: true,
    getValue: (fieldValue: any) => fieldValue,
  },
];
