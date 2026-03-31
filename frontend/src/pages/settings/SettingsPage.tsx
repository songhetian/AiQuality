import { useState } from "react";
import {
  Tabs,
  Card,
  Text,
  Group,
  Button,
  Box,
  FileButton,
  Image,
  Paper,
  Stack,
  SimpleGrid,
  Badge,
  Code,
  Divider,
  List,
  ThemeIcon,
  Alert,
  Skeleton,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IconSettings,
  IconCloudUpload,
  IconDatabase,
  IconRobot,
  IconShieldCheck,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { notifications } from "@mantine/notifications";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/axios";

type SettingsOverview = {
  app: {
    name: string;
    env: string;
    version: string;
  };
  overview: {
    knowledgeCount: number;
    activeRuleCount: number;
    chatSessionCount: number;
    userCount: number;
  };
  storage: {
    endpoint: string;
    port: number;
    bucket: string;
    useSSL: boolean;
    maxUploadSizeMb: number;
    presignedTtlSeconds: number;
    allowedMimeTypes: string[];
  };
  knowledge: {
    maxUploadSizeMb: number;
    allowedMimeTypes: string[];
    chunkSize: number;
    chunkOverlap: number;
  };
  ai: {
    baseUrl: string;
    chatModel: string;
    embeddingModel: string;
    timeoutMs: number;
    retries: number;
    apiKeyConfigured: boolean;
  };
  vectorStore: {
    qdrantUrl: string;
    vectorSize: number;
  };
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string | null>("general");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const { roles, permissions } = useAuthStore();
  const canUpload = roles.includes("SUPER_ADMIN") || permissions.includes("file:upload");

  const { data, isLoading } = useQuery<SettingsOverview>({
    queryKey: ["settings-overview"],
    queryFn: async () => (await api.get("/settings/overview")).data,
  });

  const handleUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post<{ url?: string }>("/file/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedUrl(response.data?.url || null);
      notifications.show({
        title: "上传成功",
        message: "对象存储链路可用，文件已成功保存",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "上传失败",
        message: "请检查对象存储配置、网络连通性和权限设置",
        color: "red",
      });
    }
  };

  const renderOverviewCard = (title: string, value?: number, description?: string) => (
    <Card withBorder radius="md" p="lg">
      <Text size="sm" c="dimmed" mb={6}>
        {title}
      </Text>
      <Text fw={800} size="1.6rem" c="green.8">
        {value ?? 0}
      </Text>
      {description && (
        <Text size="xs" c="dimmed" mt={4}>
          {description}
        </Text>
      )}
    </Card>
  );

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="系统设置"
          description="查看系统运行参数、对象存储配置、知识库约束与 AI 服务接入状态"
        />

        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md" color="green">
          <Tabs.List mb="xl">
            <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
              系统概览
            </Tabs.Tab>
            <Tabs.Tab value="storage" leftSection={<IconCloudUpload size={16} />}>
              存储资源
            </Tabs.Tab>
            <Tabs.Tab value="knowledge" leftSection={<IconDatabase size={16} />}>
              知识配置
            </Tabs.Tab>
            <Tabs.Tab value="ai" leftSection={<IconRobot size={16} />}>
              AI 接入
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">
            <Stack gap="md">
              <Skeleton visible={isLoading} radius="md">
                <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }}>
                  {renderOverviewCard("知识文档数", data?.overview.knowledgeCount, "当前部门已入库的知识资产")}
                  {renderOverviewCard("可用质检规则", data?.overview.activeRuleCount, "聊天与质检页可直接使用")}
                  {renderOverviewCard("聊天会话数", data?.overview.chatSessionCount, "当前可查询的会话总量")}
                  {renderOverviewCard("用户数量", data?.overview.userCount, "当前范围内可登录账号")}
                </SimpleGrid>
              </Skeleton>

              <Skeleton visible={isLoading} radius="md">
                <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" align="flex-start" mb="md">
                    <Box>
                      <Text fw={700}>运行环境</Text>
                      <Text size="sm" c="dimmed">
                        当前页面展示的是服务端已加载的核心运行参数
                      </Text>
                    </Box>
                    <Badge color="green" variant="light">
                      {data?.app.env || "development"}
                    </Badge>
                  </Group>
                  <Group gap="sm" mb="sm">
                    <Code>{data?.app.name || "雷犀智能 AI 质检系统"}</Code>
                    <Code>{data?.app.version || "v1.0.0"}</Code>
                  </Group>
                  <Divider my="sm" />
                  <List
                    spacing="sm"
                    icon={
                      <ThemeIcon color="green" size={18} radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }
                  >
                    <List.Item>对象存储、知识库、向量检索与 AI 模型参数已统一纳入此页查看。</List.Item>
                    <List.Item>当前版本以“读取配置 + 上传验证 + 能力状态”作为设置页主体，而不是直接改写环境变量。</List.Item>
                    <List.Item>若需在线修改系统配置，建议后续接数据库配置表或配置中心。</List.Item>
                  </List>
                </Card>
              </Skeleton>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="storage">
            <Stack gap="md">
              <Skeleton visible={isLoading} radius="md">
                <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" align="center" mb="md">
                    <Box>
                      <Text fw={700}>对象存储配置</Text>
                      <Text size="sm" c="dimmed">
                        MinIO 上传、预签名访问和文件格式限制
                      </Text>
                    </Box>
                    <Badge color={data?.storage.useSSL ? "green" : "yellow"} variant="light">
                      {data?.storage.useSSL ? "SSL 已启用" : "HTTP 访问"}
                    </Badge>
                  </Group>
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">访问地址</Text>
                      <Code>{data?.storage.endpoint}:{data?.storage.port}</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">Bucket</Text>
                      <Code>{data?.storage.bucket || "-"}</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">上传上限</Text>
                      <Code>{data?.storage.maxUploadSizeMb || 0} MB</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">预签名有效期</Text>
                      <Code>{data?.storage.presignedTtlSeconds || 0} 秒</Code>
                    </Paper>
                  </SimpleGrid>
                </Card>
              </Skeleton>

              <Card withBorder radius="md" p="lg">
                <Text fw={700} mb="sm">
                  上传链路验证
                </Text>
                {!canUpload && (
                  <Alert color="yellow" mb="md" icon={<IconAlertCircle size={16} />}>
                    当前账号没有 `file:upload` 权限，只能查看配置，不能执行上传验证。
                  </Alert>
                )}
                <Group align="flex-start">
                  <Box>
                    <FileButton onChange={handleUpload} accept="image/png,image/jpeg" disabled={!canUpload}>
                      {(props) => (
                        <Button {...props} leftSection={<IconCloudUpload size={18} />} disabled={!canUpload}>
                          上传测试图片
                        </Button>
                      )}
                    </FileButton>
                    <Text size="xs" c="dimmed" mt="xs">
                      建议用于快速验证 MinIO 上传、URL 回显和浏览器访问链路。
                    </Text>
                  </Box>

                  {uploadedUrl && (
                    <Paper withBorder p="xs" radius="md">
                      <Text size="xs" mb="xs" fw={500}>
                        预览
                      </Text>
                      <Image src={uploadedUrl} radius="sm" h={120} w="auto" fit="contain" />
                      <Text size="xs" c="blue" mt="xs" style={{ wordBreak: "break-all" }}>
                        {uploadedUrl}
                      </Text>
                    </Paper>
                  )}
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="knowledge">
            <Skeleton visible={isLoading} radius="md">
              <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Box>
                    <Text fw={700}>知识库约束</Text>
                    <Text size="sm" c="dimmed">
                      上传限制、切片参数和向量检索基础配置
                    </Text>
                  </Box>
                  <Badge color="green" variant="light">
                    Vector Ready
                  </Badge>
                </Group>
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                  <Paper withBorder radius="md" p="md">
                    <Text size="xs" c="dimmed">知识文档上限</Text>
                    <Code>{data?.knowledge.maxUploadSizeMb || 0} MB</Code>
                  </Paper>
                  <Paper withBorder radius="md" p="md">
                    <Text size="xs" c="dimmed">向量维度</Text>
                    <Code>{data?.vectorStore.vectorSize || 0}</Code>
                  </Paper>
                  <Paper withBorder radius="md" p="md">
                    <Text size="xs" c="dimmed">Chunk Size</Text>
                    <Code>{data?.knowledge.chunkSize || 0}</Code>
                  </Paper>
                  <Paper withBorder radius="md" p="md">
                    <Text size="xs" c="dimmed">Chunk Overlap</Text>
                    <Code>{data?.knowledge.chunkOverlap || 0}</Code>
                  </Paper>
                </SimpleGrid>
                <Divider my="md" />
                <Text size="sm" fw={600} mb="xs">
                  允许的知识文档类型
                </Text>
                <Group gap="xs">
                  {(data?.knowledge.allowedMimeTypes || []).map((item) => (
                    <Badge key={item} variant="outline" color="green">
                      {item}
                    </Badge>
                  ))}
                  {(data?.knowledge.allowedMimeTypes || []).length === 0 && (
                    <Text size="sm" c="dimmed">未显式配置，将使用服务端默认格式白名单。</Text>
                  )}
                </Group>
              </Card>
            </Skeleton>
          </Tabs.Panel>

          <Tabs.Panel value="ai">
            <Skeleton visible={isLoading} radius="md">
              <Stack gap="md">
                <Card withBorder radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Box>
                      <Text fw={700}>模型服务配置</Text>
                      <Text size="sm" c="dimmed">
                        当前后端使用的对话模型、Embedding 模型和超时参数
                      </Text>
                    </Box>
                    <Badge color={data?.ai.apiKeyConfigured ? "green" : "yellow"} variant="light" leftSection={<IconShieldCheck size={12} />}>
                      {data?.ai.apiKeyConfigured ? "API Key 已配置" : "API Key 未配置"}
                    </Badge>
                  </Group>
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">AI Base URL</Text>
                      <Code>{data?.ai.baseUrl || "-"}</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">Qdrant 地址</Text>
                      <Code>{data?.vectorStore.qdrantUrl || "-"}</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">聊天模型</Text>
                      <Code>{data?.ai.chatModel || "-"}</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">Embedding 模型</Text>
                      <Code>{data?.ai.embeddingModel || "-"}</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">超时</Text>
                      <Code>{data?.ai.timeoutMs || 0} ms</Code>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="xs" c="dimmed">重试次数</Text>
                      <Code>{data?.ai.retries || 0}</Code>
                    </Paper>
                  </SimpleGrid>
                </Card>
              </Stack>
            </Skeleton>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </PageAnimate>
  );
}
