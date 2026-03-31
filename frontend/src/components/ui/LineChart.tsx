import type { EChartsCoreOption } from "echarts/core";
import { ChartFrame } from "./chartFrame";

interface LineChartProps {
  option: EChartsCoreOption;
  height?: string | number;
  loading?: boolean;
}

let lineChartLoader: Promise<(element: HTMLDivElement) => import("echarts/core").ECharts> | null =
  null;

async function loadLineChart() {
  if (!lineChartLoader) {
    lineChartLoader = Promise.all([
      import("echarts/core"),
      import("echarts/charts"),
      import("echarts/components"),
      import("echarts/renderers"),
    ]).then(([core, charts, components, renderers]) => {
      core.use([
        charts.LineChart,
        components.GridComponent,
        components.LegendComponent,
        components.TooltipComponent,
        renderers.CanvasRenderer,
      ]);

      return (element: HTMLDivElement) => core.init(element);
    });
  }

  return lineChartLoader;
}

export function LineChart({ option, height, loading }: LineChartProps) {
  return (
    <ChartFrame
      option={option}
      height={height}
      loading={loading}
      initChart={async (element) => {
        const initChart = await loadLineChart();
        return initChart(element);
      }}
    />
  );
}
