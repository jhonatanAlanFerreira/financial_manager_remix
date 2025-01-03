import { MerchantFiltersFormInterface } from "~/components/page-components/merchants/merchant-interfaces";

export const MerchantFilterTagsConfig: {
  fieldName: keyof MerchantFiltersFormInterface;
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
];
