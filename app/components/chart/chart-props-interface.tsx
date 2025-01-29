export interface ChartSerieInterface {
  name: string;
  type: string;
  data: number[];
}

export interface ChartPropsInterface {
  title: string;
  xAxisData: string[];
  seriesData: ChartSerieInterface[];
}
