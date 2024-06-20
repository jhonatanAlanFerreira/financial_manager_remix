import ClassificationFiltersForm from "~/interfaces/forms/classification/ClassificationFiltersForm";

export const ClassificationFilterTagsConfig: {
  fieldName: keyof ClassificationFiltersForm;
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
    fieldName: "is_personal_transaction_classification",
    label: "Personal Classification",
    getValue: (fieldValue: any) => "",
  },
  {
    fieldName: "is_income",
    label: "Income",
    getValue: (fieldValue: any) => "",
  },
];
