import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  Text,
  TextInput,
  Group,
  ScrollArea,
  Avatar,
  Badge,
  Button,
  Stack,
  ActionIcon,
  Tooltip,
  rem,
  useMantineTheme,
  LoadingOverlay,
  Paper,
  Select,
  Alert,
} from "@mantine/core";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconSearch,
  IconMessages,
  IconSparkles,
  IconAlertCircle,
  IconChecklist,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { format } from "date-fns";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";
import type { ChatRecord as VirtualChatRecord } from "../../components/chat/VirtualChatList";

const API_BASE = "/chat";

type ShopInfo = {
  name?: string | null;
};

type SessionListItem = {
  id: string;
  sessionId?: string | null;
  startTime?: string | null;
  shop?: ShopInfo | null;
};

type SessionListResponse = {
  list?: SessionListItem[];
};

type ChatRecord = VirtualChatRecord & {
  vectorId?: string | null;
};

type SessionDetail = {
  sessionId?: string | null;
  shop?: ShopInfo | null;
  inspection?: {
    id?: string | null;
    status?: number | null;
  } | null;
  records?: ChatRecord[];
};

type SimilarResultItem = {
  id: string;
  score: number;
  content?: string | null;
  senderType?: string | null;
  sendTime?: string | null;
  sessionId?: string | null;
  shopName?: string | null;
};

type QualityRuleOption = {
  id: string;
  name: string;
  deptId?: string | null;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError | undefined)?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

export default function ChatPage() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { roles, permissions } = useAuthStore();
  const canStartQuality = roles.includes("SUPER_ADMIN") || permissions.includes("quality:view");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const { data: sessions, isLoading: listLoading } = useQuery<SessionListItem[]>({
    queryKey: ["sessions", debouncedSearch],
    queryFn: async () => {
      const res = await api.get<SessionListResponse>(`${API_BASE}/list`, {
        params: { keyword: debouncedSearch, page: 1, pageSize: 20 },
      });
      return Array.isArray(res.data?.list) ? res.data.list : [];
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery<SessionDetail | null>({
    queryKey: ["session-detail", selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) {
        return null;
      }
      const res = await api.get<SessionDetail>(`${API_BASE}/detail/${selectedSessionId}`);
      return res.data;
    },
    enabled: !!selectedSessionId,
  });

  const { data: rules = [] } = useQuery<QualityRuleOption[]>({
    queryKey: ["quality-active-rules"],
    queryFn: async () => (await api.get("/quality/rules/active")).data,
    enabled: canStartQuality,
  });
  const effectiveRuleId = selectedRuleId || rules[0]?.id || null;

  const similarMutation = useMutation<SimilarResultItem[], Error, string>({
    mutationFn: async (recordId: string) => {
      const res = await api.get<SimilarResultItem[]>(`${API_BASE}/similar/${recordId}`);
      return res.data;
    },
    onError: () => {
      notifications.show({
        title: "相似检索失败",
        message: "当前消息暂时无法完成相似召回，请稍后重试",
        color: "red",
      });
    },
  });

  const qualityMutation = useMutation({
    mutationFn: async () =>
      api.post("/quality/batch", {
        sessionIds: selectedSessionId ? [selectedSessionId] : [],
        ruleId: effectiveRuleId,
      }),
    onSuccess: () => {
      notifications.show({
        title: "已发起智能质检",
        message: "系统正在生成质检结果，已为你跳转到质检页查看进度",
        color: "green",
      });
      if (selectedSessionId) {
        navigate(`/quality?sessionId=${selectedSessionId}&autoOpen=true`);
      }
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "质检发起失败",
        message: getErrorMessage(error, "当前会话暂时无法发起 AI 质检"),
        color: "red",
      });
    },
  });

  const ruleOptions = rules.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  return (
    <Box h="calc(100vh - 120px)">
      <PageHeader
        title="会话管理"
        description="多平台会话记录查询、智能质检联动与相似会话召回"
      />

      <Grid h="100%" gutter="md">
        <Grid.Col span={4} h="100%">
          <Card withBorder h="100%" radius="md" p="0" style={{ display: "flex", flexDirection: "column" }}>
            <Box p="md" style={{ borderBottom: `${rem(1)} solid ${theme.colors.gray[2]}` }}>
              <TextInput
                placeholder="搜索会话 ID 或内容..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                radius="md"
              />
            </Box>

            <ScrollArea scrollbars="y" style={{ flex: 1 }}>
              <Stack gap="xs" p="xs">
                <LoadingOverlay visible={listLoading} overlayProps={{ blur: 1 }} />
                {sessions?.map((sess) => (
                  <Paper
                    key={sess.id}
                    p="sm"
                    radius="md"
                    onClick={() => setSelectedSessionId(sess.id)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedSessionId === sess.id ? theme.colors.green[0] : "transparent",
                      border:
                        selectedSessionId === sess.id
                          ? `${rem(1)} solid ${theme.colors.green[3]}`
                          : `${rem(1)} solid transparent`,
                    }}
                  >
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={700}>
                        {sess.sessionId}
                      </Text>
                      <Badge size="xs" color="green" variant="light">
                        {sess.shop?.name || "未知店铺"}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {sess.startTime ? format(new Date(sess.startTime), "yyyy-MM-dd HH:mm") : "-"}
                    </Text>
                  </Paper>
                ))}
                {(sessions || []).length === 0 && !listLoading && (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    当前没有匹配的会话记录
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

        <Grid.Col span={8} h="100%">
          <Card withBorder h="100%" radius="md" p="0" style={{ position: "relative" }}>
            <LoadingOverlay visible={detailLoading || qualityMutation.isPending} />

            {!selectedSessionId ? (
              <Stack h="100%" justify="center" align="center" c="dimmed">
                <IconMessages size={48} stroke={1.5} />
                <Text>请从左侧选择一个会话查看详情</Text>
              </Stack>
            ) : (
              <Box h="100%" style={{ display: "flex", flexDirection: "column" }}>
                <Box
                  p="md"
                  style={{
                    borderBottom: `${rem(1)} solid ${theme.colors.gray[2]}`,
                    backgroundColor: theme.colors.green[0],
                  }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                      <Box>
                        <Text fw={700} c="green.9">
                          {detail?.sessionId}
                        </Text>
                        <Text size="xs" c="dimmed">
                          所属店铺：{detail?.shop?.name || "未识别"}
                        </Text>
                      </Box>
                      <Badge color={detail?.inspection?.id ? "blue" : "gray"} variant="light">
                        {detail?.inspection?.id ? "已有质检记录" : "尚未质检"}
                      </Badge>
                    </Group>

                    {!canStartQuality && (
                      <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                        当前账号没有 `quality:view` 权限，因此不能从聊天页直接发起 AI 质检。
                      </Alert>
                    )}

                    <Group align="end">
                      <Select
                        label="质检规则"
                        placeholder="选择规则"
                        data={ruleOptions}
                        value={effectiveRuleId}
                        onChange={setSelectedRuleId}
                        disabled={!canStartQuality}
                        w={280}
                      />
                      <Button
                        variant="light"
                        leftSection={<IconChecklist size={14} />}
                        disabled={!canStartQuality || !effectiveRuleId || !selectedSessionId}
                        onClick={() => qualityMutation.mutate()}
                      >
                        AI 智能质检
                      </Button>
                    </Group>
                  </Stack>
                </Box>

                <ScrollArea p="xl" style={{ flex: 1 }}>
                  <Stack gap="lg">
                    {detail?.records?.map((record) => (
                      <Box
                        key={record.id}
                        style={{
                          alignSelf: record.senderType === "AGENT" ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                        }}
                      >
                        <Group
                          align="flex-start"
                          gap="xs"
                          style={{
                            flexDirection: record.senderType === "AGENT" ? "row-reverse" : "row",
                          }}
                        >
                          <Avatar radius="xl" color={record.senderType === "AGENT" ? "blue" : "green"}>
                            {record.senderType === "AGENT" ? "客" : "用"}
                          </Avatar>
                          <Box>
                            <Paper
                              p="sm"
                              radius="md"
                              style={{
                                backgroundColor:
                                  record.senderType === "AGENT" ? theme.colors.blue[0] : theme.colors.green[0],
                                border: `${rem(1)} solid ${
                                  record.senderType === "AGENT" ? theme.colors.blue[1] : theme.colors.green[1]
                                }`,
                              }}
                            >
                              <Text size="sm">{record.content}</Text>
                            </Paper>
                            <Group
                              gap="xs"
                              mt={4}
                              justify={record.senderType === "AGENT" ? "flex-end" : "flex-start"}
                            >
                              <Text size="10px" c="dimmed">
                                {record.sendTime ? format(new Date(record.sendTime), "HH:mm") : ""}
                              </Text>
                              <Tooltip label="检索相似会话">
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="green"
                                  loading={similarMutation.isPending && similarMutation.variables === record.id}
                                  onClick={() => similarMutation.mutate(record.id)}
                                >
                                  <IconSparkles size={12} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Box>
                        </Group>
                      </Box>
                    ))}
                  </Stack>
                </ScrollArea>

                {Array.isArray(similarMutation.data) && (
                  <Box
                    p="md"
                    style={{
                      borderTop: `${rem(1)} solid ${theme.colors.green[2]}`,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Text size="xs" fw={700} c="green.8" mb="xs">
                      AI 相似匹配结果
                    </Text>
                    <ScrollArea>
                      <Group gap="xs" wrap="nowrap">
                        {similarMutation.data.map((item) => (
                          <Paper key={item.id} withBorder p="xs" w={240} radius="sm">
                            <Text size="xs" fw={600} lineClamp={3}>
                              {item.content || "-"}
                            </Text>
                            <Text size="10px" c="dimmed" mt={6}>
                              {item.shopName || "未知店铺"} · {item.sessionId || "未知会话"}
                            </Text>
                            <Group justify="space-between" mt="xs">
                              <Badge size="xs" variant="light">
                                {(item.score * 100).toFixed(1)}%
                              </Badge>
                              <Button
                                size="compact-xs"
                                variant="subtle"
                                onClick={() => item.sessionId && setSearch(item.sessionId)}
                              >
                                定位会话
                              </Button>
                            </Group>
                          </Paper>
                        ))}
                        {similarMutation.data.length === 0 && (
                          <Text size="sm" c="dimmed">
                            当前消息没有召回到足够相近的历史内容。
                          </Text>
                        )}
                      </Group>
                    </ScrollArea>
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
