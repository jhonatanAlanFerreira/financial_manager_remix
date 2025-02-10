import { ClassificationFiltersFormInterface } from "~/components/page-components/classification/classification-finterfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const ClassificationFilterTagsConfig: FilterTagsConfigInterface<ClassificationFiltersFormInterface>[] =
  [
    {
      fieldName: "is_income_or_expense",
      tagLabel: "Income/Expense",
      defaultFieldValue: "all",
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "is_personal_or_company",
      tagLabel: "Personal/Company",
      defaultFieldValue: "all",
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "name",
      tagLabel: "Name",
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "has_company",
      tagLabel: "Company",
      getTagValue: (fieldValue: any) => fieldValue?.name,
    },
  ];
