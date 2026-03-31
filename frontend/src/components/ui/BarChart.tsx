import type { EChartsCoreOption } from "echarts/core";
import { ChartFrame } from "./chartFrame";

interface BarChartProps {
  option: EChartsCoreOption;
  height?: string | number;
  loading?: boolean;
}

let barChartLoader: Promise<(element: HTMLDivElement) => import("echarts/core").ECharts> | null =
  null;

async function loadBarChart() {
  if (!barChartLoader) {
    barChartLoader = Promise.all([
      import("echarts/core"),
      import("echarts/charts"),
      import("echarts/components"),
      import("echarts/renderers"),
    ]).then(([core, charts, components, renderers]) => {
      core.use([
        charts.BarChart,
        components.GridComponent,
        components.LegendComponent,
        components.TooltipComponent,
        renderers.CanvasRenderer,
      ]);

      return (element: HTMLDivElement) => core.init(element);
    });
  }

  return barChartLoader;
}

export function BarChart({ option, height, loading }: BarChartProps) {
  return (
    <ChartFrame
      option={option}
      height={height}
      loading={loading}
      initChart={async (element) => {
        const initChart = await loadBarChart();
        return initChart(element);
      }}
    />
  );
}
