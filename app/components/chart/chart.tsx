import { useEffect, useRef } from "react";
import { ChartPropsInterface } from "~/components/chart/chart-props-interface";
import * as echarts from "echarts";

export function Chart({ title, xAxisData, seriesData }: ChartPropsInterface) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    chartInstanceRef.current.setOption({
      title: { text: title },
      tooltip: { trigger: "axis" },
      legend: { data: seriesData.map((s) => s.name) },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      toolbox: { feature: { saveAsImage: {} } },
      xAxis: { type: "category", boundaryGap: false, data: xAxisData },
      yAxis: { type: "value" },
      series: seriesData,
    });
  }, [xAxisData, seriesData, title]);

  return <div className="h-64" ref={chartRef}></div>;
}
