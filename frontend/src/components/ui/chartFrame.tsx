import { Box, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import type { ECharts, EChartsCoreOption } from "echarts/core";

export interface ChartFrameProps {
  option: EChartsCoreOption;
  height?: string | number;
  loading?: boolean;
  initChart: (element: HTMLDivElement) => Promise<ECharts>;
}

export function ChartFrame({
  option,
  height = 400,
  loading = false,
  initChart,
}: ChartFrameProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ECharts | null>(null);
  const theme = useMantineTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const getObject = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  };

  useEffect(() => {
    if (!chartRef.current || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "160px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  useEffect(() => {
    if (!chartRef.current || !isVisible) {
      return;
    }

    let isDisposed = false;

    const ensureChart = async () => {
      if (!chartRef.current || instanceRef.current) {
        return;
      }

      setIsBootstrapping(true);

      try {
        const instance = await initChart(chartRef.current);
        if (isDisposed) {
          instance.dispose();
          return;
        }

        instanceRef.current = instance;
      } finally {
        if (!isDisposed) {
          setIsBootstrapping(false);
        }
      }
    };

    ensureChart();

    return () => {
      isDisposed = true;
    };
  }, [initChart, isVisible]);

  useEffect(() => {
    if (!instanceRef.current) {
      return;
    }

    const base: EChartsCoreOption = {
      color: [
        theme.colors.green[6],
        theme.colors.blue[6],
        theme.colors.orange[6],
        theme.colors.red[6],
        theme.colors.violet[6],
      ],
      textStyle: {
        fontFamily: theme.fontFamily,
        color: theme.colors.gray[7],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: theme.colors.green[2],
        borderWidth: 1,
        textStyle: { color: theme.colors.gray[9] },
        axisPointer: {
          lineStyle: { color: theme.colors.green[2] },
        },
      },
      legend: {
        top: "top",
        icon: "circle",
        textStyle: { fontSize: 12, color: theme.colors.gray[6] },
      },
    };
    const baseTooltip = getObject(base.tooltip);
    const nextTooltip = getObject(option.tooltip);

    const mergedOption: EChartsCoreOption = {
      ...base,
      ...option,
      textStyle: {
        ...getObject(base.textStyle),
        ...getObject(option.textStyle),
      },
      grid: {
        ...getObject(base.grid),
        ...getObject(option.grid),
      },
      tooltip: {
        ...baseTooltip,
        ...nextTooltip,
        axisPointer: {
          ...getObject(baseTooltip.axisPointer),
          ...getObject(nextTooltip.axisPointer),
        },
      },
      legend: {
        ...getObject(base.legend),
        ...getObject(option.legend),
      },
    };

    instanceRef.current.setOption(mergedOption, true);
  }, [option, theme]);

  useEffect(() => {
    const handleResize = () => {
      instanceRef.current?.resize();
    };

    window.addEventListener("resize", handleResize);
    const observer = new ResizeObserver(handleResize);
    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, []);

  return (
    <Box pos="relative" style={{ width: "100%", height }}>
      <LoadingOverlay visible={loading || !isVisible || isBootstrapping} overlayProps={{ blur: 1 }} />
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
}
