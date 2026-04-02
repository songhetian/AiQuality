import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconActivityHeartbeat, IconAlertTriangle, IconDownload, IconFilter, IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import { LineChart } from "../../components/ui/LineChart";
import { PieChart } from "../../components/ui/PieChart";
import { uiTokens } from "../../components/ui/uiTokens";
import api from "../../lib/axios";
import type { EChartsOption } from "echarts";

type PagedResult<T> = {
  list: T[];
  total: number;
};

type ChartSlice = {
  name: string;
  value: number;
};

type TrendPoint = {
  date?: string;
  value?: number;
};

type SystemLogItem = {
  id: string;
  level?: string | null;
  module?: string | null;
  message?: string | null;
  stack?: string | null;
  createTime?: string | null;
};

type SystemLogStats = {
  levelDistribution?: ChartSlice[];
  trend?: TrendPoint[];
  moduleDistribution?: ChartSlice[];
  stackCount?: number;
};

export default function SystemLogPage() {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<string | null>(null);
  const [moduleName, setModuleName] = useState("");
  const [message, setMessage] = useState("");
  const [stackKeyword, setStackKeyword] = useState("");
  const [hasStack, setHasStack] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLogItem | null>(null);
  const [dateRange, setDateRange] = useState("7d");

  const { data, isLoading } = useQuery<PagedResult<SystemLogItem>>({
    queryKey: ["system-logs-page", page, level, moduleName, message, stackKeyword, hasStack],
    queryFn: async () =>
      (
        await api.get("/log/system/page", {
          params: {
            page,
            pageSize: 10,
            level: level || undefined,
            module: moduleName || undefined,
            message: message || undefined,
            stackKeyword: stackKeyword || undefined,
            hasStack: hasStack || undefined,
          },
        })
      ).data,
  });
  const { data: statsData, isLoading: statsLoading } = useQuery<SystemLogStats>({
    queryKey: ["system-logs-stats", dateRange, level, moduleName, message, stackKeyword, hasStack],
    queryFn: async () =>
      (
        await api.get("/log/system/stats", {
          params: {
            dateRange,
            level: level || undefined,
            module: moduleName || undefined,
            message: message || undefined,
            stackKeyword: stackKeyword || undefined,
            hasStack: hasStack || undefined,
          },
        })
      ).data,
  });

  const resolveLevelColor = (value?: string | null) => {
    if (value === "ERROR") return "red";
    if (value === "WARN") return "orange";
    if (value === "INFO") return "blue";
    return "gray";
  };

  const resolveLevelLabel = (value?: string | null) => {
    if (value === "ERROR") return "错误";
    if (value === "WARN") return "告警";
    if (value === "INFO") return "信息";
    return value || "未知";
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/log/system/page", {
        params: {
          page: 1,
          pageSize: 500,
          level: level || undefined,
          module: moduleName || undefined,
          message: message || undefined,
          stackKeyword: stackKeyword || undefined,
          hasStack: hasStack || undefined,
        },
      });

      const rows: SystemLogItem[] = response.data?.list || [];
      const header = ["级别", "模块", "日志内容", "堆栈摘要", "时间"];
      const csvRows = rows.map((item) => [
        item.level || "UNKNOWN",
        item.module || "",
        item.message || "",
        item.stack ? String(item.stack).slice(0, 500) : "",
        item.createTime ? new Date(item.createTime).toLocaleString() : "",
      ]);
      const csv = [header, ...csvRows]
        .map((row: Array<string | number>) =>
          row.map((cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      notifications.show({
        title: "导出失败",
        message: "当前无法导出系统日志，请稍后重试",
        color: "red",
      });
    }
  };

  const errorCount =
    statsData?.levelDistribution?.find((item) => item.name === "ERROR")?.value || 0;
  const warnCount =
    statsData?.levelDistribution?.find((item) => item.name === "WARN")?.value || 0;
  const infoCount =
    statsData?.levelDistribution?.find((item) => item.name === "INFO")?.value || 0;
  const stackCount = statsData?.stackCount || 0;

  const columns = [
    {
      key: "level",
      title: "级别",
      render: (item: SystemLogItem) => (
        <Badge color={resolveLevelColor(item.level)} variant="light">
          {item.level || "UNKNOWN"}
        </Badge>
      ),
    },
    {
      key: "module",
      title: "模块",
      render: (item: SystemLogItem) => <Text fw={600}>{item.module || "-"}</Text>,
    },
    {
      key: "message",
      title: "日志内容",
      render: (item: SystemLogItem) => (
        <Stack gap={6}>
          <Text size="sm" lineClamp={2}>
            {item.message}
          </Text>
          <Button size="xs" variant="subtle" onClick={() => setSelectedLog(item)}>
            查看详情
          </Button>
        </Stack>
      ),
    },
    {
      key: "createTime",
      title: "时间",
      render: (item: SystemLogItem) => (
        <Text size="xs" c="dimmed">
          {item.createTime ? new Date(item.createTime).toLocaleString() : "--"}
        </Text>
      ),
    },
  ];
  const trendOption: EChartsOption = {
    xAxis: {
      type: "category",
      data: statsData?.trend?.map((item) => item.date || "") || [],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "系统日志",
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.12 },
        data: statsData?.trend?.map((item) => item.value) || [],
      },
    ],
  };
  const levelOption: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0, left: "center" },
    series: [
      {
        name: "日志级别",
        type: "pie",
        radius: ["42%", "72%"],
        label: { formatter: "{b}\n{d}%" },
        data: statsData?.levelDistribution || [],
      },
    ],
  };

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="系统日志"
          description="集中查看后端运行告警、错误堆栈与系统级事件"
          rightSection={
            <Group gap="sm">
              <Badge color="blue" variant="light">
                运行观测
              </Badge>
              <Button leftSection={<IconDownload size={16} />} variant="light" onClick={handleExport}>
                导出当前筛选
              </Button>
            </Group>
          }
        />

        <Card withBorder radius="md" mb="md">
          <Group justify="space-between" mb="md">
            <Text fw={700}>系统日志趋势</Text>
            <Group gap={0}>
              <Button
                variant={dateRange === "today" ? "filled" : "light"}
                onClick={() => setDateRange("today")}
              >
                今天
              </Button>
              <Button
                variant={dateRange === "7d" ? "filled" : "light"}
                onClick={() => setDateRange("7d")}
              >
                近7天
              </Button>
              <Button
                variant={dateRange === "30d" ? "filled" : "light"}
                onClick={() => setDateRange("30d")}
              >
                近30天
              </Button>
            </Group>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            当前统计会跟随下面的筛选条件同步变化，便于直接查看某个模块或某类异常的分布情况。
          </Text>
          <Group align="stretch" grow>
            <Card withBorder radius="md" style={{ flex: 1 }}>
              <Text size="sm" c="dimmed" mb="sm">
                日志数量趋势
              </Text>
              <LineChart option={trendOption} height={260} loading={statsLoading} />
            </Card>
            <Card withBorder radius="md" style={{ flex: 1 }}>
              <Text size="sm" c="dimmed" mb="sm">
                级别分布
              </Text>
              <PieChart option={levelOption} height={260} loading={statsLoading} />
            </Card>
          </Group>
          <Group grow mt="md">
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                错误日志
              </Text>
              <Text fw={800} size="xl" c="red">
                {errorCount}
              </Text>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                告警日志
              </Text>
              <Text fw={800} size="xl" c="orange">
                {warnCount}
              </Text>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                信息日志
              </Text>
              <Text fw={800} size="xl" c="blue">
                {infoCount}
              </Text>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                含堆栈日志
              </Text>
              <Text fw={800} size="xl" c="grape">
                {stackCount}
              </Text>
            </Card>
          </Group>
          <Group grow mt="md">
            <Card
              withBorder
              radius="md"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setLevel(level === "ERROR" ? null : "ERROR");
                setPage(1);
              }}
            >
              <Text size="sm" c="dimmed">
                快速筛选
              </Text>
              <Text fw={700} c="red">
                {level === "ERROR" ? "取消错误筛选" : "只看错误日志"}
              </Text>
            </Card>
            <Card
              withBorder
              radius="md"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setLevel(level === "WARN" ? null : "WARN");
                setPage(1);
              }}
            >
              <Text size="sm" c="dimmed">
                快速筛选
              </Text>
              <Text fw={700} c="orange">
                {level === "WARN" ? "取消告警筛选" : "只看告警日志"}
              </Text>
            </Card>
            <Card
              withBorder
              radius="md"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setHasStack(!hasStack);
                setPage(1);
              }}
            >
              <Text size="sm" c="dimmed">
                快速筛选
              </Text>
              <Text fw={700} c="grape">
                {hasStack ? "取消堆栈筛选" : "只看含堆栈日志"}
              </Text>
            </Card>
          </Group>
          <Card withBorder radius="md" mt="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={700}>
                  高频模块
                </Text>
                <Text size="xs" c="dimmed">
                  点击模块可直接筛表
                </Text>
              </Group>
              <Group gap="sm">
                {(statsData?.moduleDistribution || []).map((item) => (
                  <Button
                    key={item.name}
                    size="xs"
                    variant={moduleName === item.name ? "filled" : "light"}
                    onClick={() => {
                      setModuleName(moduleName === item.name ? "" : item.name);
                      setPage(1);
                    }}
                  >
                    {item.name} · {item.value}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Card>
        </Card>

        <Card withBorder radius="md" mb="md">
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <Button
                leftSection={<IconAlertTriangle size={16} />}
                color="red"
                variant={level === "ERROR" ? "filled" : "light"}
                onClick={() => {
                  setLevel(level === "ERROR" ? null : "ERROR");
                  setPage(1);
                }}
              >
                只看错误
              </Button>
              <Button
                color="orange"
                variant={level === "WARN" ? "filled" : "light"}
                onClick={() => {
                  setLevel(level === "WARN" ? null : "WARN");
                  setPage(1);
                }}
              >
                只看告警
              </Button>
            </Group>
            <Button
              variant="default"
              onClick={() => {
                setLevel(null);
                setModuleName("");
                setMessage("");
                setStackKeyword("");
                setHasStack(false);
                setPage(1);
              }}
            >
              重置筛选
            </Button>
          </Group>
          <Group align="flex-end" grow>
            <Select
              label="日志级别"
              placeholder="全部级别"
              clearable
              value={level}
              onChange={(value) => {
                setLevel(value);
                setPage(1);
              }}
              data={[
                { value: "ERROR", label: "错误" },
                { value: "WARN", label: "告警" },
                { value: "INFO", label: "信息" },
              ]}
            />
            <TextInput
              label="模块"
              placeholder="按模块筛选"
              value={moduleName}
              leftSection={<IconFilter size={16} />}
              onChange={(event) => {
                setModuleName(event.currentTarget.value);
                setPage(1);
              }}
            />
            <TextInput
              label="日志内容"
              placeholder="按内容关键词筛选"
              value={message}
              leftSection={<IconSearch size={16} />}
              onChange={(event) => {
                setMessage(event.currentTarget.value);
                setPage(1);
              }}
            />
            <TextInput
              label="堆栈关键词"
              placeholder="按堆栈关键词筛选"
              value={stackKeyword}
              leftSection={<IconFilter size={16} />}
              onChange={(event) => {
                setStackKeyword(event.currentTarget.value);
                setPage(1);
              }}
            />
          </Group>
          <Group mt="md">
            <Switch
              checked={hasStack}
              onChange={(event) => {
                setHasStack(event.currentTarget.checked);
                setPage(1);
              }}
              label="只看含堆栈日志"
            />
          </Group>
        </Card>

        <Card withBorder radius="md">
          <CommonTable
            data={data?.list}
            columns={columns}
            total={data?.total || 0}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            loading={isLoading}
            emptyIcon={IconActivityHeartbeat}
            emptyTitle="暂无系统日志"
          />
        </Card>

        <Modal
          opened={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={<Text fw={700}>系统日志详情</Text>}
          centered
          radius="md"
          size="lg"
        >
          <Stack gap="md">
            <Card withBorder radius="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge color={resolveLevelColor(selectedLog?.level)} variant="light">
                    {resolveLevelLabel(selectedLog?.level)}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {selectedLog?.createTime ? new Date(selectedLog.createTime).toLocaleString() : "--"}
                  </Text>
                </Group>
                <Text fw={700}>模块：{selectedLog?.module || "-"}</Text>
                <Text size="sm">{selectedLog?.message || "-"}</Text>
              </Stack>
            </Card>
            {selectedLog?.stack ? (
              <Card withBorder radius="md">
                <Text fw={700} mb="sm">
                  堆栈信息
                </Text>
                <Box
                  component="pre"
                  p="md"
                  style={{
                    margin: 0,
                    borderRadius: 8,
                    background: uiTokens.background.surfaceGlow,
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {selectedLog.stack}
                </Box>
              </Card>
            ) : null}
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
