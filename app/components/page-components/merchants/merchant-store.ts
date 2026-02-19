import { create } from "zustand";
import { MerchantStoreInterface } from "~/components/page-components/merchants/merchant-interfaces";
import { createBasePageStore } from "~/utils/utilities";

export const merchantStore = create<MerchantStoreInterface>((set, get) => ({
  ...createBasePageStore(set, get),
  merchants: {},
  setMerchants: (value) => set({ merchants: value }),
}));

export const MERCHANT_MAIN_FORM_DEFAULTS_VALUES = {
  id: "",
  name: "",
};

export const MERCHANT_FILTER_FORM_DEFAULTS_VALUES = {
  name: "",
};
