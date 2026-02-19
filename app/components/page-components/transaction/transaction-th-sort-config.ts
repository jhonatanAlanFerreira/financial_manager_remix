import { ThSortPropsInterface } from "~/components/th-sort/th-sort-props-interface";

export const TransactionThSortConfig: ThSortPropsInterface = {
  thSortConfigs: [
    {
      title: "Date",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "date",
    },
    {
      title: "Name",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "name",
    },
    {
      title: "Personal/Company",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "is_personal_or_company",
    },
    {
      title: "Income/Expense",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "is_income_or_expense",
    },
    {
      title: "Company",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "company",
    },
    {
      title: "Expense",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "expense",
    },
    {
      title: "Income",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "income",
    },
    {
      title: "Merchant",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "merchant",
    },
    {
      title: "Amount",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "amount",
    },
    {
      title: "Actions",
      sort: false,
      className: "py-2 px-4 border-b",
    },
  ],
};
