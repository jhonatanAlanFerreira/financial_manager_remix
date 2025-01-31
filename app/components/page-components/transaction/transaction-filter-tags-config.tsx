import { formatDate } from "~/utils/utilities";
import { TransactionFiltersFormInterface } from "~/components/page-components/transaction/transaction-interfaces";
import { FilterTagsConfigInterface } from "~/shared/filter-tags-config-interface";

export const TransactionFilterTagsConfig: FilterTagsConfigInterface<TransactionFiltersFormInterface>[] =
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
      fieldName: "date_after",
      label: "Date After",
      closeBtn: true,
      getValue: (fieldValue: any) => formatDate(fieldValue)?.toString() || "",
    },
    {
      fieldName: "date_before",
      label: "Date Before",
      closeBtn: true,
      getValue: (fieldValue: any) => formatDate(fieldValue)?.toString() || "",
    },
    {
      fieldName: "name",
      label: "Name",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue,
    },
    {
      fieldName: "has_classification",
      label: "Classification",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue.name,
    },
    {
      fieldName: "account",
      label: "Account",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue.name,
    },
    {
      fieldName: "company",
      label: "Company",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue.name,
    },
    {
      fieldName: "expense",
      label: "Expense",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue.name,
    },
    {
      fieldName: "income",
      label: "Income",
      closeBtn: true,
      getValue: (fieldValue: any) => fieldValue.name,
    },
    {
      fieldName: "merchant",
      label: "Merchant",
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
