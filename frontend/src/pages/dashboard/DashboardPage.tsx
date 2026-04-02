import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import type { EChartsOption } from "echarts";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowUpRight,
  IconBolt,
  IconChecklist,
  IconClockHour4,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { PageHeader } from "../../components/ui/PageHeader";
import { LineChart } from "../../components/ui/LineChart";
import { uiTokens } from "../../components/ui/uiTokens";
import api from "../../lib/axios";
import { useSocket } from "../../hooks/useSocket";

type SettingsOverview = {
  app?: {
    env?: string;
  };
  overview?: {
    knowledgeCount?: number;
    activeRuleCount?: number;
    chatSessionCount?: number;
    userCount?: number;
  };
};

type ChartPoint = {
  date?: string;
  value?: number;
};

type ChartSlice = {
  name: string;
  value: number;
};

type ViolationStats = {
  trend?: ChartPoint[];
  topKeywords?: ChartSlice[];
  statusDistribution?: ChartSlice[];
};

type QualityInspectionItem = {
  id: string;
  sessionId: string;
  status?: number;
  aiScore?: number | null;
  qualitySummary?: string | null;
  updateTime?: string | null;
};

type PagedResult<T> = {
  list: T[];
  total: number;
};

type RealtimeAlertEvent = {
  keyword?: string;
  username?: string;
  createTime?: string;
};

type QualityStatusChangedEvent = {
  status?: number;
  updatedAt?: string;
};

const statusLabelMap: Record<number, string> = {
  0: "质检中",
  1: "待复核",
  2: "已复核",
  3: "需整改",
  4: "AI失败",
};

const boardPaperStyle = {
  border: `1px solid ${uiTokens.colors.border}`,
  boxShadow: uiTokens.shadow.panel,
  background: uiTokens.background.surfaceHighlight,
} as const;

const statCardStyle = {
  border: `1px solid ${uiTokens.colors.border}`,
  boxShadow: uiTokens.shadow.soft,
  background: uiTokens.background.surfaceHighlight,
} as const;

const sectionCardStyle = {
  ...statCardStyle,
  position: "relative" as const,
  overflow: "hidden",
} as const;

const panelTitleStyle = {
  fontSize: "15px",
  fontWeight: 700,
  color: uiTokens.colors.heading,
} as const;

function MetricCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string | number;
  helper: string;
  accent: string;
}) {
  return (
    <Paper radius="xl" p="md" style={{ ...sectionCardStyle }}>
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 88,
          height: 4,
          borderRadius: 999,
          background: accent,
        }}
      />
      <Box
        style={{
          position: "absolute",
          right: -24,
          top: -24,
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: uiTokens.background.navOrb,
        }}
      />
      <Group justify="space-between" align="flex-start" mb={18}>
        <Box>
          <Text size="xs" fw={700} c={uiTokens.colors.textMuted} mb={6}>
            {label}
          </Text>
          <Text fw={800} size="1.55rem" c={uiTokens.colors.heading} lh={1.1}>
            {value}
          </Text>
        </Box>
        <Badge
          radius="xl"
          variant="filled"
          style={{
            background: uiTokens.colors.panel,
            color: uiTokens.colors.primaryDeep,
            border: `1px solid ${uiTokens.colors.border}`,
          }}
        >
          今日
        </Badge>
      </Group>
      <Text size="xs" c={uiTokens.colors.textMuted}>
        {helper}
      </Text>
    </Paper>
  );
}

export default function DashboardPage() {
  const { on } = useSocket();
  const [latestSignal, setLatestSignal] = useState("实时通道已连接，等待新告警");
  const [latestQualityTick, setLatestQualityTick] = useState("最近 5 分钟暂无质检状态变化");

  const { data: overview } = useQuery<SettingsOverview>({
    queryKey: ["dashboard-settings-overview"],
    queryFn: async () => (await api.get("/settings/overview")).data,
    retry: false,
  });

  const { data: violationStats } = useQuery<ViolationStats>({
    queryKey: ["dashboard-violation-stats"],
    queryFn: async () => (await api.get("/log/violation/stats", { params: { dateRange: "today" } })).data,
    retry: false,
  });

  const { data: inspectionData } = useQuery<PagedResult<QualityInspectionItem>>({
    queryKey: ["dashboard-quality-list"],
    queryFn: async () =>
      (
        await api.get("/quality/list", {
          params: { page: 1, pageSize: 6, dateRange: "today" },
        })
      ).data,
    retry: false,
  });

  useEffect(() => {
    const offAlert = on("violation_alert", (event) => {
      const payload = event as RealtimeAlertEvent;
      const actor = payload.username || "未知坐席";
      const keyword = payload.keyword || "敏感词";
      setLatestSignal(`${actor} 触发 ${keyword} 告警`);
    });

    const offQuality = on("quality_status_changed", (event) => {
      const payload = event as QualityStatusChangedEvent;
      const label = statusLabelMap[payload.status ?? -1] || "状态更新";
      setLatestQualityTick(`${label} 已同步${payload.updatedAt ? ` · ${new Date(payload.updatedAt).toLocaleTimeString()}` : ""}`);
    });

    return () => {
      offAlert();
      offQuality();
    };
  }, [on]);

  const trendSource = violationStats?.trend || [];
  const trendOption: EChartsOption = {
    grid: { left: 24, right: 16, top: 28, bottom: 24, containLabel: true },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trendSource.map((item) => item.date || ""),
      axisLine: { lineStyle: { color: uiTokens.colors.borderStrong } },
      axisLabel: { color: uiTokens.colors.textMuted },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: uiTokens.colors.border } },
      axisLabel: { color: uiTokens.colors.textMuted },
    },
    series: [
      {
        name: "告警数量",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { color: uiTokens.colors.primaryDeep, width: 3 },
        itemStyle: { color: uiTokens.colors.primaryDeep },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(45, 223, 116, 0.22)" },
              { offset: 1, color: "rgba(45, 223, 116, 0.03)" },
            ],
          },
        },
        data: trendSource.map((item) => item.value || 0),
      },
    ],
  };

  const statusDistribution = violationStats?.statusDistribution || [];
  const pendingCount = statusDistribution.find((item) => item.name.includes("待"))?.value || 0;
  const handledCount = statusDistribution.find((item) => item.name.includes("已"))?.value || 0;
  const riskKeywordList = (violationStats?.topKeywords || []).slice(0, 5);
  const inspectionList = inspectionData?.list || [];
  const reviewQueue = inspectionList.filter((item) => item.status === 1 || item.status === 3);
  const runningQueue = inspectionList.filter((item) => item.status === 0);
  const latestInspections = inspectionList.slice(0, 5);

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="雷犀质检控制台"
          description="面向运营与质检协同的实时概览，优先展示今日风险、处理队列和执行状态"
          rightSection={
            <Group gap="xs">
              <Badge variant="light" color="green">
                {overview?.app?.env || "development"}
              </Badge>
              <Button size="xs" variant="light" leftSection={<IconRefresh size={16} />}>
                刷新数据
              </Button>
            </Group>
          }
        />

        <Paper radius="lg" p="lg" mb="md" style={boardPaperStyle}>
          <Box
            style={{
              position: "absolute",
              top: rem(-32),
              right: rem(-12),
              width: rem(168),
              height: rem(168),
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(199,240,65,0.18) 0%, rgba(199,240,65,0) 72%)",
              pointerEvents: "none",
            }}
          />
          <Grid align="center">
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <Stack gap={10}>
                <Group gap="xs">
                  <Badge color="green" variant="filled">
                    今日概览
                  </Badge>
                  <Badge color="gray" variant="light">
                    实时更新
                  </Badge>
                </Group>
                <Text fw={800} size="1.55rem" c={uiTokens.colors.heading} lh={1.25}>
                  优先看风险抬头、待处理队列和质检执行状态，把首页变成真正能指导动作的运营主屏。
                </Text>
                <Text size="sm" c={uiTokens.colors.text} maw={760}>
                  这不是展示型总览，而是面向日常值守和复盘的工作台。你能先看到今日风险趋势、处理积压和最新质检动态，再决定接下来优先处理什么。
                </Text>
                <Group gap="sm" mt="xs">
                  <Badge
                    radius="xl"
                    variant="filled"
                    style={{
                      background: uiTokens.colors.panel,
                      color: uiTokens.colors.primaryDeep,
                      border: `1px solid ${uiTokens.colors.border}`,
                    }}
                  >
                    待处理 {pendingCount}
                  </Badge>
                  <Badge
                    radius="xl"
                    variant="filled"
                    style={{
                      background: uiTokens.colors.panel,
                      color: uiTokens.colors.heading,
                      border: `1px solid ${uiTokens.colors.border}`,
                    }}
                  >
                    运行中 {runningQueue.length}
                  </Badge>
                  <Badge
                    radius="xl"
                    variant="filled"
                    style={{
                      background: uiTokens.colors.panel,
                      color: uiTokens.colors.successText,
                      border: `1px solid ${uiTokens.colors.successBorder}`,
                    }}
                  >
                    已处理 {handledCount}
                  </Badge>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <SimpleGrid cols={1} spacing="sm">
                <Paper radius="md" p="sm" style={sectionCardStyle}>
                  <Group wrap="nowrap" align="flex-start">
                    <ThemeIcon size={34} radius="md" color="green" variant="light">
                      <IconBolt size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" fw={700} c={uiTokens.colors.textMuted} mb={2}>
                        实时告警
                      </Text>
                      <Text size="sm" fw={600} c={uiTokens.colors.heading}>
                        {latestSignal}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
                <Paper radius="md" p="sm" style={sectionCardStyle}>
                  <Group wrap="nowrap" align="flex-start">
                    <ThemeIcon size={34} radius="md" color="green" variant="light">
                      <IconActivity size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" fw={700} c={uiTokens.colors.textMuted} mb={2}>
                        执行状态
                      </Text>
                      <Text size="sm" fw={600} c={uiTokens.colors.heading}>
                        {latestQualityTick}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              </SimpleGrid>
            </Grid.Col>
          </Grid>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md" mb="md">
          <MetricCard
            label="会话总量"
            value={overview?.overview?.chatSessionCount || 0}
            helper="当前可参与质检分析的会话规模"
            accent={uiTokens.colors.primaryDeep}
          />
          <MetricCard
            label="活跃规则"
            value={overview?.overview?.activeRuleCount || 0}
            helper="今日可用的自动质检与判责规则"
            accent={uiTokens.colors.primary}
          />
          <MetricCard
            label="待处理告警"
            value={pendingCount}
            helper="优先关注未闭环的风险记录"
            accent={uiTokens.colors.accent}
          />
          <MetricCard
            label="知识资产"
            value={overview?.overview?.knowledgeCount || 0}
            helper="支撑坐席应答和质检判断的知识数"
            accent={uiTokens.colors.primaryTintStrong}
          />
        </SimpleGrid>

        <Grid gutter="md" mb="md">
          <Grid.Col span={{ base: 12, xl: 8 }}>
            <Card radius="xl" p="lg" style={sectionCardStyle}>
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: rem(120),
                  height: rem(4),
                  borderRadius: rem(uiTokens.radius.pill),
                  background: uiTokens.background.navLine,
                }}
              />
              <Group justify="space-between" mb="md">
                <Box>
                  <Text style={panelTitleStyle}>今日风险趋势</Text>
                  <Text size="xs" c={uiTokens.colors.textMuted} mt={4}>
                    以告警触发量观察全天波动，方便判断高峰时段和风险集中区间
                  </Text>
                </Box>
                <Group gap={8}>
                  <Badge variant="light" color="green">
                    已处理 {handledCount}
                  </Badge>
                  <Badge variant="light" color="orange">
                    待处理 {pendingCount}
                  </Badge>
                </Group>
              </Group>
              <Divider color={uiTokens.colors.border} mb="md" />
              <LineChart option={trendOption} height={300} />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xl: 4 }}>
            <Card radius="xl" p="lg" style={sectionCardStyle}>
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: rem(96),
                  height: rem(4),
                  borderRadius: rem(uiTokens.radius.pill),
                  background: `linear-gradient(90deg, ${uiTokens.colors.accent} 0%, ${uiTokens.colors.primary} 100%)`,
                }}
              />
              <Group justify="space-between" mb="md">
                <Box>
                  <Text style={panelTitleStyle}>高频风险词</Text>
                  <Text size="xs" c={uiTokens.colors.textMuted} mt={4}>
                    优先关注重复出现的触发项
                  </Text>
                </Box>
                <ThemeIcon size={30} radius="md" color="green" variant="light">
                  <IconAlertTriangle size={16} />
                </ThemeIcon>
              </Group>
              <Stack gap="sm">
                {riskKeywordList.length > 0 ? (
                  riskKeywordList.map((item, index) => {
                    const maxValue = riskKeywordList[0]?.value || 1;
                    const progress = Math.max(8, Math.round(((item.value || 0) / maxValue) * 100));
                    return (
                      <Paper
                        key={`${item.name}-${index}`}
                        radius="md"
                        p="sm"
                        style={{
                          background: index === 0 ? uiTokens.background.surfaceGlow : uiTokens.colors.panelSubtle,
                          border: `1px solid ${uiTokens.colors.border}`,
                        }}
                      >
                        <Group justify="space-between" mb={8}>
                          <Group gap="xs">
                            <Badge
                              radius="xl"
                              variant="filled"
                              style={{
                                background: index === 0 ? uiTokens.colors.primaryTintStrong : uiTokens.colors.panel,
                                color: uiTokens.colors.primaryDeep,
                                border: `1px solid ${uiTokens.colors.border}`,
                              }}
                            >
                              TOP {index + 1}
                            </Badge>
                            <Text size="sm" fw={700} c={uiTokens.colors.heading}>
                              {item.name}
                            </Text>
                          </Group>
                          <Text size="xs" fw={800} c={uiTokens.colors.primaryDeep}>
                            {item.value}
                          </Text>
                        </Group>
                        <Progress value={progress} color="green" radius="xl" size="sm" />
                      </Paper>
                    );
                  })
                ) : (
                  <Paper radius="md" p="md" bg={uiTokens.colors.panelSubtle} withBorder>
                    <Text size="sm" c={uiTokens.colors.text}>
                      当前暂无高频风险词数据
                    </Text>
                  </Paper>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, xl: 7 }}>
            <Card radius="xl" p="lg" style={sectionCardStyle}>
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: rem(96),
                  height: rem(4),
                  borderRadius: rem(uiTokens.radius.pill),
                  background: uiTokens.background.navLine,
                }}
              />
              <Group justify="space-between" mb="md">
                <Box>
                  <Text style={panelTitleStyle}>待处理事项</Text>
                  <Text size="xs" c={uiTokens.colors.textMuted} mt={4}>
                    更像清单而不是装饰卡片，直接告诉你现在哪些事项最值得先处理
                  </Text>
                </Box>
                <Badge color="red" variant="light">
                  {reviewQueue.length + runningQueue.length} 项
                </Badge>
              </Group>
              <Stack gap="sm">
                <Paper radius="lg" p="sm" style={{ background: uiTokens.background.surfaceGlow, border: `1px solid ${uiTokens.colors.border}` }}>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon radius="md" color="green" variant="light">
                        <IconChecklist size={16} />
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={700} c={uiTokens.colors.heading}>
                          人工复核队列
                        </Text>
                        <Text size="xs" c={uiTokens.colors.textMuted}>
                          待复核与需整改项应优先闭环
                        </Text>
                      </Box>
                    </Group>
                    <Badge radius="xl" variant="filled" color="green">
                      {reviewQueue.length}
                    </Badge>
                  </Group>
                </Paper>
                <Paper radius="lg" p="sm" style={{ background: uiTokens.background.surfaceGlow, border: `1px solid ${uiTokens.colors.border}` }}>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon radius="md" color="green" variant="light">
                        <IconClockHour4 size={16} />
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={700} c={uiTokens.colors.heading}>
                          运行中任务
                        </Text>
                        <Text size="xs" c={uiTokens.colors.textMuted}>
                          仍在等待 AI 返回结果的质检任务
                        </Text>
                      </Box>
                    </Group>
                    <Badge radius="xl" variant="filled" style={{ background: uiTokens.colors.panel, color: uiTokens.colors.primaryDeep, border: `1px solid ${uiTokens.colors.border}` }}>
                      {runningQueue.length}
                    </Badge>
                  </Group>
                </Paper>
                <Paper radius="lg" p="sm" style={{ background: uiTokens.background.surfaceGlow, border: `1px solid ${uiTokens.colors.border}` }}>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon radius="md" color="green" variant="light">
                        <IconShieldCheck size={16} />
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={700} c={uiTokens.colors.heading}>
                          今日可用规则
                        </Text>
                        <Text size="xs" c={uiTokens.colors.textMuted}>
                          规则规模越稳定，质检覆盖越完整
                        </Text>
                      </Box>
                    </Group>
                    <Badge radius="xl" variant="filled" style={{ background: uiTokens.colors.panel, color: uiTokens.colors.primaryDeep, border: `1px solid ${uiTokens.colors.border}` }}>
                      {overview?.overview?.activeRuleCount || 0}
                    </Badge>
                  </Group>
                </Paper>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xl: 5 }}>
            <Card radius="xl" p="lg" style={sectionCardStyle}>
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: rem(110),
                  height: rem(4),
                  borderRadius: rem(uiTokens.radius.pill),
                  background: `linear-gradient(90deg, ${uiTokens.colors.primary} 0%, ${uiTokens.colors.accent} 100%)`,
                }}
              />
              <Group justify="space-between" mb="md">
                <Box>
                  <Text style={panelTitleStyle}>最新质检动态</Text>
                  <Text size="xs" c={uiTokens.colors.textMuted} mt={4}>
                    最近完成或更新的质检记录
                  </Text>
                </Box>
                <ThemeIcon size={30} radius="md" color="green" variant="light">
                  <IconArrowUpRight size={16} />
                </ThemeIcon>
              </Group>
              <Stack gap="xs">
                {latestInspections.length > 0 ? (
                  latestInspections.map((item) => (
                    <Paper
                      key={item.id}
                      radius="lg"
                      p="sm"
                      style={{ background: uiTokens.background.surfaceGlow, border: `1px solid ${uiTokens.colors.border}` }}
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Box>
                          <Text size="sm" fw={700} c={uiTokens.colors.heading}>
                            会话 {item.sessionId}
                          </Text>
                          <Text size="xs" c={uiTokens.colors.textMuted} mt={4}>
                            {item.qualitySummary || "质检结果待同步"}
                          </Text>
                        </Box>
                        <Stack gap={6} align="flex-end">
                          <Badge color={item.status === 3 ? "red" : "green"} variant="light">
                            {statusLabelMap[item.status ?? -1] || "未知状态"}
                          </Badge>
                          <Text size="11px" c={uiTokens.colors.textMuted}>
                            {item.updateTime ? new Date(item.updateTime).toLocaleString() : "--"}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Paper radius="md" p="md" bg={uiTokens.colors.panelSubtle} withBorder>
                    <Text size="sm" c={uiTokens.colors.text}>
                      暂无可展示的质检动态
                    </Text>
                  </Paper>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Box>
    </PageAnimate>
  );
}
