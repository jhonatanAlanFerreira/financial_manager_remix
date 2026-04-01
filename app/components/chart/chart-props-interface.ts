import { HTMLAttributes } from "react";

export interface ChartSerieInterface {
  name: string;
  type: string;
  data: number[];
}

export interface ChartPropsInterface extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  xAxisData: string[];
  seriesData: ChartSerieInterface[];
}
