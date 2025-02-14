import { ExpenseStoreInterface } from "~/components/page-components/expense/expense-interfaces";
import { create } from "zustand";
import { createBasePageStore } from "~/utils/utilities";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";

export const expenseStore = create<ExpenseStoreInterface>((set, get) => ({
  ...createBasePageStore(set, get),
  companies: {},
  setCompanies: (value) => set({ companies: value }),
  expenses: {},
  setExpenses: (value) => set({ expenses: value }),
}));

export const MAIN_FORM_DEFAULTS_VALUES = {
  id: "",
  name: "",
  amount: 0,
  companies: [],
  is_personal: false,
};

export const FILTER_FORM_DEFAULTS_VALUES = {
  name: "",
  amount_greater: 0,
  amount_less: 0,
  has_company: null,
  is_personal_or_company: "all" as IsPersonalOrCompanyType,
};
