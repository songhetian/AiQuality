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
  rem,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconFilter, IconSearch, IconTimeline } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import api from "../../lib/axios";
import { uiTokens } from "../../components/ui/uiTokens";

type PagedResult<T> = {
  list: T[];
  total: number;
};

type OperationLogItem = {
  id: string;
  username?: string | null;
  operation?: string | null;
  actionKind?: string | null;
  targetType?: string | null;
  targetCount?: number | null;
  path?: string | null;
  status?: number | null;
  responseTime?: number | null;
  createTime?: string | null;
  targetId?: string | null;
  params?: string | null;
};

const actionKindOptions = [
  { value: "AI_CONFIG_UPDATE", label: "更新 AI 配置" },
  { value: "AI_CONFIG_TEST", label: "测试 AI 配置" },
  { value: "ADAPTER_CREATE", label: "创建接口配置" },
  { value: "ADAPTER_UPDATE", label: "更新接口配置" },
  { value: "ADAPTER_STATUS_UPDATE", label: "切换接口状态" },
  { value: "ADAPTER_FAKE_DATA_UPDATE", label: "更新 FakeData 示例" },
  { value: "ADAPTER_FAKE_MODE_TOGGLE", label: "切换 FakeData 模式" },
  { value: "ADAPTER_PREVIEW", label: "预览接口映射" },
  { value: "ADAPTER_COLLECT_PREVIEW", label: "执行接口预采集" },
  { value: "ADAPTER_COLLECT_PERSIST", label: "执行接口补录落库" },
  { value: "VIOLATION_BATCH_HANDLE", label: "批量处理违规" },
  { value: "LOSS_BATCH_FOLLOW_UP", label: "批量跟进流失" },
  { value: "QUALITY_BATCH_REVIEW", label: "批量人工复核" },
  { value: "QUALITY_BATCH_START", label: "批量发起质检" },
  { value: "VIOLATION_HANDLE", label: "单条违规处理" },
  { value: "LOSS_FOLLOW_UP", label: "单条流失跟进" },
  { value: "QUALITY_REVIEW", label: "单条人工复核" },
  { value: "QUALITY_RETRY", label: "重试质检" },
];

const targetTypeOptions = [
  { value: "SYSTEM_CONFIG", label: "系统配置" },
  { value: "ADAPTER_INTERFACE", label: "接口配置" },
  { value: "VIOLATION_ALERT", label: "违规记录" },
  { value: "LOSS_ANALYSIS", label: "流失记录" },
  { value: "QUALITY_INSPECTION", label: "质检记录" },
  { value: "CHAT_SESSION", label: "会话" },
];

export default function OperationLogPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState("");
  const [operation, setOperation] = useState("");
  const [actionKind, setActionKind] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<string | null>(null);
  const [batchOnly, setBatchOnly] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLogItem | null>(null);

  const { data, isLoading } = useQuery<PagedResult<OperationLogItem>>({
    queryKey: ["operation-logs-page", page, username, operation, actionKind, targetType, batchOnly],
    queryFn: async () =>
      (
        await api.get("/log/operation/page", {
          params: {
            page,
            pageSize: 10,
            username: username || undefined,
            operation: operation || undefined,
            actionKind: actionKind || undefined,
            targetType: targetType || undefined,
            batchOnly: batchOnly || undefined,
          },
        })
      ).data,
  });

  const resolveActionKindLabel = (value?: string | null) => {
    if (!value) return "常规动作";
    if (value === "AI_CONFIG_UPDATE") return "更新 AI 配置";
    if (value === "AI_CONFIG_TEST") return "测试 AI 配置";
    if (value === "ADAPTER_CREATE") return "创建接口配置";
    if (value === "ADAPTER_UPDATE") return "更新接口配置";
    if (value === "ADAPTER_STATUS_UPDATE") return "切换接口状态";
    if (value === "ADAPTER_FAKE_DATA_UPDATE") return "更新 FakeData 示例";
    if (value === "ADAPTER_FAKE_MODE_TOGGLE") return "切换 FakeData 模式";
    if (value === "ADAPTER_PREVIEW") return "预览接口映射";
    if (value === "ADAPTER_COLLECT_PREVIEW") return "执行接口预采集";
    if (value === "ADAPTER_COLLECT_PERSIST") return "执行接口补录落库";
    if (value === "VIOLATION_BATCH_HANDLE") return "批量处理违规";
    if (value === "VIOLATION_HANDLE") return "处理违规";
    if (value === "LOSS_BATCH_FOLLOW_UP") return "批量跟进流失";
    if (value === "LOSS_FOLLOW_UP") return "跟进流失";
    if (value === "QUALITY_BATCH_REVIEW") return "批量人工复核";
    if (value === "QUALITY_REVIEW") return "人工复核";
    if (value === "QUALITY_BATCH_START") return "批量发起质检";
    if (value === "QUALITY_RETRY") return "重试质检";
    return value;
  };

  const resolveTargetTypeLabel = (value?: string | null) => {
    if (!value) return "通用对象";
    if (value === "SYSTEM_CONFIG") return "系统配置";
    if (value === "ADAPTER_INTERFACE") return "接口配置";
    if (value === "VIOLATION_ALERT") return "违规记录";
    if (value === "LOSS_ANALYSIS") return "流失记录";
    if (value === "QUALITY_INSPECTION") return "质检记录";
    if (value === "CHAT_SESSION") return "会话";
    return value;
  };

  const columns = [
    {
      key: "username",
      title: "操作人",
      render: (item: OperationLogItem) => <Text fw={600}>{item.username || "系统"}</Text>,
    },
    {
      key: "operation",
      title: "动作摘要",
      render: (item: OperationLogItem) => (
        <Stack gap={6}>
          <Text size="sm" fw={600}>
            {item.operation}
          </Text>
          <Group gap="xs">
            <Badge size="xs" color="green" variant="light">
              {resolveActionKindLabel(item.actionKind)}
            </Badge>
            <Badge size="xs" color="gray" variant="outline">
              {resolveTargetTypeLabel(item.targetType)}
            </Badge>
            {!!item.targetCount && item.targetCount > 1 && (
              <Badge size="xs" color="orange" variant="light">
                {item.targetCount} 条
              </Badge>
            )}
          </Group>
        </Stack>
      ),
    },
    {
      key: "path",
      title: "接口路径",
      render: (item: OperationLogItem) => (
        <Stack gap={6}>
          <Text size="xs" c="dimmed" style={{ wordBreak: "break-all" }}>
            {item.path}
          </Text>
          <Button
            size="xs"
            variant="subtle"
            onClick={() => setSelectedLog(item)}
          >
            查看参数
          </Button>
          <Button size="xs" variant="light" color="green" onClick={() => handleOpenTarget(item)}>
            打开对象
          </Button>
        </Stack>
      ),
    },
    {
      key: "status",
      title: "结果",
      render: (item: OperationLogItem) => (
        <Badge color={item.status === 200 ? "green" : "red"} variant="light">
          {item.status === 200 ? "成功" : item.status}
        </Badge>
      ),
    },
    {
      key: "responseTime",
      title: "耗时",
      render: (item: OperationLogItem) => <Text size="sm">{item.responseTime} ms</Text>,
    },
    {
      key: "createTime",
      title: "时间",
      render: (item: OperationLogItem) => (
        <Text size="xs" c="dimmed">
          {item.createTime ? new Date(item.createTime).toLocaleString() : "--"}
        </Text>
      ),
    },
  ];

  const handleExport = async () => {
    try {
      const response = await api.get("/log/operation/page", {
        params: {
          page: 1,
          pageSize: 500,
          username: username || undefined,
          operation: operation || undefined,
          actionKind: actionKind || undefined,
          targetType: targetType || undefined,
          batchOnly: batchOnly || undefined,
        },
      });

      const rows: OperationLogItem[] = response.data?.list || [];
      const header = ["操作人", "动作摘要", "动作类型", "对象类型", "对象数量", "接口路径", "结果", "耗时(ms)", "时间"];
      const csvRows: Array<Array<string | number>> = rows.map((item) => [
        item.username || "系统",
        item.operation || "",
        resolveActionKindLabel(item.actionKind) || "",
        resolveTargetTypeLabel(item.targetType) || "",
        item.targetCount || "",
        item.path || "",
        item.status === 200 ? "成功" : (item.status ?? ""),
        item.responseTime || 0,
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
      link.download = `operation-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      notifications.show({
        title: "导出失败",
        message: "当前无法导出操作日志，请稍后重试",
        color: "red",
      });
    }
  };
  const handleOpenTarget = (item: OperationLogItem) => {
    if (!item?.targetType || !item?.targetId) {
      notifications.show({
        title: "当前日志无法跳转",
        message: "这条记录没有可用的目标对象定位信息",
        color: "gray",
      });
      return;
    }

    if (item.targetType === "QUALITY_INSPECTION") {
      navigate(`/quality?inspectionId=${item.targetId}&autoOpen=true`);
      return;
    }

    if (item.targetType === "LOSS_ANALYSIS") {
      navigate(`/insight/loss?lossId=${item.targetId}&autoOpen=true`);
      return;
    }

    if (item.targetType === "VIOLATION_ALERT") {
      navigate(`/violation?alertId=${item.targetId}&autoOpen=true`);
      return;
    }

    if (item.targetType === "SYSTEM_CONFIG") {
      navigate("/ai-config");
      return;
    }

    if (item.targetType === "ADAPTER_INTERFACE") {
      navigate(`/adapter?interfaceId=${item.targetId}`);
      return;
    }

    notifications.show({
      title: "当前日志暂不支持跳转",
      message: "该对象类型还没有对应的详情页联动",
      color: "gray",
    });
  };

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="操作日志"
          description="查看系统内的结构化审计记录，快速定位批量动作与关键变更"
          rightSection={
            <Group gap="sm">
              <Badge color="green" variant="light">
                结构化审计已启用
              </Badge>
              <Button variant="light" onClick={handleExport}>
                导出当前筛选
              </Button>
            </Group>
          }
        />

        <Card
          withBorder
          radius="lg"
          mb="md"
          style={{
            position: "relative",
            overflow: "hidden",
            borderColor: uiTokens.colors.border,
            background:
              "radial-gradient(circle at top right, rgba(199, 240, 65, 0.12), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(245,255,248,0.98) 100%)",
            boxShadow: uiTokens.shadow.panel,
          }}
        >
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: rem(120),
              height: rem(4),
              borderRadius: rem(uiTokens.radius.pill),
              background: `linear-gradient(90deg, ${uiTokens.colors.primary} 0%, ${uiTokens.colors.accent} 100%)`,
            }}
          />
          <Group align="flex-end" grow>
            <TextInput
              label="操作人"
              placeholder="按用户名筛选"
              value={username}
              leftSection={<IconSearch size={16} />}
              onChange={(event) => {
                setUsername(event.currentTarget.value);
                setPage(1);
              }}
            />
            <TextInput
              label="动作摘要"
              placeholder="按操作文案筛选"
              value={operation}
              leftSection={<IconFilter size={16} />}
              onChange={(event) => {
                setOperation(event.currentTarget.value);
                setPage(1);
              }}
            />
            <Select
              label="动作类型"
              placeholder="全部动作"
              clearable
              value={actionKind}
              onChange={(value) => {
                setActionKind(value);
                setPage(1);
              }}
              data={actionKindOptions}
            />
            <Select
              label="对象类型"
              placeholder="全部对象"
              clearable
              value={targetType}
              onChange={(value) => {
                setTargetType(value);
                setPage(1);
              }}
              data={targetTypeOptions}
            />
          </Group>

          <Group justify="space-between" mt="md">
            <Switch
              checked={batchOnly}
              onChange={(event) => {
                setBatchOnly(event.currentTarget.checked);
                setPage(1);
              }}
              label="只看批量动作"
            />
            <Button
              variant="default"
              onClick={() => {
                setUsername("");
                setOperation("");
                setActionKind(null);
                setTargetType(null);
                setBatchOnly(false);
                setPage(1);
              }}
            >
              重置筛选
            </Button>
          </Group>
        </Card>

        <Card
          withBorder
          radius="lg"
          style={{
            borderColor: uiTokens.colors.border,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(246,255,248,0.98) 100%)",
            boxShadow: uiTokens.shadow.panel,
          }}
        >
          <CommonTable
            data={data?.list}
            columns={columns}
            total={data?.total || 0}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            loading={isLoading}
            emptyIcon={IconTimeline}
            emptyTitle="暂无操作日志"
          />
        </Card>

        <Modal
          opened={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={<Text fw={700}>操作日志详情</Text>}
          centered
          radius="md"
          size="lg"
        >
          <Stack gap="md">
            <Card withBorder radius="md">
              <Stack gap="xs">
                <Text fw={700}>{selectedLog?.operation || "-"}</Text>
                <Group gap="xs">
                  <Badge size="sm" color="green" variant="light">
                    {resolveActionKindLabel(selectedLog?.actionKind)}
                  </Badge>
                  <Badge size="sm" color="gray" variant="outline">
                    {resolveTargetTypeLabel(selectedLog?.targetType)}
                  </Badge>
                  {!!selectedLog?.targetCount && selectedLog.targetCount > 1 && (
                    <Badge size="sm" color="orange" variant="light">
                      {selectedLog.targetCount} 条
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed">
                  操作人：{selectedLog?.username || "系统"}
                </Text>
                <Text size="sm" c="dimmed">
                  时间：{selectedLog?.createTime ? new Date(selectedLog.createTime).toLocaleString() : "--"}
                </Text>
                <Text size="sm" c="dimmed" style={{ wordBreak: "break-all" }}>
                  路径：{selectedLog?.path || "--"}
                </Text>
              </Stack>
            </Card>
            <Card withBorder radius="md">
              <Text fw={700} mb="sm">
                原始参数
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
                {selectedLog?.params || "无参数记录"}
              </Box>
            </Card>
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
