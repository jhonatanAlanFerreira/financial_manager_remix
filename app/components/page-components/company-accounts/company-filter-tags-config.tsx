import { CompanyFiltersFormInterface } from "~/components/page-components/company-accounts/company-accounts-interfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const CompanyFilterTagsConfig: FilterTagsConfigInterface<CompanyFiltersFormInterface>[] =
  [
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
