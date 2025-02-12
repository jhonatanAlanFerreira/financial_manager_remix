import { create } from "zustand";
import { MerchantStoreInterface } from "~/components/page-components/merchants/merchant-interfaces";

export const merchantStore = create<MerchantStoreInterface>((set, get) => ({
  loading: true,
  setLoading: (value) => set({ loading: value }),
  searchParams: "",
  setSearchParams: (value) => set({ searchParams: value }),
  openFilterModal: false,
  setOpenFilterModal: (value) => set({ openFilterModal: value }),
  openAddModal: false,
  setOpenAddModal: (value) => set({ openAddModal: value }),
  isSubmitting: false,
  setIsSubmitting: (value) => set({ isSubmitting: value }),
  openRemoveModal: false,
  setOpenRemoveModal: (value) => set({ openRemoveModal: value }),
  sortParams: "",
  setSortParams: (value) => set({ sortParams: value }),
  totalPages: 0,
  setTotalPages: (value) => set({ totalPages: value }),
  currentPage: 1,
  setCurrentPage: (value) => set({ currentPage: value }),
  responseErrors: {},
  setResponseErrors: (value) => set({ responseErrors: value }),
  merchants: {},
  setMerchants: (value) => set({ merchants: value }),
}));
