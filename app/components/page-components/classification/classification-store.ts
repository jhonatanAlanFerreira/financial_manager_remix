import { create } from "zustand";
import { ClassificationStoreInterface } from "~/components/page-components/classification/classification-finterfaces";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import { createBasePageStore } from "~/utils/utilities";

export const classificationStore = create<ClassificationStoreInterface>(
  (set, get) => ({
    ...createBasePageStore(set, get),
    companies: {},
    setCompanies: (value) => set({ companies: value }),
    classifications: {},
    setClassifications: (value) => set({ classifications: value }),
  })
);

export const CLASSIFICATION_MAIN_FORM_DEFAULTS_VALUES = {
  id: "",
  name: "",
  companies: [],
  is_personal: false,
  is_income: false,
};

export const CLASSIFICATION_FILTER_FORM_DEFAULTS_VALUES = {
  name: "",
  has_company: null,
  is_personal_or_company: "all" as IsPersonalOrCompanyType,
  is_income_or_expense: "all" as IsIncomeOrExpenseType,
};
