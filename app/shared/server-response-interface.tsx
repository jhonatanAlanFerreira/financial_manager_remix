import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";

export interface ServerResponseInterface<T = any> {
  errors?: ServerResponseErrorInterface;
  message?: string;
  data?: T;
  pageInfo?: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
