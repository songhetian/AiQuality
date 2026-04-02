import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Group,
  Button,
  Badge,
  Text,
  Progress,
  Select,
  TextInput,
  rem,
  UnstyledButton,
  Modal,
  Grid,
  Stack,
  Divider,
  NumberInput,
  Textarea,
  Paper,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconEye,
  IconRobot,
  IconFilter,
  IconCheck,
  IconAlertCircle,
  IconClipboardText,
} from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { VirtualChatList } from "../../components/chat/VirtualChatList";
import type { ChatRecord as VirtualChatRecord } from "../../components/chat/VirtualChatList";
import { SmoothProgress } from "../../components/ui/SmoothProgress";
import { uiTokens } from "../../components/ui/uiTokens";
import { useSocket } from "../../hooks/useSocket";
import api from "../../lib/axios";
import { notifications } from "@mantine/notifications";

type PagedResult<T> = {
  list: T[];
  total: number;
};

type OperationLogItem = {
  id: string;
  operation?: string;
  actionKind?: string | null;
  targetType?: string | null;
  targetCount?: number | null;
  createTime?: string | null;
  params?: string | null;
};

type QualitySession = {
  sessionId?: string | null;
  records?: VirtualChatRecord[];
};

type QualityRule = {
  id?: string;
  name?: string | null;
  deptId?: string | null;
};

type QualityAiMeta = {
  retryCount?: number | null;
  lastFailedAt?: string | null;
};

type QualityInspectionItem = {
  id: string;
  sessionId: string;
  status?: number;
  aiScore?: number | null;
  aiResult?: string | null;
  updateTime?: string | null;
  manualReviewNeeded?: boolean;
  qualitySummary?: string | null;
  session?: QualitySession | null;
  rule?: QualityRule | null;
};

type QualityInspectionDetail = QualityInspectionItem & {
  session?: QualitySession | null;
  aiMeta?: QualityAiMeta | null;
};

type ReviewPayload = {
  status: number;
  manualScore: number | string;
  manualResult: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type TaskProgressEvent = {
  taskId?: string;
  progress?: number;
};

type QualityStatusChangedEvent = {
  sessionId?: string;
  inspectionId?: string;
  status?: number;
  aiScore?: number;
  aiResult?: string;
  updatedAt?: string;
  manualReviewNeeded?: boolean;
  qualitySummary?: string;
};

const resolveQualityStatusLabel = (value?: number) => {
  if (value === 0) return "质检中";
  if (value === 1) return "待复核";
  if (value === 2) return "已复核";
  if (value === 3) return "需整改";
  if (value === 4) return "AI失败";
  return "未知状态";
};

const resolveQualitySummary = (value?: number) => {
  if (value === 0) return "AI 质检进行中";
  if (value === 1) return "已生成结果，建议人工复核";
  if (value === 2) return "AI 质检通过，可进入常规复盘";
  if (value === 3) return "检测到风险点，建议尽快整改";
  if (value === 4) return "AI 分析失败，建议人工补看或重试";
  return "质检状态待同步";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError | undefined)?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

export default function QualityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [manualReviewOnly, setManualReviewOnly] = useState(false);
  const [dateRange, setDateRange] = useState("today");
  const [sessionKeyword, setSessionKeyword] = useState(searchParams.get("sessionId") || "");
  const [inspectionKeyword] = useState(searchParams.get("inspectionId") || "");
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  // 弹窗状态
  const [detailOpened, setDetailOpened] = useState(false);
  const [batchReviewOpened, setBatchReviewOpened] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [manualScore, setManualScore] = useState<number | string>(100);
  const [opinion, setOpinion] = useState("");
  const [batchStatus, setBatchStatus] = useState<string | null>("2");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const resolveActionKindLabel = (value?: string | null) => {
    if (!value) return "常规动作";
    if (value === "QUALITY_BATCH_REVIEW") return "批量人工复核";
    if (value === "QUALITY_REVIEW") return "人工复核";
    if (value === "QUALITY_BATCH_START") return "批量发起质检";
    if (value === "QUALITY_RETRY") return "重试质检";
    return value;
  };
  const openOperationLogPage = (item: OperationLogItem) => {
    const params = new URLSearchParams();
    if (item?.actionKind) params.set("actionKind", item.actionKind);
    if (item?.targetType) params.set("targetType", item.targetType);
    navigate(`/log/operation?${params.toString()}`);
  };

  const { data, isLoading } = useQuery<PagedResult<QualityInspectionItem>>({
    queryKey: ["inspections", page, status, manualReviewOnly, dateRange, sessionKeyword, inspectionKeyword],
    queryFn: async () =>
      (
        await api.get("/quality/list", {
          params: {
            page,
            pageSize: 10,
            status,
            dateRange,
            sessionId: sessionKeyword || undefined,
            inspectionId: inspectionKeyword || undefined,
            manualReviewNeeded: manualReviewOnly || undefined,
          },
        })
      ).data,
  });
  const { data: ruleOptionsData = [] } = useQuery<QualityRule[]>({
    queryKey: ["quality-active-rules"],
    queryFn: async () => (await api.get("/quality/rules/active")).data,
  });
  const effectiveRuleId = selectedRuleId || ruleOptionsData[0]?.id || null;
  const qualityRuleOptions = ruleOptionsData.map((item) => ({
    value: item.id || "",
    label: item.name || item.id || "未命名规则",
  }));

  // 获取单个质检详情 (包含聊天记录)
  const { data: detail } = useQuery<QualityInspectionDetail>({
    queryKey: ["inspection-detail", selectedId],
    queryFn: async () => (await api.get(`/quality/detail/${selectedId}`)).data,
    enabled: !!selectedId && detailOpened,
  });
  const { data: auditLogs, isLoading: auditLoading } = useQuery<OperationLogItem[]>({
    queryKey: ["quality-audit-logs", selectedId],
    queryFn: async () =>
      (
        await api.get("/log/operation/list", {
          params: {
            page: 1,
            pageSize: 10,
            targetType: "QUALITY_INSPECTION",
            targetId: selectedId || undefined,
          },
        })
      ).data,
    enabled: !!selectedId && detailOpened,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: ReviewPayload) =>
      api.put(`/quality/update/${selectedId}`, payload),
    onSuccess: () => {
      notifications.show({
        title: "提交成功",
        message: "人工复核结果已记录",
        color: "green",
      });
      setDetailOpened(false);
      setSelectedSessionId(null);
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });

  const retryMutation = useMutation({
    mutationFn: async () => api.post(`/quality/retry/${selectedId}`),
    onSuccess: () => {
      notifications.show({
        title: "已加入重试队列",
        message: "系统正在重新执行 AI 质检，请稍候查看结果",
        color: "blue",
      });
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      queryClient.invalidateQueries({ queryKey: ["inspection-detail", selectedId] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "重试失败",
        message: getErrorMessage(error, "无法重新发起 AI 质检"),
        color: "red",
      });
    },
  });
  const batchUpdateMutation = useMutation({
    mutationFn: async () =>
      api.put(`/quality/batch-update`, {
        ids: selectedIds,
        status: Number(batchStatus || 2),
        manualScore,
        manualResult: opinion,
      }),
    onSuccess: async () => {
      notifications.show({
        title: "批量复核完成",
        message: `已更新 ${selectedIds.length} 条质检记录`,
        color: "green",
      });
      setSelectedIds([]);
      setBatchReviewOpened(false);
      setBatchStatus("2");
      setManualScore(100);
      setOpinion("");
      await queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "批量更新失败",
        message: getErrorMessage(error, "请稍后重试"),
        color: "red",
      });
    },
  });

  const { on } = useSocket();
  const [taskProgress, setTaskProgress] = useState<{
    id: string;
    percent: number;
  } | null>(null);

  useEffect(() => {
    const cleanup = on("task_progress", (payload) => {
      const data = (payload ?? {}) as TaskProgressEvent;
      setTaskProgress({
        id: data.taskId || "",
        percent: typeof data.progress === "number" ? data.progress : 0,
      });
      if (data.progress === 100) {
        notifications.show({
          title: "任务完成",
          message: "批量 AI 质检已全部结束",
          color: "green",
        });
        queryClient.invalidateQueries({ queryKey: ["inspections"] });
        setTimeout(() => setTaskProgress(null), 3000);
      }
    });
    return cleanup;
  }, [on, queryClient]);

  useEffect(() => {
    const cleanup = on("quality_status_changed", (event) => {
      const payload = (event ?? {}) as QualityStatusChangedEvent;
      if (!payload?.sessionId) {
        return;
      }

      queryClient.setQueriesData<PagedResult<QualityInspectionItem>>({ queryKey: ["inspections"] }, (previous) => {
        if (!previous?.list?.length) {
          return previous;
        }

        let changed = false;
        const nextList = previous.list.map((item) => {
          if (item.sessionId !== payload.sessionId) {
            return item;
          }

          changed = true;
          return {
            ...item,
            status: payload.status,
            aiScore:
              Object.prototype.hasOwnProperty.call(payload, "aiScore") ? payload.aiScore : item.aiScore,
            aiResult:
              Object.prototype.hasOwnProperty.call(payload, "aiResult") ? payload.aiResult : item.aiResult,
            updateTime: payload.updatedAt || item.updateTime,
            manualReviewNeeded:
              Object.prototype.hasOwnProperty.call(payload, "manualReviewNeeded")
                ? payload.manualReviewNeeded
                : item.manualReviewNeeded,
            qualitySummary:
              Object.prototype.hasOwnProperty.call(payload, "qualitySummary")
                ? payload.qualitySummary
                : item.qualitySummary,
            statusLabel: resolveQualityStatusLabel(payload.status),
            id: payload.inspectionId ?? item.id,
          };
        });

        if (!changed) {
          return previous;
        }

        return {
          ...previous,
          list: nextList,
        };
      });

      if (selectedSessionId === payload.sessionId) {
        if (payload.inspectionId && selectedId !== payload.inspectionId) {
          setSelectedId(payload.inspectionId);
        }

        const patchDetail = (key: string | null) => {
          if (!key) {
            return;
          }

          queryClient.setQueryData<QualityInspectionDetail>(["inspection-detail", key], (previous) =>
            previous
              ? {
                  ...previous,
                  id: payload.inspectionId ?? previous.id,
                  status: payload.status,
                  aiScore:
                    Object.prototype.hasOwnProperty.call(payload, "aiScore") ? payload.aiScore : previous.aiScore,
                  aiResult:
                    Object.prototype.hasOwnProperty.call(payload, "aiResult") ? payload.aiResult : previous.aiResult,
                  updateTime: payload.updatedAt || previous.updateTime,
                  manualReviewNeeded:
                    Object.prototype.hasOwnProperty.call(payload, "manualReviewNeeded")
                      ? payload.manualReviewNeeded
                      : previous.manualReviewNeeded,
                  qualitySummary:
                    Object.prototype.hasOwnProperty.call(payload, "qualitySummary")
                      ? payload.qualitySummary
                      : previous.qualitySummary ?? resolveQualitySummary(payload.status ?? previous.status),
                  statusLabel: resolveQualityStatusLabel(payload.status ?? previous.status),
                }
              : previous,
          );
        };

        patchDetail(selectedId);
        patchDetail(payload.inspectionId || null);
      }
    });

    return cleanup;
  }, [on, queryClient, selectedId, selectedSessionId]);

  const handleStartBatch = async () => {
    try {
      if (!effectiveRuleId) {
        notifications.show({
          title: "缺少质检规则",
          message: "请先选择一个可用规则后再启动批量质检",
          color: "yellow",
        });
        return;
      }
      await api.post("/quality/batch", {
        sessionIds: data?.list?.map((item) => item.sessionId) || [],
        ruleId: effectiveRuleId,
      });
      notifications.show({
        title: "任务已启动",
        message: "后台正在进行异步质检...",
        color: "blue",
      });
    } catch {
      notifications.show({
        title: "启动失败",
        message: "无法开启批量任务",
        color: "red",
      });
    }
  };

  async function handleOpenDetail(item: QualityInspectionItem) {
    try {
      await api.post(`/quality/manual/lock/${item.sessionId}`);
      setSelectedId(item.id);
      setSelectedSessionId(item.sessionId);
      setDetailOpened(true);
    } catch (error: unknown) {
      notifications.show({
        title: "无法进入复核",
        message: getErrorMessage(error, "当前会话正在由其他人复核，请稍后再试"),
        color: "red",
      });
    }
  }

  useEffect(() => {
    const autoOpen = searchParams.get("autoOpen") === "true";
    if (!autoOpen || detailOpened || !data?.list?.length) {
      return;
    }

    const currentSessionId = searchParams.get("sessionId");
    const currentInspectionId = searchParams.get("inspectionId");
    const matched = data.list.find((item) =>
      (currentInspectionId && item.id === currentInspectionId) ||
      (currentSessionId &&
        (item.sessionId === currentSessionId || item.session?.sessionId?.includes(currentSessionId))),
    );

    if (!matched) {
      return;
    }

    const timer = window.setTimeout(() => {
      void handleOpenDetail(matched);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("autoOpen");
        return next;
      }, { replace: true });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [data, detailOpened, searchParams, setSearchParams]);

  const handleCloseDetail = async () => {
    if (selectedSessionId) {
      try {
        await api.post(`/quality/manual/unlock/${selectedSessionId}`);
      } catch {
        // 关闭弹窗时不阻断用户流程
      }
    }
    setDetailOpened(false);
    setSelectedSessionId(null);
  };
  const toggleRow = (id: string | number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id),
    );
  };
  const toggleAll = (ids: Array<string | number>, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...ids]));
      }
      return prev.filter((item) => !ids.includes(item));
    });
  };
  const openBatchReviewModal = () => {
    setBatchStatus("2");
    setManualScore(100);
    setOpinion("");
    setBatchReviewOpened(true);
  };

  const columns = [
    {
      key: "sessionId",
      title: "会话 ID",
      render: (item: QualityInspectionItem) => (
        <Text fw={700} c="green.9">
          {item.session?.sessionId}
        </Text>
      ),
    },
    {
      key: "aiScore",
      title: "AI 评分",
      render: (item: QualityInspectionItem) => {
        if (typeof item.aiScore !== "number") {
          return (
            <Badge color="red" variant="light">
              AI不可用
            </Badge>
          );
        }

        return (
          <Group gap="xs">
            <Text size="sm" fw={700} c={item.aiScore < 60 ? "red" : "green"}>
              {item.aiScore}
            </Text>
            <Progress
              value={item.aiScore}
              size="sm"
              w={rem(100)}
              color={item.aiScore < 60 ? "red" : "green"}
              radius="xl"
            />
          </Group>
        );
      },
    },
    {
      key: "status",
      title: "状态",
      render: (item: QualityInspectionItem) => {
        const statusConfig =
          item.status === 0
            ? { color: "grape", label: "质检中" }
            : item.status === 1
            ? { color: "blue", label: "待复核" }
            : item.status === 2
            ? { color: "green", label: "已复核" }
            : item.status === 3
            ? { color: "orange", label: "需整改" }
            : { color: "red", label: "AI失败" };

        return (
          <Badge color={statusConfig.color} variant="light">
            {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      key: "ruleName",
      title: "质检规则",
      render: (item: QualityInspectionItem) => (
        <Text size="sm" c="dimmed">
          {item.rule?.name}
        </Text>
      ),
    },
    {
      key: "qualitySummary",
      title: "处置建议",
      render: (item: QualityInspectionItem) => (
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Badge color={item.manualReviewNeeded ? "orange" : "green"} variant="light">
            {item.manualReviewNeeded ? "优先复核" : "可直接复盘"}
          </Badge>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {item.qualitySummary || resolveQualitySummary(item.status)}
          </Text>
        </Group>
      ),
    },
    {
      key: "actions",
      title: "操作",
      render: (item: QualityInspectionItem) => (
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconEye size={14} />}
          color="green"
          onClick={() => handleOpenDetail(item)}
        >
          详情复核
        </Button>
      ),
    },
  ];

  const dateBtnStyle = {
    height: rem(44),
    border: `1px solid ${uiTokens.colors.borderStrong}`,
    padding: `0 ${rem(16)}`,
    fontSize: rem(14),
    fontWeight: 600,
    color: uiTokens.colors.text,
    backgroundColor: uiTokens.colors.panel,
  };

  const panelCardStyle = {
    borderColor: uiTokens.colors.border,
    background: uiTokens.background.surfaceHighlight,
    boxShadow: uiTokens.shadow.panel,
    position: "relative" as const,
    overflow: "hidden",
  };

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="质检工作台"
          description="实时监控 AI 自动质检结果，处理人工复核与整改跟踪"
          rightSection={
            <Group>
              <Select
                placeholder="选择质检规则"
                data={qualityRuleOptions}
                value={effectiveRuleId}
                onChange={setSelectedRuleId}
                w={240}
                searchable
              />
              <Button
                leftSection={<IconRobot size={18} />}
                variant="light"
                onClick={handleStartBatch}
                disabled={!effectiveRuleId}
                loading={taskProgress !== null && taskProgress.percent < 100}
              >
                启动批量 AI 质检
              </Button>
            </Group>
          }
        />

        {taskProgress && (
          <Box
            style={{
              overflow: "hidden",
              opacity: 1,
              transform: "translateY(0)",
              transition: "opacity 220ms ease, transform 220ms ease",
            }}
          >
            <Card
              withBorder
              mb="md"
              p="md"
              radius="xl"
              style={panelCardStyle}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: rem(112),
                  height: rem(4),
                  borderRadius: rem(uiTokens.radius.pill),
                  background: uiTokens.background.navLine,
                }}
              />
              <SmoothProgress
                value={taskProgress.percent}
                label="AI 批量质检引擎运行中"
                subLabel={`任务 ID: ${taskProgress.id}`}
                color="var(--mantine-color-blue-6)"
                height={14}
              />
            </Card>
          </Box>
        )}

        <Card withBorder radius="xl" mb="md" p="lg" style={panelCardStyle}>
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: rem(104),
              height: rem(4),
              borderRadius: rem(uiTokens.radius.pill),
              background: uiTokens.background.navLine,
            }}
          />
          <Group mb="md" justify="space-between" align="flex-start">
            <Group gap="sm" align="center">
              <ThemeIcon color="green" variant="light" radius="md">
                <IconFilter size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700} c={uiTokens.colors.heading}>质检筛选</Text>
                <Text size="sm" c={uiTokens.colors.textMuted}>按状态、规则和时间快速定位需要复核的会话</Text>
              </Box>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <Badge
                color={manualReviewOnly ? "orange" : "gray"}
                variant={manualReviewOnly ? "filled" : "light"}
                style={{ cursor: "pointer", alignSelf: "center" }}
                onClick={() => {
                  setManualReviewOnly((prev) => !prev);
                  setPage(1);
                }}
              >
                建议人工复核
              </Badge>
              <Group gap={0} wrap="nowrap">
                <UnstyledButton
                  style={{
                    ...dateBtnStyle,
                    borderRadius: `${rem(6)} 0 0 ${rem(6)}`,
                    background: dateRange === "today" ? uiTokens.background.navItemActive : uiTokens.colors.panel,
                  }}
                  onClick={() => setDateRange("today")}
                >
                  今天
                </UnstyledButton>
                <UnstyledButton
                  style={{
                    ...dateBtnStyle,
                    borderLeft: 0,
                    borderRight: 0,
                    background: dateRange === "7d" ? uiTokens.background.navItemActive : uiTokens.colors.panel,
                  }}
                  onClick={() => setDateRange("7d")}
                >
                  近7天
                </UnstyledButton>
                <UnstyledButton
                  style={{
                    ...dateBtnStyle,
                    borderRadius: `0 ${rem(6)} ${rem(6)} 0`,
                    background: dateRange === "30d" ? uiTokens.background.navItemActive : uiTokens.colors.panel,
                  }}
                  onClick={() => setDateRange("30d")}
                >
                  近30天
                </UnstyledButton>
              </Group>
            </Group>
          </Group>
          <Group gap="md" wrap="nowrap" style={{ width: "100%" }}>
            <TextInput
              placeholder="搜索会话ID"
              leftSection={<IconFilter size={16} />}
              value={sessionKeyword}
              onChange={(event) => {
                setSessionKeyword(event.currentTarget.value);
                setPage(1);
              }}
              styles={{ root: { flexGrow: 1 } }}
            />
            <Select
              placeholder="质检状态"
              data={[
                { value: "0", label: "质检中" },
                { value: "1", label: "待复核" },
                { value: "2", label: "已复核" },
                { value: "3", label: "需整改" },
                { value: "4", label: "AI失败" },
              ]}
              leftSection={<IconFilter size={16} />}
              value={status}
              onChange={setStatus}
              clearable
              styles={{ root: { flexGrow: 1 } }}
            />
            <Select
              placeholder="所属平台"
              data={["平台A", "平台B"]}
              clearable
              styles={{ root: { flexGrow: 1 } }}
            />
          </Group>
        </Card>

        <Card withBorder radius="xl" style={panelCardStyle}>
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
          {selectedIds.length > 0 && (
            <Group mb="md" justify="space-between">
              <Badge color="orange" variant="light">
                已选择 {selectedIds.length} 条质检记录
              </Badge>
              <Button size="xs" color="orange" variant="light" onClick={openBatchReviewModal}>
                批量人工复核
              </Button>
            </Group>
          )}
          <CommonTable
            data={data?.list}
            columns={columns}
            total={data?.total || 0}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            loading={isLoading}
            selectable
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
          />
        </Card>

        <Modal
          opened={detailOpened}
          onClose={handleCloseDetail}
          title={
            <Text fw={700} size="lg">
              质检详情复核 - {detail?.session?.sessionId}
            </Text>
          }
          size="90%"
          radius="md"
        >
          <Grid gutter="xl">
            <Grid.Col span={7}>
              <Box
                style={{
                  border: `1px solid ${uiTokens.colors.border}`,
                  borderRadius: rem(8),
                  overflow: "hidden",
                }}
              >
                <Box p="xs" bg="gray.0">
                  <Text size="xs" fw={700}>
                    聊天记录回顾 (虚拟滚动)
                  </Text>
                </Box>
                <VirtualChatList records={detail?.session?.records || []} />
              </Box>
            </Grid.Col>

            <Grid.Col span={5}>
              <Stack gap="md">
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  bg="blue.0"
                  style={{ borderColor: uiTokens.colors.border }}
                >
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={700} c="blue.9">
                      AI 质检诊断
                    </Text>
                    <Group gap="xs">
                      {detail?.status === 4 && (
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          loading={retryMutation.isPending}
                          onClick={() => retryMutation.mutate()}
                        >
                          重试 AI
                        </Button>
                      )}
                      <Badge color={detail?.status === 4 ? "red" : "blue"}>
                        {detail?.status === 4 ? "AI失败" : "系统自动生成"}
                      </Badge>
                      {detail?.manualReviewNeeded && (
                        <Badge color="orange" variant="light">
                          建议人工复核
                        </Badge>
                      )}
                    </Group>
                  </Group>
                  <Text size="xl" fw={900} c="blue.9" mb="md">
                    {typeof detail?.aiScore === "number" ? `${detail.aiScore} 分` : "待重试"}
                  </Text>
                  <Text size="sm" fw={700} c="blue.8" mb={6}>
                    {detail?.qualitySummary || resolveQualitySummary(detail?.status)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {detail?.aiResult || "AI 分析中..."}
                  </Text>
                  <Group gap="xs" mt="md">
                    <IconClipboardText size={15} color={uiTokens.colors.primaryDeeper} />
                    <Text size="xs" c="dimmed">
                      {detail?.manualReviewNeeded
                        ? "这条会话建议人工复核后再决定是否整改。"
                        : "这条会话可直接进入常规复盘或抽样检查。"}
                    </Text>
                  </Group>
                  {!!detail?.aiMeta && (
                    <Group gap="lg" mt="md">
                      <Text size="xs" c="dimmed">
                        重试次数：{detail.aiMeta.retryCount || 0}
                      </Text>
                      <Text size="xs" c="dimmed">
                        最近失败：
                        {detail.aiMeta.lastFailedAt
                          ? ` ${new Date(detail.aiMeta.lastFailedAt).toLocaleString()}`
                          : " -"}
                      </Text>
                    </Group>
                  )}
                </Paper>

                <Divider label="人工复核决策" labelPosition="center" />

                <Paper withBorder p="md" radius="md">
                  <Text size="sm" fw={700} mb="sm">
                    最近相关操作
                  </Text>
                  {auditLoading ? (
                    <Text size="sm" c="dimmed">
                      正在加载操作轨迹...
                    </Text>
                  ) : (auditLogs?.length || 0) > 0 ? (
                    <Stack gap="sm">
                      {(auditLogs ?? []).map((item) => (
                        <Card key={item.id} withBorder radius="md" p="sm">
                          <Group justify="space-between" align="flex-start">
                            <Box>
                              <Text size="sm" fw={600}>
                                {item.operation}
                              </Text>
                              <Group gap="xs" mt={6}>
                                <Badge size="xs" color="green" variant="light">
                                  {resolveActionKindLabel(item.actionKind)}
                                </Badge>
                                {!!item.targetCount && item.targetCount > 1 && (
                                  <Badge size="xs" color="orange" variant="light">
                                    {item.targetCount} 条
                                  </Badge>
                                )}
                              </Group>
                            </Box>
                            <Text size="xs" c="dimmed">
                              {item.createTime ? new Date(item.createTime).toLocaleString() : "--"}
                            </Text>
                          </Group>
                          {item.params ? (
                            <Text size="xs" c="dimmed" mt="xs" style={{ wordBreak: "break-word" }}>
                              {item.params}
                            </Text>
                          ) : null}
                          <Group gap="xs" mt="sm">
                            <Button
                              size="xs"
                              variant="light"
                              color="green"
                              onClick={() => navigate(`/quality?inspectionId=${selectedId}&autoOpen=true`)}
                            >
                              打开对象
                            </Button>
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() => openOperationLogPage(item)}
                            >
                              日志中心
                            </Button>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed">
                      当前暂无相关操作轨迹
                    </Text>
                  )}
                </Paper>

                <Stack gap="xs">
                  <NumberInput
                    label="人工评分"
                    placeholder="请输入 0-100 的分值"
                    min={0}
                    max={100}
                    value={manualScore}
                    onChange={setManualScore}
                  />
                  <Textarea
                    label="整改意见 / 备注"
                    placeholder="请输入对该会话的改进建议..."
                    minRows={4}
                    value={opinion}
                    onChange={(e) => setOpinion(e.currentTarget.value)}
                  />
                </Stack>

                <Group grow mt="xl">
                  <Button
                    variant="light"
                    color="orange"
                    leftSection={<IconAlertCircle size={16} />}
                    onClick={() =>
                      updateMutation.mutate({
                        status: 3,
                        manualScore,
                        manualResult: opinion,
                      })
                    }
                  >
                    判定需整改
                  </Button>
                  <Button
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    onClick={() =>
                      updateMutation.mutate({
                        status: 2,
                        manualScore,
                        manualResult: opinion,
                      })
                    }
                  >
                    确认通过
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Modal>

        <Modal
          opened={batchReviewOpened}
          onClose={() => setBatchReviewOpened(false)}
          title={<Text fw={700}>批量人工复核</Text>}
          centered
          radius="md"
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              当前已选择 {selectedIds.length} 条质检记录，统一写入复核结论。
            </Text>
            <Select
              label="批量状态"
              value={batchStatus}
              onChange={setBatchStatus}
              data={[
                { label: "确认通过", value: "2" },
                { label: "判定需整改", value: "3" },
              ]}
            />
            <NumberInput
              label="人工评分"
              placeholder="请输入 0-100 的分值"
              min={0}
              max={100}
              value={manualScore}
              onChange={setManualScore}
            />
            <Textarea
              label="整改意见 / 备注"
              placeholder="请输入批量复核说明..."
              minRows={4}
              value={opinion}
              onChange={(e) => setOpinion(e.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setBatchReviewOpened(false)}>
                取消
              </Button>
              <Button
                color="green"
                loading={batchUpdateMutation.isPending}
                onClick={() => batchUpdateMutation.mutate()}
              >
                提交批量复核
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
