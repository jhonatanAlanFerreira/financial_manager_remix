import { Company } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { ChartTransactionDataResponse } from "~/components/page-components/dashboard/dashboard-interfaces";
import { ChartSerieInterface } from "~/components/chart/chart-props-interface";

export interface DashboardStoreInterface {
  loading: boolean;
  setLoading: (value: boolean) => void;
  companies: ServerResponseInterface<Company[]>;
  setCompanies: (value: ServerResponseInterface<Company[]>) => void;
  selectedCompany: Company | "personal";
  setSelectedCompany: (value: Company | "personal") => void;
  chartTransactionDataResponse: ChartTransactionDataResponse | null;
  setChartTransactionDataResponse: (
    value: ChartTransactionDataResponse
  ) => void;
  getChartTransactionDataResponse: () => ChartTransactionDataResponse | null;
  chartTransactionSeriesData: ChartSerieInterface[];
  setChartTransactionSeriesData: (value: ChartSerieInterface[]) => void;
  getChartTransactionSeriesData: () => ChartSerieInterface[];
  year: number | null;
  setYear: (value: number) => void;
  getYear: () => number | null;
}
