import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Group,
  Button,
  Badge,
  Text,
  Select,
  rem,
  UnstyledButton,
  TextInput,
  Modal,
  Textarea,
  Stack,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconAlertTriangle, IconSearch, IconFilter, IconUser, IconEye, IconChecks, IconMessageCircleX } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { VirtualChatList } from "../../components/chat/VirtualChatList";
import { LineChart } from "../../components/ui/LineChart";
import { PieChart } from "../../components/ui/PieChart";
import api from "../../lib/axios";
import type { EChartsOption } from "echarts";
import { useAuthStore } from "../../store/authStore";
import type { ChatRecord as VirtualChatRecord } from "../../components/chat/VirtualChatList";

type PagedResult<T> = {
  list: T[];
  total: number;
};

type ChartPoint = {
  date?: string;
  value?: number;
};

type HourlyPoint = {
  hour?: string;
  value?: number;
};

type ChartSlice = {
  name: string;
  value: number;
};

type AgentRankingItem = {
  userId?: string | null;
  name: string;
  value: number;
};

type ViolationStats = {
  trend?: ChartPoint[];
  topKeywords?: ChartSlice[];
  hourlyDistribution?: HourlyPoint[];
  statusDistribution?: ChartSlice[];
  agentRanking?: AgentRankingItem[];
};

type ViolationAlert = {
  id: string;
  createTime?: string | null;
  username?: string | null;
  keyword?: string | null;
  status?: number | null;
  statusLabel?: string | null;
  handleTime?: string | null;
  handleBy?: string | null;
  handleRemark?: string | null;
  content?: string | null;
  sessionId?: string | null;
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

type SessionDetail = {
  records?: VirtualChatRecord[];
};

export default function ViolationRecordPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState('today');
  const [keyword, setSearchKeyword] = useState('');
  const [alertId] = useState(searchParams.get("alertId") || "");
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [handleOpened, setHandleOpened] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ViolationAlert | null>(null);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [handleStatus, setHandleStatus] = useState<string | null>("1");
  const [handleRemark, setHandleRemark] = useState('');
  const [auditOpened, setAuditOpened] = useState(false);
  const [auditAlert, setAuditAlert] = useState<ViolationAlert | null>(null);
  const [myHandledOnly, setMyHandledOnly] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  // 详情弹窗
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // 获取上下文记录
  const { data: sessionDetail } = useQuery<SessionDetail>({
    queryKey: ["session-detail", selectedSessionId],
    queryFn: async () => (await api.get(`/chat/detail/${selectedSessionId}`)).data,
    enabled: !!selectedSessionId && modalOpened
  });

  const { data, isLoading } = useQuery<PagedResult<ViolationAlert>>({
    queryKey: ["violation-records", page, dateRange, alertId, userId, username, keyword, status, myHandledOnly, overdueOnly],
    queryFn: async () => (await api.get("/log/violation/list", { 
      params: {
        id: alertId || undefined,
        page,
        pageSize: 10,
        dateRange,
        userId,
        username,
        keyword,
        status,
        myHandledOnly,
        overdueOnly: overdueOnly && status === '0',
      } 
    })).data
  });
  const { data: statsData, isLoading: statsLoading } = useQuery<ViolationStats>({
    queryKey: ["violation-stats", dateRange],
    queryFn: async () => (await api.get("/log/violation/stats", {
      params: { dateRange },
    })).data,
  });
  const { data: auditLogs, isLoading: auditLoading } = useQuery<OperationLogItem[]>({
    queryKey: ["violation-audit-logs", auditAlert?.id],
    queryFn: async () => (await api.get("/log/operation/list", {
      params: {
        page: 1,
        pageSize: 20,
        path: "/api/log/violation",
        paramsKeyword: auditAlert?.id,
      },
    })).data,
    enabled: !!auditAlert?.id && auditOpened,
  });
  const { data: relatedOperationLogs, isLoading: relatedOperationLoading } = useQuery<OperationLogItem[]>({
    queryKey: ["violation-related-logs", selectedAlert?.id],
    queryFn: async () =>
      (
        await api.get("/log/operation/list", {
          params: {
            page: 1,
            pageSize: 10,
            targetType: "VIOLATION_ALERT",
            targetId: selectedAlert?.id,
          },
        })
      ).data,
    enabled: !!selectedAlert?.id && handleOpened,
  });

  const trendOption: EChartsOption = {
    xAxis: {
      type: "category",
      data: statsData?.trend?.map((item) => item.date || "") || [],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "违规触发",
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.12 },
        data: statsData?.trend?.map((item) => item.value) || [],
      },
    ],
  };
  const keywordOption: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      left: "center",
    },
    series: [
      {
        name: "敏感词分布",
        type: "pie",
        radius: ["40%", "72%"],
        label: {
          formatter: "{b}\n{d}%",
        },
        data: statsData?.topKeywords || [],
      },
    ],
  };
  const hourlyOption: EChartsOption = {
    xAxis: {
      type: "category",
      data: statsData?.hourlyDistribution?.map((item) => item.hour || "") || [],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "时段触发量",
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.1 },
        data: statsData?.hourlyDistribution?.map((item) => item.value) || [],
      },
    ],
  };
  const statusOption: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      left: "center",
    },
    series: [
      {
        name: "处理状态",
        type: "pie",
        radius: ["42%", "72%"],
        label: { formatter: "{b}\n{d}%" },
        data: statsData?.statusDistribution || [],
      },
    ],
  };

  const handleMutation = useMutation({
    mutationFn: async () =>
      (
        await api.put(`/log/violation/${selectedAlert?.id}/handle`, {
          status: Number(handleStatus),
          handleRemark,
        })
      ).data,
    onSuccess: async () => {
      notifications.show({
        title: "处理已保存",
        message: "违规记录状态已更新",
        color: "green",
      });
      await queryClient.invalidateQueries({ queryKey: ["violation-records"] });
      await queryClient.invalidateQueries({ queryKey: ["violation-stats"] });
      setHandleOpened(false);
      setSelectedAlert(null);
      setHandleRemark('');
      setHandleStatus('1');
    },
    onError: () => {
      notifications.show({
        title: "更新失败",
        message: "请稍后重试",
        color: "red",
      });
    },
  });
  const batchHandleMutation = useMutation({
    mutationFn: async () =>
      (
        await api.put(`/log/violation/batch-handle`, {
          ids: selectedIds,
          status: Number(handleStatus),
          handleRemark,
        })
      ).data,
    onSuccess: async () => {
      notifications.show({
        title: "批量处理完成",
        message: `已更新 ${selectedIds.length} 条违规记录`,
        color: "green",
      });
      await queryClient.invalidateQueries({ queryKey: ["violation-records"] });
      await queryClient.invalidateQueries({ queryKey: ["violation-stats"] });
      setSelectedIds([]);
      setHandleOpened(false);
      setSelectedAlert(null);
      setHandleRemark('');
      setHandleStatus('1');
    },
    onError: () => {
      notifications.show({
        title: "批量更新失败",
        message: "请稍后重试",
        color: "red",
      });
    },
  });

  const openHandleModal = (item: ViolationAlert) => {
    setSelectedAlert(item);
    setHandleStatus(item.status === 2 ? '2' : '1');
    setHandleRemark(item.handleRemark || '');
    setHandleOpened(true);
  };
  const openBatchHandleModal = () => {
    setSelectedAlert(null);
    setHandleStatus('1');
    setHandleRemark('');
    setHandleOpened(true);
  };
  const openAuditModal = (item: ViolationAlert) => {
    setAuditAlert(item);
    setAuditOpened(true);
  };
  useEffect(() => {
    const autoOpen = searchParams.get("autoOpen") === "true";
    if (!autoOpen || auditOpened || !data?.list?.length) {
      return;
    }

    const matched = data.list.find((item) => alertId && item.id === alertId);
    if (!matched) {
      return;
    }

    const timer = window.setTimeout(() => {
      openAuditModal(matched);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("autoOpen");
        return next;
      }, { replace: true });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [alertId, auditOpened, data, searchParams, setSearchParams]);
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
  const renderAuditParams = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const statusMap: Record<string, string> = { '0': '待处理', '1': '已处理', '2': '误报' };
      const lines = Object.entries(parsed).map(([key, value]) => {
        const nextValue =
          key === 'status' && statusMap[String(value)] ? statusMap[String(value)] : String(value);
        return `${key}: ${nextValue}`;
      });
      return lines.join(' | ');
    } catch {
      return raw;
    }
  };
  const resolveActionKindLabel = (value?: string | null) => {
    if (!value) return "常规动作";
    if (value === "VIOLATION_BATCH_HANDLE") return "批量处理";
    if (value === "VIOLATION_HANDLE") return "单条处理";
    return value;
  };
  const resolveTargetTypeLabel = (value?: string | null) => {
    if (!value) return "通用对象";
    if (value === "VIOLATION_ALERT") return "违规记录";
    if (value === "LOSS_ANALYSIS") return "流失记录";
    if (value === "QUALITY_INSPECTION") return "质检记录";
    if (value === "CHAT_SESSION") return "会话";
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
      key: 'createTime', 
      title: '发生时间', 
      render: (item: ViolationAlert) => <Text size="sm">{item.createTime ? new Date(item.createTime).toLocaleString() : "--"}</Text> 
    },
    { 
      key: 'username', 
      title: '责任客服', 
      render: (item: ViolationAlert) => (
        <Group gap="xs">
          <IconUser size={14} color="gray" />
          <Text size="sm" fw={500}>{item.username || '未知客服'}</Text>
        </Group>
      )
    },
    { 
      key: 'keyword', 
      title: '触发敏感词', 
      render: (item: ViolationAlert) => <Badge color="red" variant="light">{item.keyword}</Badge> 
    },
    {
      key: 'status',
      title: '处理状态',
      render: (item: ViolationAlert) => (
        <Badge
          color={item.status === 1 ? "green" : item.status === 2 ? "gray" : "orange"}
          variant="light"
        >
          {item.statusLabel || '待处理'}
        </Badge>
      ),
    },
    {
      key: 'handleInfo',
      title: '处理摘要',
      render: (item: ViolationAlert) => (
        item.handleTime ? (
          <Box>
            <Text size="sm" fw={600}>{item.handleBy || '未知处理人'}</Text>
            <Text size="xs" c="dimmed">
              {new Date(item.handleTime).toLocaleString()}
            </Text>
            {item.handleRemark ? (
              <Text size="xs" c="dimmed" lineClamp={2}>
                {item.handleRemark}
              </Text>
            ) : null}
          </Box>
        ) : (
          <Text size="sm" c="dimmed">暂无处理记录</Text>
        )
      ),
    },
    { 
      key: 'content', 
      title: '上下文内容', 
      render: (item: ViolationAlert) => (
        <Text size="sm" style={{ maxWidth: rem(400) }} truncate="end">
          {item.content}
        </Text>
      ) 
    },
    { 
      key: 'action', 
      title: '操作', 
      render: (item: ViolationAlert) => (
        <Group gap="xs" wrap="nowrap">
          <Button 
            variant="subtle" 
            size="xs" 
            leftSection={<IconEye size={14} />} 
            color="green"
            onClick={() => {
              setSelectedSessionId(item.sessionId || null);
              setModalOpened(true);
            }}
          >
            查看上下文
          </Button>
          <Button
            variant="light"
            size="xs"
            color={item.status === 0 ? "orange" : "blue"}
            leftSection={item.status === 2 ? <IconMessageCircleX size={14} /> : <IconChecks size={14} />}
            onClick={() => openHandleModal(item)}
          >
            处理
          </Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => openAuditModal(item)}
          >
            处理轨迹
          </Button>
        </Group>
      ) 
    },
  ];

  const dateBtnStyle = {
    height: rem(44),
    border: '1px solid #64748b',
    padding: `0 ${rem(16)}`,
    fontSize: rem(14),
    fontWeight: 500,
    transition: 'all 0.2s ease',
  };

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="敏感词触发记录"
          description="精确监控客服在会话中触发的违规词，支持按责任人快速溯源"
        />

        <SpotlightCard>
          <Group gap="md" wrap="wrap" style={{ width: '100%' }}>
            <TextInput
              placeholder="搜索敏感词..."
              leftSection={<IconSearch size={16} />}
              value={keyword}
              onChange={(e) => setSearchKeyword(e.currentTarget.value)}
              styles={{ root: { flexGrow: 1 } }}
            />
            <Select
              placeholder="按客服筛选"
              data={(statsData?.agentRanking || []).map((item) => ({
                value: item.userId || item.name,
                label: item.name,
              }))} 
              leftSection={<IconFilter size={16} />}
              value={userId}
              onChange={(value, option) => {
                setUserId(value);
                setUsername(option?.label || null);
                setPage(1);
              }}
              clearable
              styles={{ root: { flexGrow: 1 } }}
            />
            <Select
              placeholder="处理状态"
              data={[
                { value: "0", label: "待处理" },
                { value: "1", label: "已处理" },
                { value: "2", label: "误报" },
              ]}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              clearable
              styles={{ root: { flexGrow: 1 } }}
            />
            <Badge
              color={myHandledOnly ? "green" : "gray"}
              variant={myHandledOnly ? "filled" : "light"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setMyHandledOnly((prev) => !prev);
                setPage(1);
              }}
            >
              只看我处理的
            </Badge>
            <Badge
              color={overdueOnly ? "orange" : "gray"}
              variant={overdueOnly ? "filled" : "light"}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setStatus('0');
                setOverdueOnly((prev) => !prev);
                setPage(1);
              }}
            >
              未处理超 24h
            </Badge>
            
            <Group gap={0} wrap="nowrap" style={{ border: '1px solid #64748b', borderRadius: rem(6), overflow: 'hidden' }}>
              <UnstyledButton 
                style={{ ...dateBtnStyle, border: 'none', backgroundColor: dateRange === 'today' ? '#f1f3f5' : 'white' }}
                onClick={() => setDateRange('today')}
              >今天</UnstyledButton>
              <UnstyledButton 
                style={{ ...dateBtnStyle, border: 'none', borderLeft: '1px solid #64748b', borderRight: '1px solid #64748b', backgroundColor: dateRange === '7d' ? '#f1f3f5' : 'white' }}
                onClick={() => setDateRange('7d')}
              >近7天</UnstyledButton>
              <UnstyledButton 
                style={{ ...dateBtnStyle, border: 'none', backgroundColor: dateRange === '30d' ? '#f1f3f5' : 'white' }}
                onClick={() => setDateRange('30d')}
              >近30天</UnstyledButton>
            </Group>
          </Group>
        </SpotlightCard>

        <Box mt="md">
          <Group grow mb="md" align="stretch">
            <Card withBorder radius="md" shadow="sm">
              <Text fw={800} c="green.9">违规趋势</Text>
              <Text size="sm" c="dimmed" mb="md">观察时间窗口内的风险抬头时段</Text>
              <LineChart option={trendOption} height={280} loading={statsLoading} />
            </Card>

            <Card withBorder radius="md" shadow="sm">
              <Text fw={800} c="green.9">Top 敏感词</Text>
              <Text size="sm" c="dimmed" mb="md">优先治理高频触发词</Text>
              <PieChart option={keywordOption} height={280} loading={statsLoading} />
              <Group gap="xs" mt="sm">
                {(statsData?.topKeywords || []).slice(0, 4).map((item) => (
                  <Badge
                    key={item.name}
                    color={keyword === item.name ? "red" : "gray"}
                    variant={keyword === item.name ? "filled" : "light"}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSearchKeyword(item.name);
                      setPage(1);
                    }}
                  >
                    {item.name}
                  </Badge>
                ))}
              </Group>
            </Card>
          </Group>

          <Group grow mb="md" align="stretch">
            <Card withBorder radius="md" shadow="sm">
              <Text fw={800} c="green.9">高风险时段</Text>
              <Text size="sm" c="dimmed" mb="md">识别违规集中发生的小时区间</Text>
              <LineChart option={hourlyOption} height={240} loading={statsLoading} />
            </Card>

            <Card withBorder radius="md" shadow="sm">
              <Group justify="space-between" mb="md">
                <Box>
                  <Text fw={800} c="green.9">客服风险排行</Text>
                  <Text size="sm" c="dimmed">便于安排复盘与专项培训</Text>
                </Box>
                <Badge color="red" variant="light">Top 6</Badge>
              </Group>

              <Box>
                {(statsData?.agentRanking || []).length > 0 ? (
                  (statsData?.agentRanking || []).map((item, index: number) => (
                    <Group
                      key={item.name}
                      justify="space-between"
                      py={8}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setUserId(item.userId || item.name);
                        setUsername(item.name);
                        setPage(1);
                      }}
                    >
                      <Group gap="sm" wrap="nowrap">
                        <Badge
                          color={index < 3 ? "red" : "gray"}
                          variant={index < 3 ? "filled" : "light"}
                        >
                          #{index + 1}
                        </Badge>
                        <Text fw={600}>{item.name}</Text>
                      </Group>
                      <Text fw={800} c="red.7">{item.value}</Text>
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">当前时间范围内暂无客服风险排行</Text>
                )}
              </Box>
            </Card>
          </Group>

          <Card withBorder radius="md" shadow="sm" mb="md">
            <Text fw={800} c="green.9">处理状态分布</Text>
            <Text size="sm" c="dimmed" mb="md">检查待处理积压与误报占比</Text>
            <PieChart option={statusOption} height={260} loading={statsLoading} />
          </Card>

          <Card withBorder radius="md">
            <Group justify="flex-end" mb="sm">
              <Group gap="sm" wrap="wrap">
                {selectedIds.length > 0 && (
                  <Button
                    color="orange"
                    leftSection={<IconChecks size={16} />}
                    onClick={openBatchHandleModal}
                  >
                    批量处理 {selectedIds.length} 条
                  </Button>
                )}
                {username && (
                  <Badge
                    color="blue"
                    variant="light"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setUserId(null);
                      setUsername(null);
                      setPage(1);
                    }}
                  >
                    客服筛选: {username} x
                  </Badge>
                )}
                {keyword && (
                  <Badge
                    color="red"
                    variant="light"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSearchKeyword('');
                      setPage(1);
                    }}
                  >
                    关键词: {keyword} x
                  </Badge>
                )}
                {status && (
                  <Badge
                    color="orange"
                    variant="light"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setStatus(null);
                      setPage(1);
                    }}
                  >
                    状态: {status === '0' ? '待处理' : status === '1' ? '已处理' : '误报'} x
                  </Badge>
                )}
                {myHandledOnly && (
                  <Badge
                    color="green"
                    variant="light"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setMyHandledOnly(false);
                      setPage(1);
                    }}
                  >
                    处理人: {user?.username || '我'} x
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
                    超时未处理 x
                  </Badge>
                )}
              </Group>
            </Group>
            <CommonTable 
              data={data?.list} 
              columns={columns} 
              total={data?.total || 0} 
              page={page} 
              pageSize={10}
              onPageChange={setPage} 
              loading={isLoading}
              emptyIcon={IconAlertTriangle}
              emptyTitle="暂无敏感词触发记录"
              selectable
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
            />
          </Card>
        </Box>

        {/* 上下文详情弹窗 */}
        <Modal 
          opened={modalOpened} 
          onClose={() => setModalOpened(false)} 
          title={<Text fw={700}>违规会话上下文回顾</Text>}
          size="lg"
          radius="md"
        >
          <Box style={{ border: '1px solid #eee', borderRadius: rem(8), overflow: 'hidden' }}>
            <VirtualChatList records={sessionDetail?.records || []} />
          </Box>
        </Modal>

        <Modal
          opened={handleOpened}
          onClose={() => setHandleOpened(false)}
          title={<Text fw={700}>违规处理</Text>}
          centered
          radius="md"
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {selectedAlert
                ? `当前记录：${selectedAlert?.keyword || '-'}`
                : `批量处理：已选择 ${selectedIds.length} 条记录`}
            </Text>
            {selectedAlert && (
              <Card withBorder radius="md" p="sm">
                <Text size="sm" fw={700} mb="sm">
                  最近相关操作
                </Text>
                {relatedOperationLoading ? (
                  <Text size="sm" c="dimmed">
                    正在加载操作轨迹...
                  </Text>
                ) : (relatedOperationLogs?.length || 0) > 0 ? (
                  <Stack gap="sm">
                    {(relatedOperationLogs || []).map((item) => (
                      <Card key={item.id} withBorder radius="md" p="sm">
                        <Group justify="space-between" align="flex-start">
                          <Box>
                            <Text size="sm" fw={600}>{item.operation}</Text>
                            <Group gap="xs" mt={6}>
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
                          </Box>
                          <Text size="xs" c="dimmed">
                            {item.createTime ? new Date(item.createTime).toLocaleString() : "--"}
                          </Text>
                        </Group>
                        <Group gap="xs" mt="sm">
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() => {
                              setHandleOpened(false);
                              navigate(`/violation?alertId=${selectedAlert?.id}&autoOpen=true`);
                            }}
                          >
                            打开对象
                          </Button>
                          <Button
                            size="xs"
                            variant="subtle"
                            onClick={() => {
                              setHandleOpened(false);
                              openOperationLogPage(item);
                            }}
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
            )}
            <Select
              label="处理结果"
              data={[
                { value: "1", label: "已处理" },
                { value: "2", label: "误报" },
              ]}
              value={handleStatus}
              onChange={setHandleStatus}
              allowDeselect={false}
            />
            <Textarea
              label="处理备注"
              minRows={3}
              placeholder="记录处理动作、原因或复盘结论"
              value={handleRemark}
              onChange={(event) => setHandleRemark(event.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setHandleOpened(false)}>
                取消
              </Button>
              <Button
                color="green"
                loading={handleMutation.isPending || batchHandleMutation.isPending}
                onClick={() => {
                  if (selectedAlert) {
                    handleMutation.mutate();
                    return;
                  }
                  batchHandleMutation.mutate();
                }}
              >
                保存处理结果
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={auditOpened}
          onClose={() => setAuditOpened(false)}
          title={<Text fw={700}>处理轨迹</Text>}
          centered
          radius="md"
          size="lg"
        >
          <Stack gap="md">
            <Box>
              <Text fw={600}>当前记录</Text>
              <Text size="sm" c="dimmed">
                敏感词：{auditAlert?.keyword || '-'}
              </Text>
              <Text size="sm" c="dimmed">
                当前状态：{auditAlert?.statusLabel || '待处理'}
              </Text>
            </Box>
            <Divider />
            {auditLoading ? (
              <Text size="sm" c="dimmed">正在加载处理轨迹...</Text>
            ) : (auditLogs?.length || 0) > 0 ? (
              <Stack gap="sm">
                {(auditLogs || []).map((item) => (
                  <Group key={item.id} align="flex-start" wrap="nowrap" gap="sm">
                    <Box
                      style={{
                        width: 12,
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: 6,
                      }}
                    >
                      <Box
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--mantine-color-green-6)",
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                    <Card withBorder radius="md" p="sm" style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Box>
                          <Text fw={600}>{item.username || '系统'}</Text>
                          <Text size="xs" c="dimmed">{item.operation}</Text>
                          <Group gap="xs" mt={6}>
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
                        </Box>
                        <Text size="xs" c="dimmed">
                          {item.createTime ? new Date(item.createTime).toLocaleString() : "--"}
                        </Text>
                      </Group>
                      {item.params ? (
                        <Text size="xs" c="dimmed" mt="xs" style={{ wordBreak: "break-word" }}>
                          {renderAuditParams(item.params)}
                        </Text>
                      ) : null}
                    </Card>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">暂无处理轨迹</Text>
            )}
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
