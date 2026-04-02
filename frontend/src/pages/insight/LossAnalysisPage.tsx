import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Group,
  Badge,
  Text,
  rem,
  UnstyledButton,
  Button,
  Tooltip,
  Grid,
  ThemeIcon,
  Modal,
  NumberInput,
  TextInput,
  Stack,
  Select,
  Divider,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconSettings, IconShoppingCartOff, IconInfoCircle, IconArrowRight, IconUsers, IconShoppingCart, IconCreditCard, IconFilter, IconEye, IconRefresh, IconChecklist } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { LineChart } from "../../components/ui/LineChart";
import { PieChart } from "../../components/ui/PieChart";
import { VirtualChatList } from "../../components/chat/VirtualChatList";
import { uiTokens } from "../../components/ui/uiTokens";
import type { ChatRecord as VirtualChatRecord } from "../../components/chat/VirtualChatList";
import { useSocket } from "../../hooks/useSocket";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import type { EChartsOption } from "echarts";

type PagedResult<T> = {
  list: T[];
  total: number;
  summary?: LossSummary;
};

type ChartSlice = {
  name: string;
  value: number;
};

type TrendPoint = {
  date: string;
  lost: number;
  retained: number;
};

type ShopRankingItem = {
  name: string;
  value: number;
};

type LossSummary = {
  consultCount: number;
  retainedCount: number;
  lostCount: number;
  lossRate: number;
};

type LossRule = {
  name?: string | null;
  waitMinutes?: number | null;
};

type QualityRuleOption = {
  id: string;
  name?: string | null;
  deptId?: string | null;
};

type OperationLogItem = {
  id: string;
  username?: string | null;
  operation?: string | null;
  actionKind?: string | null;
  targetType?: string | null;
  targetCount?: number | null;
  createTime?: string | null;
  params?: string | null;
};

type LossRecord = {
  id: string;
  sessionId: string;
  shopName?: string | null;
  productId?: string | null;
  reason?: string | null;
  reasonCategory?: string | null;
  isLost?: boolean;
  followUpStatus?: number | null;
  followUpStatusLabel?: string | null;
  followUpRemark?: string | null;
  followUpBy?: string | null;
  followUpTime?: string | null;
  qualityInspectionId?: string | null;
  qualityStatus?: number | null;
  qualityStatusLabel?: string | null;
  manualReviewNeeded?: boolean;
  qualitySummary?: string | null;
  waitMinutes?: number | null;
  sessionStartTime?: string | null;
  createTime?: string | null;
};

type LossStatsData = {
  trend?: TrendPoint[];
  reasonDistribution?: ChartSlice[];
  followUpDistribution?: ChartSlice[];
  shopRanking?: ShopRankingItem[];
};

type SessionInspection = {
  id?: string | null;
  status?: number | null;
};

type SessionShop = {
  name?: string | null;
};

type SessionDetail = {
  shop?: SessionShop | null;
  startTime?: string | null;
  records?: VirtualChatRecord[];
  inspection?: SessionInspection | null;
};

type ReanalyzeResult = {
  isLost?: boolean;
  reason?: string | null;
};

type FollowUpResult = {
  count?: number;
  followUpStatus?: number | null;
  followUpRemark?: string | null;
  followUpBy?: string | null;
  followUpTime?: string | null;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type TaskProgressEvent = {
  progress?: number;
};

type QualityStatusChangedEvent = {
  sessionId?: string;
  inspectionId?: string;
  status?: number;
  manualReviewNeeded?: boolean;
  qualitySummary?: string;
};

const resolveLossQualityLabel = (status?: number) => {
  if (status === 0) return "质检中";
  if (status === 1) return "待复核";
  if (status === 2) return "已复核";
  if (status === 3) return "需整改";
  if (status === 4) return "AI失败";
  return "暂无质检";
};

const resolveLossQualitySummary = (status?: number) => {
  if (status === 0) return "AI 质检进行中，稍后会自动回流结果";
  if (status === 1) return "已生成质检结果，建议进入人工复核";
  if (status === 2) return "AI 质检通过，可继续常规回访复盘";
  if (status === 3) return "检测到风险点，建议优先转整改或复核";
  if (status === 4) return "AI 分析失败，建议重试或人工查看";
  return "当前会话暂无质检结论";
};

const resolveLossQualityStatusColor = (status?: number | null) => {
  if (status === 0) return "grape";
  if (status === 1) return "blue";
  if (status === 2) return "green";
  if (status === 3) return "orange";
  if (status === 4) return "red";
  return "gray";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError | undefined)?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

export default function LossAnalysisPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState('7d');
  const [lossId] = useState(searchParams.get("lossId") || "");
  const [shopFilter, setShopFilter] = useState<string | null>(null);
  const [lossStatus, setLossStatus] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState<string | null>(null);
  const [followUpStatus, setFollowUpStatus] = useState<string | null>(null);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [myFollowUpOnly, setMyFollowUpOnly] = useState(false);
  const [manualReviewOnly, setManualReviewOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [sessionDetailOpened, setSessionDetailOpened] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedLossRecord, setSelectedLossRecord] = useState<LossRecord | null>(null);
  const [followUpOpened, setFollowUpOpened] = useState(false);
  const [followUpRemark, setFollowUpRemark] = useState("");
  const [followUpActionStatus, setFollowUpActionStatus] = useState<string | null>("1");
  const [auditOpened, setAuditOpened] = useState(false);
  const [auditRecord, setAuditRecord] = useState<LossRecord | null>(null);
  const [ruleOpened, setRuleOpened] = useState(false);
  const [ruleName, setRuleName] = useState("默认流失规则");
  const [waitMinutes, setWaitMinutes] = useState<number | string>(120);
  const [selectedQualityRuleId, setSelectedQualityRuleId] = useState<string | null>(null);
  const { permissions, roles, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { on } = useSocket();
  const canManageLossRule =
    roles.includes("SUPER_ADMIN") || permissions.includes("settings:loss_rule");
  const canReviewQuality =
    roles.includes("SUPER_ADMIN") || permissions.includes("quality:view");
  const lossAnalysisQueryKey = [
    "loss-analysis",
    page,
    dateRange,
    lossId,
    shopFilter,
    lossStatus,
    reasonFilter,
    followUpStatus,
    overdueOnly,
    myFollowUpOnly,
    manualReviewOnly,
  ];
  const lossStatsQueryKey = ["loss-analysis-stats", dateRange];

  const { data, isLoading } = useQuery<PagedResult<LossRecord>>({
    queryKey: lossAnalysisQueryKey,
    queryFn: async () => (await api.get("/ai/insight/loss", { 
      params: {
        id: lossId || undefined,
        page,
        pageSize: 10,
        dateRange,
        shopName: shopFilter || undefined,
        isLost: lossStatus === "lost" ? true : lossStatus === "retained" ? false : undefined,
        reasonKeyword: reasonFilter || undefined,
        followUpStatus: followUpStatus || undefined,
        overdueOnly: overdueOnly && (followUpStatus === "0" || !followUpStatus),
        myFollowUpOnly,
        manualReviewNeeded: manualReviewOnly || undefined,
      } 
    })).data,
    refetchInterval: (query) => {
      const currentList = query.state.data?.list || [];
      const hasRunningItem = currentList.some((item) => item.qualityStatus === 0);
      return hasRunningItem || selectedLossRecord?.qualityStatus === 0 ? 5000 : false;
    },
  });
  const { data: statsData, isLoading: statsLoading } = useQuery<LossStatsData>({
    queryKey: lossStatsQueryKey,
    queryFn: async () => (await api.get("/ai/insight/loss/stats", {
      params: { dateRange },
    })).data,
    refetchInterval: () => {
      const currentLossData = queryClient.getQueryData<PagedResult<LossRecord>>(lossAnalysisQueryKey);
      const hasRunningItem = currentLossData?.list?.some((item) => item.qualityStatus === 0);
      return hasRunningItem || selectedLossRecord?.qualityStatus === 0 ? 5000 : false;
    },
  });
  const { data: lossRule, isFetching: ruleLoading } = useQuery<LossRule>({
    queryKey: ["loss-rule"],
    queryFn: async () => (await api.get("/ai/insight/loss/rule")).data,
    enabled: canManageLossRule,
  });
  const { data: qualityRules = [] } = useQuery<QualityRuleOption[]>({
    queryKey: ["loss-page-quality-rules"],
    queryFn: async () => (await api.get("/quality/rules/active")).data,
    enabled: canReviewQuality,
  });
  const effectiveQualityRuleId = selectedQualityRuleId || qualityRules[0]?.id || null;
  const qualityRuleOptions = qualityRules.map((item) => ({
    value: item.id,
    label: item.name || item.id,
  }));
  const { data: sessionDetail, isFetching: sessionLoading } = useQuery<SessionDetail>({
    queryKey: ["loss-session-detail", selectedSessionId],
    queryFn: async () => (await api.get(`/chat/detail/${selectedSessionId}`)).data,
    enabled: !!selectedSessionId && sessionDetailOpened,
    refetchInterval: (query) => {
      const inspectionStatus = query.state.data?.inspection?.status;
      return selectedLossRecord?.qualityStatus === 0 || inspectionStatus === 0 ? 5000 : false;
    },
  });
  const { data: auditLogs, isFetching: auditLoading } = useQuery<OperationLogItem[]>({
    queryKey: ["loss-audit-logs", auditRecord?.id],
    queryFn: async () => (await api.get("/log/operation/list", {
      params: {
        page: 1,
        pageSize: 20,
        path: "/api/ai/insight/loss",
        paramsKeyword: auditRecord?.id,
      },
    })).data,
    enabled: !!auditRecord?.id && auditOpened,
  });
  const { data: relatedOperationLogs, isFetching: relatedOperationLoading } = useQuery<OperationLogItem[]>({
    queryKey: ["loss-related-logs", selectedLossRecord?.id],
    queryFn: async () =>
      (
        await api.get("/log/operation/list", {
          params: {
            page: 1,
            pageSize: 10,
            targetType: "LOSS_ANALYSIS",
            targetId: selectedLossRecord?.id,
          },
        })
      ).data,
    enabled: !!selectedLossRecord?.id && sessionDetailOpened,
  });
  const hasRunningQuality =
    Boolean(data?.list?.some((item) => item.qualityStatus === 0)) ||
    selectedLossRecord?.qualityStatus === 0 ||
    sessionDetail?.inspection?.status === 0;

  const saveRuleMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post("/ai/insight/loss/rule", {
          name: ruleName,
          waitMinutes: Number(waitMinutes || 120),
        })
      ).data,
    onSuccess: async () => {
      notifications.show({
        title: "规则已更新",
        message: "新的流失判定等待时长已生效",
        color: "green",
      });
      await queryClient.invalidateQueries({ queryKey: ["loss-rule"] });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis"] });
      setRuleOpened(false);
    },
    onError: () => {
      notifications.show({
        title: "保存失败",
        message: "请稍后重试，或检查当前账号是否具备规则配置权限",
        color: "red",
      });
    },
  });
  const reanalyzeMutation = useMutation({
    mutationFn: async (sessionId: string) =>
      (await api.get(`/ai/insight/loss/analyze/${sessionId}`)).data as ReanalyzeResult,
    onSuccess: async (result, sessionId) => {
      if (selectedSessionId === sessionId) {
        setSelectedLossRecord((prev) =>
          prev
            ? {
                ...prev,
                isLost: result?.isLost ?? prev.isLost,
                reason: result?.reason ?? prev.reason,
              }
            : prev,
        );
      }
      notifications.show({
        title: "已重新分析",
        message: "该会话的流失分析结果已刷新",
        color: "green",
      });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis"] });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis-stats"] });
    },
    onError: () => {
      notifications.show({
        title: "分析失败",
        message: "请稍后重试",
        color: "red",
      });
    },
  });
  const followUpMutation = useMutation({
    mutationFn: async () =>
      (
        await api.put(`/ai/insight/loss/${selectedLossRecord?.id}/follow-up`, {
          followUpStatus: Number(followUpActionStatus || 1),
          followUpRemark,
        })
      ).data as FollowUpResult,
    onSuccess: async (result) => {
      setSelectedLossRecord((prev) =>
        prev
          ? {
              ...prev,
              followUpStatus: result.followUpStatus,
              followUpStatusLabel:
                result.followUpStatus === 1
                  ? "人工跟进中"
                  : result.followUpStatus === 2
                    ? "已回访"
                    : result.followUpStatus === 3
                      ? "暂不处理"
                      : "待跟进",
              followUpRemark: result.followUpRemark,
              followUpBy: result.followUpBy,
              followUpTime: result.followUpTime,
            }
          : prev,
      );
      notifications.show({
        title: "跟进状态已更新",
        message: "流失记录处置结果已保存",
        color: "green",
      });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis"] });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis-stats"] });
      setFollowUpOpened(false);
      setFollowUpRemark("");
      setFollowUpActionStatus("1");
    },
    onError: () => {
      notifications.show({
        title: "保存失败",
        message: "请稍后重试",
        color: "red",
      });
    },
  });
  const batchFollowUpMutation = useMutation({
    mutationFn: async () =>
      (
        await api.put(`/ai/insight/loss/batch-follow-up`, {
          ids: selectedIds,
          followUpStatus: Number(followUpActionStatus || 1),
          followUpRemark,
        })
      ).data as FollowUpResult,
    onSuccess: async (result) => {
      notifications.show({
        title: "批量处置完成",
        message: `已更新 ${result?.count || selectedIds.length} 条流失记录`,
        color: "green",
      });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis"] });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis-stats"] });
      setSelectedIds([]);
      setFollowUpOpened(false);
      setSelectedLossRecord(null);
      setFollowUpRemark("");
      setFollowUpActionStatus("1");
    },
    onError: () => {
      notifications.show({
        title: "批量更新失败",
        message: "请稍后重试",
        color: "red",
      });
    },
  });
  const startQualityMutation = useMutation({
    mutationFn: async (sessionId: string) =>
      (
        await api.post("/quality/batch", {
          sessionIds: [sessionId],
          ruleId: effectiveQualityRuleId,
        })
      ).data,
    onSuccess: async (_result, sessionId) => {
      setSelectedLossRecord((prev) =>
        prev && prev.sessionId === sessionId
          ? {
              ...prev,
              qualityStatus: 0,
              qualityStatusLabel: "质检中",
            }
          : prev,
      );
      notifications.show({
        title: "已发起质检",
        message: "系统正在为该会话生成质检结果，请稍后查看",
        color: "blue",
      });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis"] });
      await queryClient.invalidateQueries({ queryKey: ["loss-analysis-stats"] });
      navigate(`/quality?sessionId=${sessionId}&autoOpen=true`);
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "发起失败",
        message: getErrorMessage(error, "当前无法发起质检，请稍后重试"),
        color: "red",
      });
    },
  });

  useEffect(() => {
    const cleanup = on("quality_status_changed", (event) => {
      const payload = (event ?? {}) as QualityStatusChangedEvent;
      if (!payload?.sessionId) {
        return;
      }

      queryClient.setQueriesData<PagedResult<LossRecord>>({ queryKey: ["loss-analysis"] }, (previous) => {
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
            qualityInspectionId: payload.inspectionId,
            qualityStatus: payload.status,
            qualityStatusLabel: resolveLossQualityLabel(payload.status),
            manualReviewNeeded: payload.manualReviewNeeded ?? item.manualReviewNeeded,
            qualitySummary: payload.qualitySummary ?? item.qualitySummary,
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
        setSelectedLossRecord((prev) =>
          prev
            ? {
                ...prev,
                qualityInspectionId: payload.inspectionId,
                qualityStatus: payload.status,
                qualityStatusLabel: resolveLossQualityLabel(payload.status),
                manualReviewNeeded: payload.manualReviewNeeded ?? prev.manualReviewNeeded,
                qualitySummary: payload.qualitySummary ?? prev.qualitySummary,
              }
            : prev,
        );

        queryClient.setQueryData<SessionDetail>(["loss-session-detail", selectedSessionId], (previous) =>
          previous
            ? {
                ...previous,
                inspection: previous.inspection
                  ? {
                      ...previous.inspection,
                      id: payload.inspectionId ?? previous.inspection.id,
                      status: payload.status,
                    }
                  : {
                      id: payload.inspectionId,
                      status: payload.status,
                    },
              }
            : previous,
        );
      }

      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      if (selectedSessionId === payload.sessionId) {
        queryClient.invalidateQueries({ queryKey: ["loss-session-detail", selectedSessionId] });
      }
    });

    return cleanup;
  }, [on, queryClient, selectedSessionId]);

  useEffect(() => {
    const cleanup = on("task_progress", (event) => {
      const payload = (event ?? {}) as TaskProgressEvent;
      if (!hasRunningQuality && payload?.progress !== 100) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["loss-analysis"] });
      queryClient.invalidateQueries({ queryKey: ["loss-analysis-stats"] });
      if (selectedSessionId) {
        queryClient.invalidateQueries({ queryKey: ["loss-session-detail", selectedSessionId] });
      }
    });

    return cleanup;
  }, [hasRunningQuality, on, queryClient, selectedSessionId]);

  const openRuleModal = () => {
    const currentRule = lossRule || {
      name: "默认流失规则",
      waitMinutes: 120,
    };
    setRuleName(currentRule.name || "默认流失规则");
    setWaitMinutes(currentRule.waitMinutes || 120);
    setRuleOpened(true);
  };
  function openSessionDetail(item: LossRecord) {
    setSelectedLossRecord(item);
    setSelectedSessionId(item.sessionId);
    setSessionDetailOpened(true);
  }
  const openFollowUpModal = (item: LossRecord) => {
    setSelectedLossRecord(item);
    setFollowUpActionStatus(String(item.followUpStatus ?? 1));
    setFollowUpRemark(item.followUpRemark || "");
    setFollowUpOpened(true);
  };
  const openBatchFollowUpModal = () => {
    setSelectedLossRecord(null);
    setFollowUpActionStatus("1");
    setFollowUpRemark("");
    setFollowUpOpened(true);
  };
  const openAuditModal = (item: LossRecord) => {
    setAuditRecord(item);
    setAuditOpened(true);
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
  const customerMessageCount = (sessionDetail?.records || []).filter((item) => item.senderType === "CUSTOMER").length;
  const agentMessageCount = (sessionDetail?.records || []).filter((item) => item.senderType === "AGENT").length;
  const lastRecord = sessionDetail?.records?.[sessionDetail.records.length - 1];
  const [clockSnapshot] = useState(() => Date.now());
  const inactiveMinutes = lastRecord
    ? Math.max(0, Math.floor((clockSnapshot - new Date(lastRecord.sendTime).getTime()) / 60000))
    : null;
  const funnelStats = data?.summary || {
    consultCount: 0,
    retainedCount: 0,
    lostCount: 0,
    lossRate: 0,
  };
  const shopRanking = statsData?.shopRanking || [];
  const lossTrendOption: EChartsOption = {
    xAxis: {
      type: "category",
      data: statsData?.trend?.map((item) => item.date) || [],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "确认流失",
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.12 },
        data: statsData?.trend?.map((item) => item.lost) || [],
      },
      {
        name: "仍在跟进",
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.08 },
        data: statsData?.trend?.map((item) => item.retained) || [],
      },
    ],
  };
  const lossReasonOption: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      left: "center",
    },
    series: [
      {
        name: "流失原因",
        type: "pie",
        radius: ["42%", "72%"],
        avoidLabelOverlap: true,
        label: {
          formatter: "{b}\n{d}%",
        },
        data: statsData?.reasonDistribution || [],
      },
    ],
  };
  const followUpOption: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      left: "center",
    },
    series: [
      {
        name: "跟进状态",
        type: "pie",
        radius: ["42%", "72%"],
        label: {
          formatter: "{b}\n{d}%",
        },
        data: statsData?.followUpDistribution || [],
      },
    ],
  };

  useEffect(() => {
    const autoOpen = searchParams.get("autoOpen") === "true";
    if (!autoOpen || sessionDetailOpened || !data?.list?.length) {
      return;
    }

    const matched = data.list.find((item) => lossId && item.id === lossId);
    if (!matched) {
      return;
    }

    const timer = window.setTimeout(() => {
      openSessionDetail(matched);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("autoOpen");
        return next;
      }, { replace: true });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [data, lossId, searchParams, sessionDetailOpened, setSearchParams]);
  const renderAuditParams = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const statusMap: Record<string, string> = {
        "0": "待跟进",
        "1": "人工跟进中",
        "2": "已回访",
        "3": "暂不处理",
      };
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${key === "followUpStatus" ? (statusMap[String(value)] || value) : String(value)}`)
        .join(" | ");
    } catch {
      return raw;
    }
  };
  const resolveActionKindLabel = (value?: string | null) => {
    if (!value) return "常规动作";
    if (value === "LOSS_BATCH_FOLLOW_UP") return "批量跟进";
    if (value === "LOSS_FOLLOW_UP") return "单条跟进";
    if (value === "QUALITY_BATCH_REVIEW") return "批量复核";
    if (value === "QUALITY_REVIEW") return "人工复核";
    if (value === "QUALITY_BATCH_START") return "批量发起质检";
    if (value === "QUALITY_RETRY") return "重试质检";
    return value;
  };
  const resolveTargetTypeLabel = (value?: string | null) => {
    if (!value) return "通用对象";
    if (value === "LOSS_ANALYSIS") return "流失记录";
    if (value === "QUALITY_INSPECTION") return "质检记录";
    if (value === "CHAT_SESSION") return "会话";
    if (value === "VIOLATION_ALERT") return "违规记录";
    return value;
  };
  const openOperationLogPage = (item: OperationLogItem) => {
    const params = new URLSearchParams();
    if (item?.actionKind) params.set("actionKind", item.actionKind);
    if (item?.targetType) params.set("targetType", item.targetType);
    navigate(`/log/operation?${params.toString()}`);
  };

  const columns = [
    {
      key: 'shopName',
      title: '店铺',
      render: (item: LossRecord) => (
        <Badge
          color="blue"
          variant="light"
          style={{ cursor: item.shopName ? "pointer" : "default" }}
          onClick={() => {
            if (!item.shopName) return;
            setShopFilter(item.shopName);
            setPage(1);
          }}
        >
          {item.shopName || '未识别店铺'}
        </Badge>
      )
    },
    { 
      key: 'sessionId', 
      title: '会话ID', 
      render: (item: LossRecord) => <Text size="sm" fw={700} c="green.9">{item.sessionId}</Text> 
    },
    { 
      key: 'product', 
      title: '意向商品', 
      render: (item: LossRecord) => <Text size="sm">{item.productId || '未知商品'}</Text> 
    },
    { 
      key: 'reason', 
      title: '流失成因诊断 (AI)', 
      render: (item: LossRecord) => (
        <Group gap="xs">
          <Badge
            color={item.isLost ? "orange" : "green"}
            variant="outline"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setReasonFilter(item.reasonCategory || '沟通中断');
              setPage(1);
            }}
          >
            {item.reason || '待分析'}
          </Badge>
          <Tooltip label="AI 基于聊天上下文自动总结">
            <IconInfoCircle size={14} color="gray" />
          </Tooltip>
        </Group>
      )
    },
    { 
      key: 'isLost', 
      title: '判定状态',
      render: (item: LossRecord) => (
        <Badge
          color={item.isLost ? "orange" : "green"}
          variant="light"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setLossStatus(item.isLost ? "lost" : "retained");
            setPage(1);
          }}
        >
          {item.isLost ? "确认流失" : "仍在跟进"}
        </Badge>
      ),
    },
    {
      key: 'followUpStatus',
      title: '跟进状态',
      render: (item: LossRecord) => (
        <Badge
          color={
            item.followUpStatus === 1
              ? "blue"
              : item.followUpStatus === 2
                ? "green"
                : item.followUpStatus === 3
                  ? "gray"
                  : "orange"
          }
          variant="light"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setFollowUpStatus(String(item.followUpStatus ?? 0));
            setPage(1);
          }}
        >
          {item.followUpStatusLabel || "待跟进"}
        </Badge>
      ),
    },
    {
      key: 'qualityStatus',
      title: '质检状态',
      render: (item: LossRecord) => (
        <Badge color={resolveLossQualityStatusColor(item.qualityStatus)} variant="light">
          {item.qualityStatusLabel || "暂无质检"}
        </Badge>
      ),
    },
    {
      key: 'qualitySummary',
      title: '处置建议',
      render: (item: LossRecord) => (
        <Stack gap={4}>
          <Badge color={item.manualReviewNeeded ? "orange" : "green"} variant="light" w="fit-content">
            {item.manualReviewNeeded ? "建议复核" : "继续跟进"}
          </Badge>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {item.qualitySummary || resolveLossQualitySummary(item.qualityStatus ?? undefined)}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'waitMinutes',
      title: '规则阈值',
      render: (item: LossRecord) => (
        <Text size="sm" c="dimmed">
          {item.waitMinutes ? `${item.waitMinutes} 分钟` : '--'}
        </Text>
      ),
    },
    { 
      key: 'createTime', 
      title: '咨询时间', 
      render: (item: LossRecord) => {
        const consultTime = item.sessionStartTime || item.createTime;
        return <Text size="xs" c="dimmed">{consultTime ? new Date(consultTime).toLocaleString() : "--"}</Text>;
      }
    },
    {
      key: 'actions',
      title: '操作',
      render: (item: LossRecord) => (
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="light"
            color="blue"
            leftSection={<IconEye size={14} />}
            onClick={() => openSessionDetail(item)}
          >
            查看会话
          </Button>
          <Button
            size="xs"
            variant="light"
            color="orange"
            leftSection={<IconChecklist size={14} />}
            onClick={() => openFollowUpModal(item)}
          >
            跟进处置
          </Button>
          <Button
            size="xs"
            variant="default"
            onClick={() => openAuditModal(item)}
          >
            处置轨迹
          </Button>
          <Button
            size="xs"
            variant="light"
            color="green"
            loading={reanalyzeMutation.isPending}
            leftSection={<IconRefresh size={14} />}
            onClick={() => reanalyzeMutation.mutate(item.sessionId)}
          >
            重新分析
          </Button>
        </Group>
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

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="询单流失分析"
          description="通过关联订单状态，自动识别咨询后未转化的潜在流失会话"
          rightSection={
            <Button
              leftSection={<IconSettings size={18} />}
              variant="light"
              color="slate"
              disabled={!canManageLossRule}
              loading={ruleLoading}
              onClick={openRuleModal}
            >
              流失判定规则
            </Button>
          }
        />

        <SpotlightCard>
          <Grid align="center" gutter="xl" my="xs">
            <Grid.Col span={3}>
              <Group>
                <ThemeIcon size={48} radius="md" color="blue" variant="light">
                  <IconUsers size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={700}>咨询会话数</Text>
                  <Text size="xl" fw={900}>{funnelStats.consultCount}</Text>
                </Box>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={1} style={{ display: 'flex', justifyContent: 'center' }}>
              <IconArrowRight size={24} color={uiTokens.colors.textMuted} />
            </Grid.Col>

            <Grid.Col span={3}>
              <Group>
                <ThemeIcon size={48} radius="md" color="orange" variant="light">
                  <IconShoppingCart size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={700}>仍在跟进</Text>
                  <Text size="xl" fw={900}>{funnelStats.retainedCount}</Text>
                </Box>
              </Group>
            </Grid.Col>

            <Grid.Col span={1} style={{ display: 'flex', justifyContent: 'center' }}>
              <IconArrowRight size={24} color={uiTokens.colors.textMuted} />
            </Grid.Col>

            <Grid.Col span={3}>
              <Group>
                <ThemeIcon size={48} radius="md" color="green" variant="light">
                  <IconCreditCard size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={700}>确认流失</Text>
                  <Text size="xl" fw={900}>{funnelStats.lostCount}</Text>
                </Box>
              </Group>
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="sm">
            <Badge color="orange" variant="light">
              流失率 {funnelStats.lossRate}%
            </Badge>
          </Group>
        </SpotlightCard>

        {canManageLossRule && lossRule && (
          <Card withBorder radius="md" mt="md" shadow="sm">
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text fw={800} c="green.9">当前流失规则摘要</Text>
                <Text size="sm" c="dimmed">
                  当前平台正在使用规则“{lossRule.name || '默认流失规则'}”，等待阈值为 {lossRule.waitMinutes || 120} 分钟
                </Text>
              </Box>
              <Badge color="green" variant="light">
                生效中
              </Badge>
            </Group>
          </Card>
        )}

        <Card withBorder radius="md" mt="md">
          <Group mb="md" justify="space-between" align="flex-start">
            <Group gap="sm" align="center">
              <ThemeIcon color="green" variant="light" radius="md">
                <IconFilter size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700}>流失筛选</Text>
                <Text size="sm" c="dimmed">按状态、原因、店铺快速钻取明细</Text>
              </Box>
            </Group>
            <Group gap="sm" wrap="nowrap">
              {shopFilter && (
                <Badge
                  color="blue"
                  variant="light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShopFilter(null);
                    setPage(1);
                  }}
                >
                  店铺筛选: {shopFilter} x
                </Badge>
              )}
              {lossStatus && (
                <Badge
                  color={lossStatus === "lost" ? "orange" : "green"}
                  variant="light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setLossStatus(null);
                    setPage(1);
                  }}
                >
                  状态筛选: {lossStatus === "lost" ? "确认流失" : "仍在跟进"} x
                </Badge>
              )}
              {reasonFilter && (
                <Badge
                  color="grape"
                  variant="light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setReasonFilter(null);
                    setPage(1);
                  }}
                >
                  原因筛选: {reasonFilter} x
                </Badge>
              )}
              {followUpStatus && (
                <Badge
                  color="blue"
                  variant="light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setFollowUpStatus(null);
                    setPage(1);
                  }}
                >
                  跟进筛选: {followUpStatus === "1" ? "人工跟进中" : followUpStatus === "2" ? "已回访" : followUpStatus === "3" ? "暂不处理" : "待跟进"} x
                </Badge>
              )}
              {overdueOnly && (
                <Badge
                  color="orange"
                  variant="light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOverdueOnly(false);
                    setPage(1);
                  }}
                >
                  超时未跟进 x
                </Badge>
              )}
              {myFollowUpOnly && (
                <Badge
                  color="green"
                  variant="light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setMyFollowUpOnly(false);
                    setPage(1);
                  }}
                >
                  只看我跟进的 x
                </Badge>
              )}
              {manualReviewOnly && (
                <Badge
                  color="orange"
                  variant="light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setManualReviewOnly(false);
                    setPage(1);
                  }}
                >
                  建议人工复核 x
                </Badge>
              )}
              <Group gap={0} wrap="nowrap">
              <UnstyledButton 
                style={{ ...dateBtnStyle, borderRadius: `${rem(6)} 0 0 ${rem(6)}`, background: dateRange === 'today' ? uiTokens.background.navItemActive : uiTokens.colors.panel }}
                onClick={() => setDateRange('today')}
              >今天</UnstyledButton>
              <UnstyledButton 
                style={{ ...dateBtnStyle, borderLeft: 0, borderRight: 0, background: dateRange === '7d' ? uiTokens.background.navItemActive : uiTokens.colors.panel }}
                onClick={() => setDateRange('7d')}
              >近7天</UnstyledButton>
              <UnstyledButton 
                style={{ ...dateBtnStyle, borderRadius: `0 ${rem(6)} ${rem(6)} 0`, background: dateRange === '30d' ? uiTokens.background.navItemActive : uiTokens.colors.panel }}
                onClick={() => setDateRange('30d')}
              >近30天</UnstyledButton>
              </Group>
            </Group>
          </Group>

          {selectedIds.length > 0 && (
            <Group mb="md" justify="space-between">
              <Badge color="orange" variant="light">
                已选择 {selectedIds.length} 条流失记录
              </Badge>
              <Button size="xs" color="orange" variant="light" onClick={openBatchFollowUpModal}>
                批量跟进处置
              </Button>
            </Group>
          )}

          <Group mb="md" grow>
            <Select
              label="判定状态"
              placeholder="全部状态"
              clearable
              value={lossStatus}
              onChange={(value) => {
                setLossStatus(value);
                setPage(1);
              }}
              data={[
                { label: "确认流失", value: "lost" },
                { label: "仍在跟进", value: "retained" },
              ]}
            />
            <Select
              label="流失原因"
              placeholder="全部原因"
              clearable
              value={reasonFilter}
              onChange={(value) => {
                setReasonFilter(value);
                setPage(1);
              }}
              data={(statsData?.reasonDistribution || []).map((item) => ({
                label: `${item.name} (${item.value})`,
                value: item.name,
              }))}
            />
            <Select
              label="跟进状态"
              placeholder="全部状态"
              clearable
              value={followUpStatus}
              onChange={(value) => {
                setFollowUpStatus(value);
                setPage(1);
              }}
              data={[
                { label: "待跟进", value: "0" },
                { label: "人工跟进中", value: "1" },
                { label: "已回访", value: "2" },
                { label: "暂不处理", value: "3" },
              ]}
            />
            <Select
              label="质检建议"
              placeholder="全部建议"
              clearable
              value={manualReviewOnly ? "review" : null}
              onChange={(value) => {
                setManualReviewOnly(value === "review");
                setPage(1);
              }}
              data={[{ label: "建议人工复核", value: "review" }]}
            />
          </Group>

          <Group mb="md" gap="sm">
            <Badge
              color={followUpStatus === "0" ? "orange" : "gray"}
              variant={followUpStatus === "0" ? "filled" : "light"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setFollowUpStatus(followUpStatus === "0" ? null : "0");
                setPage(1);
              }}
            >
              只看待跟进
            </Badge>
            <Badge
              color={overdueOnly ? "red" : "gray"}
              variant={overdueOnly ? "filled" : "light"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setFollowUpStatus("0");
                setOverdueOnly((prev) => !prev);
                setPage(1);
              }}
            >
              超 24h 未跟进
            </Badge>
            <Badge
              color={myFollowUpOnly ? "green" : "gray"}
              variant={myFollowUpOnly ? "filled" : "light"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setMyFollowUpOnly((prev) => !prev);
                setPage(1);
              }}
            >
              只看我跟进的
            </Badge>
            <Badge
              color={manualReviewOnly ? "orange" : "gray"}
              variant={manualReviewOnly ? "filled" : "light"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setManualReviewOnly((prev) => !prev);
                setPage(1);
              }}
            >
              建议人工复核
            </Badge>
          </Group>

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
            emptyIcon={IconShoppingCartOff}
            emptyTitle="暂无流失记录分析"
          />
        </Card>

        <Grid mt="md" gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="md" shadow="sm">
              <Group justify="space-between" mb="md">
                <Box>
                  <Text fw={800} c="green.9">流失趋势</Text>
                  <Text size="sm" c="dimmed">按时间观察流失与跟进变化</Text>
                </Box>
                <Badge color="orange" variant="light">
                  近 {dateRange === "30d" ? "30" : dateRange === "today" ? "1" : "7"} 天
                </Badge>
              </Group>
              <LineChart option={lossTrendOption} height={320} loading={statsLoading} />
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" shadow="sm">
              <Text fw={800} c="green.9">流失原因分布</Text>
              <Text size="sm" c="dimmed" mb="md">帮助判断是响应问题还是转化问题</Text>
              <PieChart option={lossReasonOption} height={320} loading={statsLoading} />
              <Stack gap="xs" mt="md">
                {(statsData?.reasonDistribution || []).slice(0, 5).map((item) => (
                  <Group
                    key={item.name}
                    justify="space-between"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setReasonFilter(item.name);
                      setPage(1);
                    }}
                  >
                    <Group gap="xs">
                      <Badge color="grape" variant="light">{item.name}</Badge>
                    </Group>
                    <Text size="sm" fw={700}>{item.value}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid mt="md" gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" shadow="sm">
              <Text fw={800} c="green.9">跟进状态分布</Text>
              <Text size="sm" c="dimmed" mb="md">查看流失线索当前的处置进度</Text>
              <PieChart option={followUpOption} height={300} loading={statsLoading} />
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder radius="md" shadow="sm" mt="md">
          <Group justify="space-between" mb="md">
            <Box>
              <Text fw={800} c="green.9">店铺流失排行</Text>
              <Text size="sm" c="dimmed">优先排查流失量较高的店铺接待与转化策略</Text>
            </Box>
            <Badge color="blue" variant="light">
              Top 5
            </Badge>
          </Group>

          <Stack gap="sm">
            {shopRanking.length > 0 ? (
              shopRanking.map((item, index: number) => (
                <Group
                  key={item.name}
                  justify="space-between"
                  wrap="nowrap"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShopFilter(item.name);
                    setPage(1);
                  }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Badge
                      color={index < 3 ? "orange" : "gray"}
                      variant={index < 3 ? "filled" : "light"}
                    >
                      #{index + 1}
                    </Badge>
                    <Text fw={600}>{item.name}</Text>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm" c="dimmed">流失会话</Text>
                    <Text fw={800} c="orange.7">{item.value}</Text>
                  </Group>
                </Group>
              ))
            ) : (
              <Text size="sm" c="dimmed">当前时间范围内暂无可排行店铺</Text>
            )}
          </Stack>
        </Card>

        <Modal
          opened={sessionDetailOpened}
          onClose={() => setSessionDetailOpened(false)}
          title={<Text fw={700}>会话详情与流失复盘</Text>}
          size="xl"
          centered
          radius="md"
        >
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text fw={700}>会话 ID</Text>
                <Text size="sm" c="dimmed">{selectedSessionId || "--"}</Text>
              </Box>
              <Button
                size="xs"
                variant="light"
                color="green"
                loading={reanalyzeMutation.isPending}
                leftSection={<IconRefresh size={14} />}
                onClick={() => selectedSessionId && reanalyzeMutation.mutate(selectedSessionId)}
              >
                刷新分析
              </Button>
            </Group>
            <Divider />
            {sessionLoading ? (
              <Text size="sm" c="dimmed">正在加载会话详情...</Text>
            ) : sessionDetail ? (
              <Stack gap="md">
                <Group gap="sm">
                  <Badge color={selectedLossRecord?.isLost ? "orange" : "green"} variant="light">
                    {selectedLossRecord?.isLost ? "确认流失" : "仍在跟进"}
                  </Badge>
                  <Badge color="grape" variant="light">
                    {selectedLossRecord?.reason || "待分析"}
                  </Badge>
                  <Badge color="blue" variant="light">
                    {selectedLossRecord?.followUpStatusLabel || "待跟进"}
                  </Badge>
                  <Badge color={resolveLossQualityStatusColor(selectedLossRecord?.qualityStatus ?? sessionDetail?.inspection?.status)} variant="light">
                    {selectedLossRecord?.qualityStatusLabel || (sessionDetail?.inspection?.status === 1
                      ? "待复核"
                      : sessionDetail?.inspection?.status === 2
                        ? "已复核"
                        : sessionDetail?.inspection?.status === 3
                          ? "需整改"
                          : sessionDetail?.inspection?.status === 4
                            ? "AI失败"
                            : "暂无质检")}
                  </Badge>
                  {(selectedLossRecord?.manualReviewNeeded ||
                    [1, 3, 4].includes((selectedLossRecord?.qualityStatus ?? sessionDetail?.inspection?.status) ?? -1)) && (
                    <Badge color="orange" variant="outline">
                      建议人工复核
                    </Badge>
                  )}
                  {selectedLossRecord?.waitMinutes && (
                    <Badge color="gray" variant="outline">
                      阈值 {selectedLossRecord.waitMinutes} 分钟
                    </Badge>
                  )}
                </Group>
                <Group gap="xl" align="flex-start">
                  <Box>
                    <Text size="sm" fw={700}>店铺</Text>
                    <Text size="sm" c="dimmed">{sessionDetail.shop?.name || "未识别店铺"}</Text>
                  </Box>
                  <Box>
                    <Text size="sm" fw={700}>开始时间</Text>
                    <Text size="sm" c="dimmed">
                      {sessionDetail.startTime ? new Date(sessionDetail.startTime).toLocaleString() : "--"}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" fw={700}>消息数</Text>
                    <Text size="sm" c="dimmed">{sessionDetail.records?.length || 0}</Text>
                  </Box>
                  <Box>
                    <Text size="sm" fw={700}>客户消息</Text>
                    <Text size="sm" c="dimmed">{customerMessageCount}</Text>
                  </Box>
                  <Box>
                    <Text size="sm" fw={700}>客服消息</Text>
                    <Text size="sm" c="dimmed">{agentMessageCount}</Text>
                  </Box>
                </Group>
                <Card withBorder radius="md" p="md" bg="gray.0">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Box>
                      <Text size="sm" fw={700}>复盘提示</Text>
                      <Text size="sm" c="dimmed">
                        {selectedLossRecord?.reason || "当前尚无 AI 流失总结"}
                      </Text>
                      <Text size="sm" c="orange.8" mt="xs" fw={600}>
                        {selectedLossRecord?.qualitySummary ||
                          resolveLossQualitySummary((selectedLossRecord?.qualityStatus ?? sessionDetail?.inspection?.status) ?? undefined)}
                      </Text>
                    </Box>
                    <Stack gap={4} align="flex-end">
                      <Text size="xs" c="dimmed">最后发言方</Text>
                      <Badge color={lastRecord?.senderType === "AGENT" ? "green" : "blue"} variant="light">
                        {lastRecord?.senderType === "AGENT"
                          ? "客服"
                          : lastRecord?.senderType === "CUSTOMER"
                            ? "客户"
                            : "未知"}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {inactiveMinutes === null ? "暂无停滞数据" : `已停滞约 ${inactiveMinutes} 分钟`}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
                <Card withBorder radius="md" p="md">
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text size="sm" fw={700}>处置记录</Text>
                      <Text size="sm" c="dimmed">
                        {selectedLossRecord?.followUpRemark || "当前暂无处置备注"}
                      </Text>
                    </Box>
                    <Stack gap={4} align="flex-end">
                      <Text size="xs" c="dimmed">
                        {selectedLossRecord?.followUpBy || "未指派"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {selectedLossRecord?.followUpTime
                          ? new Date(selectedLossRecord.followUpTime).toLocaleString()
                          : "未记录时间"}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
                <Card withBorder radius="md" p="md">
                  <Text size="sm" fw={700} mb="sm">
                    最近相关操作
                  </Text>
                  {relatedOperationLoading ? (
                    <Text size="sm" c="dimmed">
                      正在加载操作轨迹...
                    </Text>
                  ) : (relatedOperationLogs?.length || 0) > 0 ? (
                    <Stack gap="sm">
                      {(relatedOperationLogs || []).map((log) => (
                        <Card key={log.id} withBorder radius="md" p="sm">
                          <Group justify="space-between" align="flex-start">
                            <Box>
                              <Text size="sm" fw={600}>{log.operation}</Text>
                              <Group gap="xs" mt={6}>
                                <Badge size="xs" color="green" variant="light">
                                  {resolveActionKindLabel(log.actionKind)}
                                </Badge>
                                <Badge size="xs" color="gray" variant="outline">
                                  {resolveTargetTypeLabel(log.targetType)}
                                </Badge>
                                {!!log.targetCount && log.targetCount > 1 && (
                                  <Badge size="xs" color="orange" variant="light">
                                    {log.targetCount} 条
                                  </Badge>
                                )}
                              </Group>
                            </Box>
                            <Text size="xs" c="dimmed">
                              {log.createTime ? new Date(log.createTime).toLocaleString() : "--"}
                            </Text>
                          </Group>
                          <Group gap="xs" mt="sm">
                            <Button
                              size="xs"
                              variant="light"
                              color="green"
                              onClick={() => navigate(`/insight/loss?lossId=${selectedLossRecord?.id}&autoOpen=true`)}
                            >
                              打开对象
                            </Button>
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() => openOperationLogPage(log)}
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
                </Card>
                {selectedLossRecord?.followUpStatus === 2 && (
                  <Card withBorder radius="md" p="md" bg="green.0">
                    <Group justify="space-between" align="center">
                      <Box>
                        <Text size="sm" fw={700}>回访后建议</Text>
                        <Text size="sm" c="dimmed">
                          {selectedLossRecord?.qualityInspectionId || sessionDetail?.inspection?.id
                            ? "该记录已标记为已回访，可以继续进入质检复核或客服复盘流程。"
                            : "该记录已标记为已回访，但当前会话还没有质检记录，建议先在质检工作台发起质检。"}
                        </Text>
                      </Box>
                      <Badge color="green" variant="light">
                        {user?.username || "当前账号"} 已回访
                      </Badge>
                    </Group>
                    <Group gap="sm" mt="md">
                      <Badge color={resolveLossQualityStatusColor(selectedLossRecord?.qualityStatus ?? sessionDetail?.inspection?.status)} variant="light">
                        {selectedLossRecord?.qualityStatusLabel || (sessionDetail?.inspection?.id ? "已有质检记录" : "未生成质检记录")}
                      </Badge>
                    </Group>
                    {canReviewQuality && (
                      <Group justify="flex-end" mt="md">
                        {selectedLossRecord?.qualityInspectionId || sessionDetail?.inspection?.id ? (
                          <Button
                            size="xs"
                            color="green"
                            variant="light"
                            onClick={() => {
                              if (!selectedSessionId) return;
                              navigate(`/quality?sessionId=${selectedSessionId}&autoOpen=true`);
                            }}
                          >
                            打开质检复核
                          </Button>
                        ) : (
                          <Group gap="sm">
                            <Select
                              size="xs"
                              placeholder="选择质检规则"
                              data={qualityRuleOptions}
                              value={effectiveQualityRuleId}
                              onChange={setSelectedQualityRuleId}
                              w={220}
                              searchable
                            />
                            <Button
                              size="xs"
                              color="blue"
                              variant="light"
                              disabled={!effectiveQualityRuleId}
                              loading={startQualityMutation.isPending}
                              onClick={() => {
                                if (!selectedSessionId || !effectiveQualityRuleId) return;
                                startQualityMutation.mutate(selectedSessionId);
                              }}
                            >
                              一键发起质检
                            </Button>
                          </Group>
                        )}
                      </Group>
                    )}
                  </Card>
                )}
                <VirtualChatList records={sessionDetail.records || []} />
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">暂无会话详情</Text>
            )}
          </Stack>
        </Modal>

        <Modal
          opened={followUpOpened}
          onClose={() => setFollowUpOpened(false)}
          title={<Text fw={700}>{selectedLossRecord ? "流失跟进处置" : `批量跟进处置：已选择 ${selectedIds.length} 条`}</Text>}
          centered
          radius="md"
        >
          <Stack gap="md">
            <Select
              label="处置状态"
              value={followUpActionStatus}
              onChange={setFollowUpActionStatus}
              data={[
                { label: "人工跟进中", value: "1" },
                { label: "已回访", value: "2" },
                { label: "暂不处理", value: "3" },
              ]}
            />
            <Textarea
              label="处置备注"
              minRows={3}
              value={followUpRemark}
              onChange={(event) => setFollowUpRemark(event.currentTarget.value)}
              placeholder="记录当前跟进动作、客户反馈或后续安排"
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setFollowUpOpened(false)}>
                取消
              </Button>
              <Button
                color="orange"
                loading={followUpMutation.isPending || batchFollowUpMutation.isPending}
                onClick={() => {
                  if (selectedLossRecord) {
                    followUpMutation.mutate();
                    return;
                  }
                  batchFollowUpMutation.mutate();
                }}
              >
                保存处置
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={auditOpened}
          onClose={() => setAuditOpened(false)}
          title={<Text fw={700}>流失处置轨迹</Text>}
          centered
          radius="md"
          size="lg"
        >
          <Stack gap="md">
            {auditLoading ? (
              <Text size="sm" c="dimmed">正在加载处置轨迹...</Text>
            ) : (auditLogs || []).length > 0 ? (
              (auditLogs || []).map((log) => (
                <Group key={log.id} align="flex-start" wrap="nowrap">
                  <Box mt={6} style={{ width: 10, height: 10, borderRadius: 999, background: uiTokens.colors.primaryDeeper, flexShrink: 0 }} />
                  <Card withBorder radius="md" style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start">
                      <Box>
                        <Text fw={700} size="sm">{log.username || "系统"}</Text>
                        <Text size="xs" c="dimmed">{log.operation || "操作变更"}</Text>
                        <Group gap="xs" mt={6}>
                          <Badge size="xs" color="green" variant="light">
                            {resolveActionKindLabel(log.actionKind)}
                          </Badge>
                          <Badge size="xs" color="gray" variant="outline">
                            {resolveTargetTypeLabel(log.targetType)}
                          </Badge>
                          {!!log.targetCount && log.targetCount > 1 && (
                            <Badge size="xs" color="orange" variant="light">
                              {log.targetCount} 条
                            </Badge>
                          )}
                        </Group>
                      </Box>
                      <Text size="xs" c="dimmed">
                        {log.createTime ? new Date(log.createTime).toLocaleString() : "--"}
                      </Text>
                    </Group>
                    {log.params ? (
                      <Text size="sm" c="dimmed" mt="sm">
                        {renderAuditParams(log.params)}
                      </Text>
                    ) : null}
                  </Card>
                </Group>
              ))
            ) : (
              <Text size="sm" c="dimmed">暂无处置轨迹</Text>
            )}
          </Stack>
        </Modal>

        <Modal
          opened={ruleOpened}
          onClose={() => setRuleOpened(false)}
          title={<Text fw={700}>流失判定规则</Text>}
          centered
          radius="md"
        >
          <Stack gap="md">
            <TextInput
              label="规则名称"
              value={ruleName}
              onChange={(event) => setRuleName(event.currentTarget.value)}
            />
            <NumberInput
              label="等待判定时长（分钟）"
              min={5}
              max={1440}
              value={waitMinutes}
              onChange={setWaitMinutes}
              description="超过这个时长仍未继续互动的会话，将进入流失候选分析"
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setRuleOpened(false)}>
                取消
              </Button>
              <Button
                color="green"
                loading={saveRuleMutation.isPending}
                onClick={() => saveRuleMutation.mutate()}
              >
                保存规则
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
