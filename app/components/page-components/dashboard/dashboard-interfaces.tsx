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
