import { create } from "zustand";
import { DashboardStoreInterface } from "~/components/page-components/dashboard/dashboard-zustand-interface";

export const dashboardStore = create<DashboardStoreInterface>((set, get) => ({
  loading: true,
  setLoading: (value) => set({ loading: value }),
  companies: {},
  setCompanies: (value) => set({ companies: value }),
  selectedCompany: "personal",
  setSelectedCompany: (value) => set({ selectedCompany: value }),
}));
