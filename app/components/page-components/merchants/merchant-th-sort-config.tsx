import { ThSortPropsInterface } from "~/components/th-sort/th-sort-props-interface";

export const MerchantThSortConfig: ThSortPropsInterface = {
  thSortConfigs: [
    {
      title: "Name",
      sort: true,
      className: "py-2 px-4 border-b border-r",
      key: "name",
    },
    {
      title: "Actions",
      sort: false,
      className: "py-2 px-4 border-b",
    },
  ],
};
