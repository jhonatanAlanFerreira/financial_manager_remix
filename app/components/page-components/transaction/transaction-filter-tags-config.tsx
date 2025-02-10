import { formatDate } from "~/utils/utilities";
import { TransactionFiltersFormInterface } from "~/components/page-components/transaction/transaction-interfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const TransactionFilterTagsConfig: FilterTagsConfigInterface<TransactionFiltersFormInterface>[] =
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
      fieldName: "date_after",
      tagLabel: "Date After",
      getTagValue: (fieldValue: any) =>
        formatDate(fieldValue)?.toString() || "",
    },
    {
      fieldName: "date_before",
      tagLabel: "Date Before",
      getTagValue: (fieldValue: any) =>
        formatDate(fieldValue)?.toString() || "",
    },
    {
      fieldName: "name",
      tagLabel: "Name",
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "has_classification",
      tagLabel: "Classification",
      getTagValue: (fieldValue: any) => fieldValue?.name,
    },
    {
      fieldName: "account",
      tagLabel: "Account",
      getTagValue: (fieldValue: any) => fieldValue?.name,
    },
    {
      fieldName: "company",
      tagLabel: "Company",
      getTagValue: (fieldValue: any) => fieldValue?.name,
    },
    {
      fieldName: "expense",
      tagLabel: "Expense",
      getTagValue: (fieldValue: any) => fieldValue?.name,
    },
    {
      fieldName: "income",
      tagLabel: "Income",
      getTagValue: (fieldValue: any) => fieldValue?.name,
    },
    {
      fieldName: "merchant",
      tagLabel: "Merchant",
      getTagValue: (fieldValue: any) => fieldValue?.name,
    },
    {
      fieldName: "amount_greater",
      tagLabel: "Amount Greater",
      defaultFieldValue: 0,
      getTagValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "amount_less",
      tagLabel: "Amount Less",
      defaultFieldValue: 0,
      getTagValue: (fieldValue: any) => fieldValue,
    },
  ];
