import { IncomeFiltersFormInterface } from "~/components/page-components/income/income-interfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const IncomeFilterTagsConfig: FilterTagsConfigInterface<IncomeFiltersFormInterface>[] =
  [
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
    {
      fieldName: "amount_greater",
      tagLabel: "Amount Greater",
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "amount_less",
      tagLabel: "Amount Less",
      getTagValue: (fieldValue: any) => fieldValue,
    },
  ];
