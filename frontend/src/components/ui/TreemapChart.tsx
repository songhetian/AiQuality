import type { EChartsCoreOption } from "echarts/core";
import { ChartFrame } from "./chartFrame";

interface TreemapChartProps {
  option: EChartsCoreOption;
  height?: string | number;
  loading?: boolean;
}

let treemapChartLoader: Promise<
  (element: HTMLDivElement) => import("echarts/core").ECharts
> | null = null;

async function loadTreemapChart() {
  if (!treemapChartLoader) {
    treemapChartLoader = Promise.all([
      import("echarts/core"),
      import("echarts/charts"),
      import("echarts/components"),
      import("echarts/renderers"),
    ]).then(([core, charts, components, renderers]) => {
      core.use([
        charts.TreemapChart,
        components.TooltipComponent,
        renderers.CanvasRenderer,
      ]);

      return (element: HTMLDivElement) => core.init(element);
    });
  }

  return treemapChartLoader;
}

export function TreemapChart({ option, height, loading }: TreemapChartProps) {
  return (
    <ChartFrame
      option={option}
      height={height}
      loading={loading}
      initChart={async (element) => {
        const initChart = await loadTreemapChart();
        return initChart(element);
      }}
    />
  );
}
