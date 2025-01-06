import { ThSortPropsInterface } from "~/components/th-sort/th-sort-props-interface";

export const ClassificationThSortConfig: ThSortPropsInterface = {
  thSortConfigs: [
    {
      title: "Name",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "name",
    },
    {
      title: "Type",
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
      title: "Actions",
      sort: false,
      className: "py-2 px-4 border-b",
    },
  ],
};
