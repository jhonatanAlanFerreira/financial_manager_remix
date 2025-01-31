import { ClassificationFiltersFormInterface } from "~/components/page-components/classification/classification-finterfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const ClassificationFilterTagsConfig: FilterTagsConfigInterface<ClassificationFiltersFormInterface>[] =
  [
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
      fieldName: "has_company",
      label: "Company",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue.name,
    },
  ];
