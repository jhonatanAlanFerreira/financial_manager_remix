import { MerchantFiltersFormInterface } from "~/components/page-components/merchants/merchant-interfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const MerchantFilterTagsConfig: FilterTagsConfigInterface<MerchantFiltersFormInterface>[] =
  [
    {
      fieldName: "name",
      tagLabel: "Name",
      getTagValue: (fieldValue: any) => fieldValue,
    },
  ];
