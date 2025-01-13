import { ThSortPropsInterface } from "~/components/th-sort/th-sort-props-interface";

export const IncomesThSortConfig: ThSortPropsInterface = {
  thSortConfigs: [
    {
      title: "Name",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "name",
    },
    {
      title: "Amount",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "amount",
    },
    {
      title: "Personal/Company",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "is_personal_or_company",
    },
    {
      title: "Actions",
      sort: false,
      className: "py-2 px-4 border-b",
    },
  ],
};
