import { Company } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export interface DashboardStoreInterface {
  loading: boolean;
  setLoading: (value: boolean) => void;
  companies: ServerResponseInterface<Company[]>;
  setCompanies: (value: ServerResponseInterface<Company[]>) => void;
  selectedCompany: Company | "personal";
  setSelectedCompany: (value: Company | "personal") => void;
}
