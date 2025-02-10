import { CompanyFiltersFormInterface } from "~/components/page-components/company-accounts/company-accounts-interfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const CompanyFilterTagsConfig: FilterTagsConfigInterface<CompanyFiltersFormInterface>[] =
  [
    {
      fieldName: "name",
      tagLabel: "Name",
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "working_capital_greater",
      tagLabel: "Working Capital Greater",
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "working_capital_less",
      tagLabel: "Working Capital Less",
      getTagValue: (fieldValue: any) => fieldValue,
    },
  ];
