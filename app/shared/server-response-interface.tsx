import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";

export interface ServerResponseInterface<T = any> {
  serverError?: ServerResponseErrorInterface;
  message?: string;
  data?: T;
  code?: number;
  pageInfo?: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
