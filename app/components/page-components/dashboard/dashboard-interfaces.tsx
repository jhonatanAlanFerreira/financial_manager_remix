import { Company } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { ChartSerieInterface } from "~/components/chart/chart-props-interface";
import { IsPersonalOrCompanyGraphqlType } from "~/data/graphql/schema/graphql-globals";

export type TransactionsChartType = "PERSONAL_ONLY" | "COMPANY_ONLY" | "ALL";

export interface ChartTransactionMonth {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface ChartTransactionYearData {
  year: number;
  income: number;
  expense: number;
  net: number;
  months: ChartTransactionMonth[];
}

export interface ChartTransactionData {
  availableYears: number[];
  data: ChartTransactionYearData[];
}

export interface ChartTransactionDataResponse {
  chartTransactionData: ChartTransactionData;
}

export interface DashboardFormInterface {
  yearIndex: YearIndexOptionInterface | null;
  classification: StoreClassificationInterface | undefined;
}

export interface YearIndexOptionInterface {
  value: number;
  label: string;
}

export interface LoadTransactionsChartDataVariablesInterface {
  type: TransactionsChartType;
  companyId?: string;
  classificationId?: string;
  classificationType?: IsPersonalOrCompanyGraphqlType;
}

export interface DashboardStoreInterface {
  loading: boolean;
  setLoading: (value: boolean) => void;
  companies: ServerResponseInterface<Company[]>;
  setCompanies: (value: ServerResponseInterface<Company[]>) => void;
  selectedCompany: Company | "personal";
  setSelectedCompany: (value: Company | "personal") => void;
  getSelectedCompany: () => Company | "personal";
  chartTransactionDataResponse: ChartTransactionDataResponse | null;
  setChartTransactionDataResponse: (
    value: ChartTransactionDataResponse
  ) => void;
  getChartTransactionDataResponse: () => ChartTransactionDataResponse | null;
  chartTransactionSeriesData: ChartSerieInterface[];
  setChartTransactionSeriesData: (value: ChartSerieInterface[]) => void;
  getChartTransactionSeriesData: () => ChartSerieInterface[];
  chartTransactionBarSeriesData: ChartSerieInterface[];
  setChartTransactionBarSeriesData: (value: ChartSerieInterface[]) => void;
  getChartTransactionBarSeriesData: () => ChartSerieInterface[];
  year: number | null;
  setYear: (value: number) => void;
  getYear: () => number | null;
  classifications: StoreClassificationInterface[];
  getClassifications: () => StoreClassificationInterface[];
  setClassifications: (value: StoreClassificationInterface[]) => void;
}

export interface StoreClassificationInterface {
  id: string;
  name: string;
  is_income: boolean;
}
