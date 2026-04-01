import { create } from "zustand";
import {
  LoadingStatesInterface,
  TransactionFilterFormStoreInterface,
  TransactionMainFormStore,
  TransactionStoreInterface,
} from "~/components/page-components/transaction/transaction-interfaces";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import {
  createBasePageStore,
  firstDayOfCurrentMonth,
  todayFormatedDate,
} from "~/utils/utilities";

export const transactionStore = create<TransactionStoreInterface>(
  (set, get) => ({
    ...createBasePageStore(set, get),
    totalExpenseValue: 0,
    setTotalExpenseValue: (value) => set({ totalExpenseValue: value }),
    totalIncomeValue: 0,
    setTotalIncomeValue: (value) => set({ totalIncomeValue: value }),
    transactions: {},
    setTransactions: (value) => set({ transactions: value }),
  })
);

const createLoadingState = (get: any, set: any) => {
  return {
    loadingStates: {
      isAccountLoading: false,
      isClassificationLoading: false,
      isCompanyLoading: false,
      isExpenseLoading: false,
      isIncomeLoading: false,
      isMerchantLoading: false,
    },
    setAllLoadingState: (value: boolean) =>
      set({
        loadingStates: {
          isAccountLoading: value,
          isClassificationLoading: value,
          isCompanyLoading: value,
          isExpenseLoading: value,
          isIncomeLoading: value,
          isMerchantLoading: value,
        },
      }),
    setLoading: (key: keyof LoadingStatesInterface, value: boolean) =>
      set((prev: TransactionFilterFormStoreInterface) => ({
        loadingStates: {
          ...prev.loadingStates,
          [key]: value,
        },
      })),
    isLoading: () =>
      Object.values(get().loadingStates || {}).some((state) => state),
  };
};

export const transactionFilterStore =
  create<TransactionFilterFormStoreInterface>((set, get) => ({
    ...createLoadingState(get, set),
    accounts: {},
    setAccounts: (value) => set({ accounts: value }),
    classifications: {},
    setClassifications: (value) => set({ classifications: value }),
    companies: {},
    setCompanies: (value) => set({ companies: value }),
    expenses: {},
    setExpenses: (value) => set({ expenses: value }),
    incomes: {},
    setIncomes: (value) => set({ incomes: value }),
    merchants: {},
    setMerchants: (value) => set({ merchants: value }),
  }));

export const transactionMainStore = create<TransactionMainFormStore>(
  (set, get) => ({
    ...createLoadingState(get, set),
    accounts: {},
    setAccounts: (value) => set({ accounts: value }),
    classifications: {},
    setClassifications: (value) => set({ classifications: value }),
    companies: {},
    setCompanies: (value) => set({ companies: value }),
    expenses: {},
    setExpenses: (value) => set({ expenses: value }),
    incomes: {},
    setIncomes: (value) => set({ incomes: value }),
    merchants: {},
    setMerchants: (value) => set({ merchants: value }),
  })
);

export const TRANSACTION_MAIN_FORM_DEFAULTS_VALUES = {
  id: "",
  is_income: false,
  company: null,
  expense: null,
  account: null,
  merchant: null,
  date: todayFormatedDate(),
  amount: 0,
  transaction_classifications: [],
  is_personal: false,
  income: null,
  name: "",
  description: "",
};

export const TRANSACTION_FILTER_FORM_DEFAULTS_VALUES = {
  name: "",
  is_personal_or_company: "all" as IsPersonalOrCompanyType,
  is_income_or_expense: "all" as IsIncomeOrExpenseType,
  company: null,
  expense: null,
  income: null,
  merchant: null,
  has_classification: null,
  account: null,
  date_after: firstDayOfCurrentMonth(),
  date_before: "",
  amount_greater: 0,
  amount_less: 0,
};
