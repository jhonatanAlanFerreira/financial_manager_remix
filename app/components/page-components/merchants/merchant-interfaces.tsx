import { Merchant } from "@prisma/client";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export interface MerchantFiltersFormInterface {
  name: string;
}

export interface MerchantFormInterface {
  id: string;
  name: string;
}

export interface MerchantStoreInterface {
  loading: boolean;
  setLoading: (value: boolean) => void;
  searchParams: string;
  setSearchParams: (value: string) => void;
  openFilterModal: boolean;
  setOpenFilterModal: (value: boolean) => void;
  openAddModal: boolean;
  setOpenAddModal: (value: boolean) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  openRemoveModal: boolean;
  setOpenRemoveModal: (value: boolean) => void;
  sortParams: string;
  setSortParams: (value: string) => void;
  totalPages: number;
  setTotalPages: (value: number) => void;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  responseErrors: ServerResponseErrorInterface;
  setResponseErrors: (value: ServerResponseErrorInterface) => void;
  merchants: ServerResponseInterface<Merchant[]>;
  setMerchants: (value: ServerResponseInterface<Merchant[]>) => void;
}
