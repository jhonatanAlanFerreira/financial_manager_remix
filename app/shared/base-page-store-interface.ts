import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";

export interface BasePageStoreInterface {
  loading: boolean;
  setLoading: (value: boolean) => void;
  searchParams: string;
  setSearchParams: (value: string) => void;
  getSearchParams: () => string;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  sortParams: string;
  setSortParams: (value: string) => void;
  getSortParams: () => string;
  totalPages: number;
  setTotalPages: (value: number) => void;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  getCurrentPage: () => number;
  responseErrors: ServerResponseErrorInterface;
  setResponseErrors: (value: ServerResponseErrorInterface) => void;
  modals: "filter" | "add" | "remove" | null;
  setModals: (value: "filter" | "add" | "remove" | null) => void;
}
