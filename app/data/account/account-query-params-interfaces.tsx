import PaginationParamsInterface from "~/shared/pagination-params-interface";

export default interface AccountLoaderParamsInterface extends PaginationParamsInterface {
  name: string | null;
}
