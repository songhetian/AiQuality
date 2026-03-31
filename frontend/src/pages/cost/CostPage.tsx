import { useState } from "react";
import {
  Grid,
  Card,
  Text,
  Group,
  Select,
  Divider,
  Box,
  Button,
  LoadingOverlay,
  SimpleGrid,
  Badge,
} from "@mantine/core";
import {
  IconDownload,
  IconCoinYuan,
  IconTrendingUp,
  IconChartBar,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import { PageHeader } from "../../components/ui/PageHeader";
import { LineChart } from "../../components/ui/LineChart";
import { PieChart } from "../../components/ui/PieChart";
import { BarChart } from "../../components/ui/BarChart";
import { StatsCard } from "../../components/ui/StatsCard";
import api from "../../lib/axios";
import { PageAnimate } from "../../components/ui/PageAnimate";

type CostSummary = {
  totalCost?: number | null;
  avgUnitPrice?: number | string | null;
  callCount?: number | null;
  highestDept?: string | null;
};

type CostTrendItem = {
  statDate?: string | null;
  _sum: {
    totalCost?: number | null;
    callCount?: number | null;
  };
};

type DistributionItem = {
  name?: string | null;
  totalCost?: number | null;
  callCount?: number | null;
};

export default function CostPage() {
  const [days, setDays] = useState('7');

  const { data: summary, isLoading: summaryLoading } = useQuery<CostSummary>({
    queryKey: ['cost-summary'],
    queryFn: async () => (await api.get('/cost/stats/summary')).data
  });

  const { data: trend, isLoading: trendLoading } = useQuery<CostTrendItem[]>({
    queryKey: ['cost-trend', days],
    queryFn: async () => (await api.get('/cost/stats/trend', { params: { days } })).data
  });

  const { data: deptDistribution = [], isLoading: deptLoading } = useQuery<DistributionItem[]>({
    queryKey: ['cost-dept-distribution', days],
    queryFn: async () => (await api.get('/cost/stats/dept-distribution', { params: { days } })).data
  });

  const { data: platformDistribution = [], isLoading: platformLoading } = useQuery<DistributionItem[]>({
    queryKey: ['cost-platform-distribution', days],
    queryFn: async () => (await api.get('/cost/stats/platform-distribution', { params: { days } })).data
  });

  const chartOption: EChartsOption = {
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trend?.map((item) => item.statDate ? new Date(item.statDate).toLocaleDateString() : "") || [],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "AI 消耗成本",
        type: "line",
        smooth: true,
        data: trend?.map((item) => item._sum.totalCost || 0) || [],
        areaStyle: { opacity: 0.1 },
      },
      {
        name: "质检会话数",
        type: "line",
        smooth: true,
        data: trend?.map((item) => item._sum.callCount || 0) || [],
      },
    ],
  };

  const deptPieOption: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        name: "部门成本占比",
        type: "pie",
        radius: ["42%", "72%"],
        data: deptDistribution.map((item) => ({
          name: item.name || "未命名部门",
          value: item.totalCost || 0,
        })),
      },
    ],
  };

  const platformBarOption: EChartsOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 24, right: 16, top: 24, bottom: 40, containLabel: true },
    xAxis: {
      type: "category",
      data: platformDistribution.map((item) => item.name || "未命名平台"),
      axisLabel: { interval: 0, rotate: 20 },
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "平台成本",
        type: "bar",
        data: platformDistribution.map((item) => item.totalCost || 0),
        itemStyle: { color: "#40c057", borderRadius: [8, 8, 0, 0] },
      },
    ],
  };

  return (
    <PageAnimate>
      <Box pos="relative">
        <LoadingOverlay visible={summaryLoading || trendLoading} />
        <PageHeader
          title="成本统计与均摊"
          description="精细化 AI 计费与组织成本管理"
          rightSection={
            <Button leftSection={<IconDownload size={18} />}>导出财务报表</Button>
          }
        />

        <Grid mb="md">
          <Grid.Col span={4}>
            <StatsCard
              title="本月总成本 (预计)"
              value={summary?.totalCost || 0}
              diff="+12.5%" // 这里的环比可以后续根据上月数据计算
              icon={IconCoinYuan}
              color="green"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <StatsCard
              title="AI 平均单价"
              value={`¥ ${summary?.avgUnitPrice || '0.045'}`}
              description="按次计费模式"
              icon={IconTrendingUp}
              color="blue"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <StatsCard
              title="会话总量"
              value={summary?.callCount || 0}
              description={`最高消耗: ${summary?.highestDept || '无'}`}
              icon={IconChartBar}
              color="orange"
            />
          </Grid.Col>
        </Grid>

        <Card withBorder radius="md" shadow="sm" mb="md">
          <Group justify="space-between" mb="md">
            <Text fw={700} c="green.9">
              AI 成本消耗趋势
            </Text>
            <Select
              size="xs"
              data={[
                { label: "最近 7 天", value: "7" },
                { label: "最近 30 天", value: "30" }
              ]}
              value={days}
              onChange={(val) => setDays(val || '7')}
            />
          </Group>
          <Divider mb="xl" />
          <LineChart option={chartOption} />
        </Card>

        <SimpleGrid cols={{ base: 1, xl: 2 }}>
          <Card withBorder radius="md" shadow="sm">
            <Group justify="space-between" mb="md">
              <Box>
                <Text fw={700} c="green.9">部门成本分布</Text>
                <Text size="sm" c="dimmed">查看各部门在当前时间范围内的成本占比</Text>
              </Box>
              <Badge variant="light" color="green">{deptDistribution.length} 个部门</Badge>
            </Group>
            <PieChart option={deptPieOption} height={320} loading={deptLoading} />
          </Card>

          <Card withBorder radius="md" shadow="sm">
            <Group justify="space-between" mb="md">
              <Box>
                <Text fw={700} c="green.9">AI 平台成本排行</Text>
                <Text size="sm" c="dimmed">对比不同外部 AI 平台的成本消耗</Text>
              </Box>
              <Badge variant="light" color="blue">{platformDistribution.length} 个平台</Badge>
            </Group>
            <BarChart option={platformBarOption} height={320} loading={platformLoading} />
          </Card>
        </SimpleGrid>
      </Box>
    </PageAnimate>
  );
}
