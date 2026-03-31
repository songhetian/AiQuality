import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Group,
  Button,
  Badge,
  Text,
  FileButton,
  TextInput,
  Stack,
  Select,
  Tabs,
  Alert,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import { IconCloudUpload, IconFileText, IconSearch, IconCheck, IconLoader2, IconAlertCircle, IconDatabase, IconHistory, IconRefresh } from "@tabler/icons-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import { PageAnimate } from "../../components/ui/PageAnimate";
import api from "../../lib/axios";
import { notifications } from "@mantine/notifications";
import { useSocket } from "../../hooks/useSocket";
import { useAuthStore } from "../../store/authStore";

type PagedResult<T> = {
  list: T[];
  total: number;
};

type KnowledgeItem = {
  id: string;
  title?: string | null;
  status?: number | null;
  deptId?: string | null;
  fileType?: string | null;
  accessUrl?: string | null;
  fileUrl?: string | null;
};

type KnowledgeSearchItem = {
  id: string;
  title?: string | null;
  content?: string | null;
  score: number;
  chunkIndex?: number | null;
  knowledge?: {
    title?: string | null;
    accessUrl?: string | null;
  } | null;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type KnowledgeProcessedEvent = {
  id?: string;
  title?: string;
  status?: "SUCCESS" | "FAILED";
  errorMessage?: string;
};

type KnowledgeTaskItem = KnowledgeItem & {
  updateTime?: string | null;
  errorMessage?: string | null;
  canRetry?: boolean;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError | undefined)?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

export default function KnowledgePage() {
  const queryClient = useQueryClient();
  const { on } = useSocket();
  const { roles, permissions } = useAuthStore();
  const canUpload = roles.includes("SUPER_ADMIN") || permissions.includes("knowledge:upload");
  const [activeTab, setActiveTab] = useState<string | null>('assets');
  const [taskPage, setTaskPage] = useState(1);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  useEffect(() => {
    const cleanup = on('knowledge_processed', (payload) => {
      const data = (payload ?? {}) as KnowledgeProcessedEvent;
      notifications.show({
        title: data.status === "FAILED" ? '知识处理失败' : '知识处理完成',
        message:
          data.status === "FAILED"
            ? `文档 [${data.title || "-"}] 处理失败：${data.errorMessage || "请重试"}`
            : `文档 [${data.title || "-"}] 已成功向量化并入库`,
        color: data.status === "FAILED" ? 'red' : 'green',
        icon: data.status === "FAILED" ? <IconAlertCircle size={16} /> : <IconCheck size={16} />
      });
      queryClient.invalidateQueries({ queryKey: ["knowledge-list"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-tasks"] });
    });
    return cleanup;
  }, [on, queryClient]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [semanticQuery, setSemanticQuery] = useState("");
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [debouncedSemanticQuery] = useDebouncedValue(semanticQuery, 400);

  const { data, isLoading } = useQuery<PagedResult<KnowledgeItem>>({
    queryKey: ["knowledge-list", page, debouncedSearch],
    queryFn: async () =>
      (
        await api.get("/knowledge/list", {
          params: { page, pageSize: 10, title: debouncedSearch || undefined },
        })
      ).data,
  });

  const { data: semanticData, isLoading: semanticLoading } = useQuery<{ list: KnowledgeSearchItem[] }>({
    queryKey: ["knowledge-semantic-search", debouncedSemanticQuery, selectedKbId],
    queryFn: async () =>
      (
        await api.get("/knowledge/search", {
          params: {
            keyword: debouncedSemanticQuery,
            limit: 5,
            kbId: selectedKbId || undefined,
          },
        })
      ).data,
    enabled: debouncedSemanticQuery.trim().length > 0,
  });

  const { data: taskData, isLoading: taskLoading } = useQuery<PagedResult<KnowledgeTaskItem>>({
    queryKey: ["knowledge-tasks", taskPage, taskStatus],
    queryFn: async () =>
      (
        await api.get("/knowledge/tasks", {
          params: {
            page: taskPage,
            pageSize: 8,
            status: taskStatus || undefined,
          },
        })
      ).data,
    refetchInterval: (query) => {
      const tasks = query.state.data?.list || [];
      return tasks.some((item) => item.status === 0 || item.status === 1) ? 5000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/knowledge/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      notifications.show({ title: '上传成功', message: '文件已进入向量化处理队列', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ["knowledge-list"] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '上传失败',
        message: getErrorMessage(error, '文件暂时无法上传，请检查格式和大小后重试'),
        color: 'red',
      });
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/knowledge/retry/${id}`),
    onSuccess: () => {
      notifications.show({
        title: "已重新排队",
        message: "系统正在重新执行向量化处理，请稍后查看任务状态",
        color: "blue",
      });
      queryClient.invalidateQueries({ queryKey: ["knowledge-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-list"] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "重试失败",
        message: getErrorMessage(error, "当前任务暂时无法重新执行"),
        color: "red",
      });
    },
  });

  const knowledgeOptions = (data?.list || []).map((item) => ({
    value: item.id,
    label: item.title || item.id,
  }));

  const columns = [
    { 
      key: 'title', 
      title: '知识文件名称', 
      render: (item: KnowledgeItem) => (
        <Group gap="sm">
          <IconFileText size={18} color="gray" />
          <Text size="sm" fw={500}>{item.title}</Text>
        </Group>
      ) 
    },
    { 
      key: 'status', 
      title: '向量化状态', 
      render: (item: KnowledgeItem) => {
        if (item.status === 0) return <Badge color="gray" variant="light">待处理</Badge>;
        if (item.status === 1) return <Badge color="blue" variant="light" leftSection={<IconLoader2 size={12} className="animate-spin" />}>正在索引</Badge>;
        if (item.status === 2) return <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>已入库</Badge>;
        return <Badge color="red" variant="light" leftSection={<IconAlertCircle size={12} />}>索引失败</Badge>;
      }
    },
    { key: 'dept', title: '归属部门', render: (item: KnowledgeItem) => <Badge variant="outline" color="slate">{item.deptId || '全平台'}</Badge> },
    { key: 'actions', title: '操作', render: (item: KnowledgeItem) => (
      <Button variant="subtle" size="xs" component="a" href={item.accessUrl || item.fileUrl || undefined} target="_blank" color="green">查看原文</Button>
    )},
  ];

  const taskColumns = [
    {
      key: "title",
      title: "任务文档",
      render: (item: KnowledgeTaskItem) => (
        <Group gap="sm">
          <IconFileText size={18} color="gray" />
          <Box>
            <Text size="sm" fw={500}>{item.title || "-"}</Text>
            <Text size="xs" c="dimmed">{item.fileType || "-"}</Text>
          </Box>
        </Group>
      ),
    },
    {
      key: "status",
      title: "处理状态",
      render: (item: KnowledgeTaskItem) => {
        if (item.status === 0) return <Badge color="gray" variant="light">待处理</Badge>;
        if (item.status === 1) return <Badge color="blue" variant="light">处理中</Badge>;
        if (item.status === 2) return <Badge color="green" variant="light">已完成</Badge>;
        return <Badge color="red" variant="light">处理失败</Badge>;
      },
    },
    {
      key: "errorMessage",
      title: "失败原因",
      render: (item: KnowledgeTaskItem) => (
        <Text size="xs" c={item.errorMessage ? "red" : "dimmed"} lineClamp={2}>
          {item.errorMessage || "无"}
        </Text>
      ),
    },
    {
      key: "updateTime",
      title: "最近更新",
      render: (item: KnowledgeTaskItem) => (
        <Text size="xs" c="dimmed">
          {item.updateTime ? new Date(item.updateTime).toLocaleString() : "--"}
        </Text>
      ),
    },
    {
      key: "actions",
      title: "操作",
      render: (item: KnowledgeTaskItem) => (
        <Group gap={6}>
          <Button
            size="xs"
            variant="subtle"
            component="a"
            href={item.accessUrl || item.fileUrl || undefined}
            target="_blank"
            color="green"
          >
            查看文档
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconRefresh size={14} />}
            disabled={!canUpload || !item.canRetry}
            loading={retryMutation.isPending && retryMutation.variables === item.id}
            onClick={() => retryMutation.mutate(item.id)}
          >
            重试
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="知识库管理"
          description="上传产品手册、业务流程等文档，通过 Qdrant 实现 RAG 语义检索增强"
          rightSection={
            <FileButton onChange={(file) => file && uploadMutation.mutate(file)} accept=".txt,.md,.pdf,.docx" disabled={!canUpload}>
              {(props) => (
                <Button {...props} leftSection={<IconCloudUpload size={18} />} loading={uploadMutation.isPending} disabled={!canUpload}>
                  上传知识文档
                </Button>
              )}
            </FileButton>
          }
        />

        <Tabs value={activeTab} onChange={setActiveTab} color="green" variant="pills" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="assets" leftSection={<IconDatabase size={16} />}>知识资产</Tabs.Tab>
            <Tabs.Tab value="queue" leftSection={<IconHistory size={16} />}>处理任务</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="assets">
            {!canUpload && (
              <Alert color="yellow" icon={<IconAlertCircle size={16} />} mb="md">
                当前账号只有知识查看权限，不能上传文档或重试失败任务。
              </Alert>
            )}
            <Card withBorder radius="md" mb="md" p="md">
              <Group gap="md" wrap="nowrap" style={{ width: '100%' }}>
                <TextInput
                  placeholder="搜索知识库文档..."
                  leftSection={<IconSearch size={16} />}
                  styles={{ root: { flexGrow: 1 } }}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
                <Button variant="light" color="gray">筛选部门</Button>
              </Group>
            </Card>

            <Card withBorder radius="md" mb="md" p="md">
              <Text fw={700} mb="sm">
                语义召回预览
              </Text>
              <Select
                placeholder="可选：只检索某一份文档"
                data={knowledgeOptions}
                searchable
                clearable
                value={selectedKbId}
                onChange={setSelectedKbId}
                mb="sm"
              />
              <TextInput
                placeholder="输入一个问题，测试 Qdrant 语义召回..."
                leftSection={<IconSearch size={16} />}
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.currentTarget.value)}
                mb="md"
              />
              <Text size="xs" c="dimmed" mb="md">
                当前上传支持 `txt`、`md`、`pdf`、`docx`，单文件大小默认不超过 20 MB。
              </Text>
              {debouncedSemanticQuery.trim().length === 0 ? (
                <Text size="sm" c="dimmed">
                  输入问题后会展示最相近的知识块结果。
                </Text>
              ) : semanticLoading ? (
                <Text size="sm" c="dimmed">
                  正在检索语义相关内容...
                </Text>
              ) : (
                <Stack gap="sm">
                  {(semanticData?.list || []).map((item) => (
                    <Card key={item.id} withBorder radius="md" p="sm" bg="gray.0">
                      <Group justify="space-between" mb={6}>
                        <Text fw={600} size="sm">
                          {item.knowledge?.title || item.title}
                        </Text>
                        <Badge variant="light" color="green">
                          {(item.score * 100).toFixed(1)}%
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed" mb={6}>
                        Chunk #{item.chunkIndex ?? 0}
                      </Text>
                      <Text size="sm" lineClamp={3}>
                        {item.content}
                      </Text>
                      {item.knowledge?.accessUrl && (
                        <Group justify="flex-end" mt="sm">
                          <Button
                            variant="subtle"
                            size="xs"
                            component="a"
                            href={item.knowledge.accessUrl}
                            target="_blank"
                            color="green"
                          >
                            打开来源文档
                          </Button>
                        </Group>
                      )}
                    </Card>
                  ))}
                  {(semanticData?.list || []).length === 0 && (
                    <Text size="sm" c="dimmed">
                      没找到相关知识块，可以换个说法再试试。
                    </Text>
                  )}
                </Stack>
              )}
            </Card>

            <Card withBorder radius="md">
              <CommonTable data={data?.list} columns={columns} total={data?.total || 0} page={page} pageSize={10} onPageChange={setPage} loading={isLoading} emptyTitle="知识库空空如也" />
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="queue">
            <Card withBorder radius="md" mb="md" p="md">
              <Group justify="space-between" align="end">
                <Box>
                  <Text fw={700}>处理任务队列</Text>
                  <Text size="sm" c="dimmed">
                    这里会展示文档向量化状态、失败原因和失败后的重新处理入口。
                  </Text>
                </Box>
                <Select
                  placeholder="全部状态"
                  data={[
                    { value: "0", label: "待处理" },
                    { value: "1", label: "处理中" },
                    { value: "2", label: "已完成" },
                    { value: "3", label: "处理失败" },
                  ]}
                  clearable
                  value={taskStatus}
                  onChange={setTaskStatus}
                  w={180}
                />
              </Group>
            </Card>
            <Card withBorder radius="md">
              <CommonTable
                data={taskData?.list}
                columns={taskColumns}
                total={taskData?.total || 0}
                page={taskPage}
                pageSize={8}
                onPageChange={setTaskPage}
                loading={taskLoading}
                emptyTitle="当前没有需要关注的知识处理任务"
              />
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </PageAnimate>
  );
}
