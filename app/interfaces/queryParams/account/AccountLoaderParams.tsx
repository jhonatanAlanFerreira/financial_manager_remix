import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface AccountLoaderParams extends PaginationParams {
  name: string | null;
}
