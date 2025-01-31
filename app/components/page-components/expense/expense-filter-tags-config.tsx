import { ExpenseFiltersFormInterface } from "~/components/page-components/expense/expense-interfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const ExpenseFilterTagsConfig: FilterTagsConfigInterface<ExpenseFiltersFormInterface>[] =
  [
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
    {
      fieldName: "amount_greater",
      label: "Amount Greater",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "amount_less",
      label: "Amount Less",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue,
    },
  ];
