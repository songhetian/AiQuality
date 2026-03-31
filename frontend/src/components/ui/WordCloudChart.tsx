import { TreemapChart } from './TreemapChart';

interface WordCloudProps {
  data: { name: string; value: number }[];
  height?: number;
}

export function WordCloudChart({ data, height = 300 }: WordCloudProps) {
  return (
    <TreemapChart
      height={height}
      option={{
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'treemap',
            roam: false,
            breadcrumb: { show: false },
            label: { show: true, formatter: '{b}' },
            upperLabel: { show: false },
            data: data.map((item) => ({
              name: item.name,
              value: item.value,
            })),
          },
        ],
      }}
    />
  );
}
