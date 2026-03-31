import type { EChartsCoreOption } from "echarts/core";
import { ChartFrame } from "./chartFrame";

interface PieChartProps {
  option: EChartsCoreOption;
  height?: string | number;
  loading?: boolean;
}

let pieChartLoader: Promise<(element: HTMLDivElement) => import("echarts/core").ECharts> | null =
  null;

async function loadPieChart() {
  if (!pieChartLoader) {
    pieChartLoader = Promise.all([
      import("echarts/core"),
      import("echarts/charts"),
      import("echarts/components"),
      import("echarts/renderers"),
    ]).then(([core, charts, components, renderers]) => {
      core.use([
        charts.PieChart,
        components.LegendComponent,
        components.TooltipComponent,
        renderers.CanvasRenderer,
      ]);

      return (element: HTMLDivElement) => core.init(element);
    });
  }

  return pieChartLoader;
}

export function PieChart({ option, height, loading }: PieChartProps) {
  return (
    <ChartFrame
      option={option}
      height={height}
      loading={loading}
      initChart={async (element) => {
        const initChart = await loadPieChart();
        return initChart(element);
      }}
    />
  );
}
