import { create } from "zustand";
import { DashboardStoreInterface } from "~/components/page-components/dashboard/dashboard-zustand-interface";

export const dashboardStore = create<DashboardStoreInterface>((set, get) => ({
  loading: true,
  setLoading: (value) => set({ loading: value }),
  companies: {},
  setCompanies: (value) => set({ companies: value }),
  selectedCompany: "personal",
  setSelectedCompany: (value) => set({ selectedCompany: value }),
  chartTransactionDataResponse: null,
  setChartTransactionDataResponse: (value) =>
    set({ chartTransactionDataResponse: value }),
  getChartTransactionDataResponse: () => get().chartTransactionDataResponse,
  chartTransactionSeriesData: [],
  setChartTransactionSeriesData: (value) =>
    set({ chartTransactionSeriesData: value }),
  getChartTransactionSeriesData: () => get().chartTransactionSeriesData,
  year: null,
  setYear: (value) => set({ year: value }),
  getYear: () => get().year,
}));
