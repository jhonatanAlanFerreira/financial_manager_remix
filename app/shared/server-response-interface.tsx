export default interface ServerResponseInterface<T = any> {
  error?: boolean;
  message?: string;
  data?: T;
  pageInfo?: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
