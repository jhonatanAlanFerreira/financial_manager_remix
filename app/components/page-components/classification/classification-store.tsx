import { create } from "zustand";
import { ClassificationStoreInterface } from "~/components/page-components/classification/classification-finterfaces";
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
