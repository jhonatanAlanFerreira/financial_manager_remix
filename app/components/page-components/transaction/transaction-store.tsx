import { useForm } from "react-hook-form";
import { create } from "zustand";
import {
  TransactionFiltersFormInterface,
  TransactionFormInterface,
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

export const {
  register: registerMain,
  reset: resetMain,
  setValue: setMainValue,
  watch: watchMain,
  getValues: getMainValues,
  control: mainControl,
} = useForm<TransactionFormInterface>({
  defaultValues: TRANSACTION_MAIN_FORM_DEFAULTS_VALUES,
});

export const {
  register: registerFilter,
  reset: resetFilter,
  setValue: setFilterValue,
  getValues: getFilterValues,
  watch: watchFilter,
  control: filterControl,
} = useForm<TransactionFiltersFormInterface>({
  defaultValues: TRANSACTION_FILTER_FORM_DEFAULTS_VALUES,
});
