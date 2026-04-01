import { Company } from "@prisma/client";
import { create } from "zustand";
import { DashboardStoreInterface } from "~/components/page-components/dashboard/dashboard-interfaces";

export const dashboardStore = create<DashboardStoreInterface>((set, get) => ({
  loading: true,
  setLoading: (value) => set({ loading: value }),
  companies: {},
  setCompanies: (value) => set({ companies: value }),
  selectedCompany: "personal" as Company | "personal",
  setSelectedCompany: (value) => set({ selectedCompany: value }),
  getSelectedCompany: () => get().selectedCompany,
  chartTransactionDataResponse: null,
  setChartTransactionDataResponse: (value) =>
    set({ chartTransactionDataResponse: value }),
  getChartTransactionDataResponse: () => get().chartTransactionDataResponse,
  chartTransactionSeriesData: [],
  setChartTransactionSeriesData: (value) =>
    set({ chartTransactionSeriesData: value }),
  getChartTransactionSeriesData: () => get().chartTransactionSeriesData,
  chartTransactionBarSeriesData: [],
  setChartTransactionBarSeriesData: (value) =>
    set({ chartTransactionBarSeriesData: value }),
  getChartTransactionBarSeriesData: () => get().chartTransactionBarSeriesData,
  year: null,
  setYear: (value) => set({ year: value }),
  getYear: () => get().year,
  classifications: [],
  getClassifications: () => get().classifications,
  setClassifications: (value) => set({ classifications: value }),
  openGuideModal: false,
  setOpenGuideModal: (value) => set({ openGuideModal: value }),
}));
