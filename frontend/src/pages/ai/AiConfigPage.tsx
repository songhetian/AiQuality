import { useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  NumberInput,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconRobot,
  IconShieldLock,
  IconPlugConnected,
} from "@tabler/icons-react";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAuthStore } from "../../store/authStore";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import api from "../../lib/axios";

type AiConfig = {
  baseUrl: string;
  chatModel: string;
  embeddingModel: string;
  timeoutMs: number;
  retries: number;
  vectorSize: number;
  apiKeyConfigured: boolean;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type AiDraftValues = {
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  embeddingModel: string;
  timeoutMs: number | string;
  retries: number | string;
  vectorSize: number | string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError | undefined)?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const toAiDraftValues = (config?: AiConfig | null): AiDraftValues => ({
  baseUrl: config?.baseUrl || "",
  apiKey: "",
  chatModel: config?.chatModel || "",
  embeddingModel: config?.embeddingModel || "",
  timeoutMs: config?.timeoutMs || 15000,
  retries: config?.retries || 2,
  vectorSize: config?.vectorSize || 1536,
});

const buildAiChangeSummary = (before: AiDraftValues, after: AiDraftValues) => {
  const changes: string[] = [];

  if (before.baseUrl.trim() !== after.baseUrl.trim()) changes.push("服务地址");
  if (before.chatModel.trim() !== after.chatModel.trim()) changes.push("对话模型");
  if (before.embeddingModel.trim() !== after.embeddingModel.trim()) changes.push("向量模型");
  if (Number(before.timeoutMs) !== Number(after.timeoutMs)) changes.push("超时时间");
  if (Number(before.retries) !== Number(after.retries)) changes.push("重试次数");
  if (Number(before.vectorSize) !== Number(after.vectorSize)) changes.push("向量维度");
  if (after.apiKey.trim()) changes.push("接口密钥");

  return changes;
};

const getFieldHint = (changed: boolean, saving: boolean) => {
  if (saving) {
    return "正在保存";
  }

  if (changed) {
    return "已修改";
  }

  return undefined;
};

export default function AiConfigPage() {
  const queryClient = useQueryClient();
  const { roles, permissions } = useAuthStore();
  const canEdit = roles.includes("SUPER_ADMIN") || permissions.includes("ai-config:edit");
  const [draft, setDraft] = useState<AiDraftValues | null>(null);

  const { data, isLoading } = useQuery<AiConfig>({
    queryKey: ["ai-config"],
    queryFn: async () => (await api.get("/settings/ai-config")).data,
  });

  const baselineValues = toAiDraftValues(data);
  const formValues = draft || baselineValues;
  const pendingChanges = buildAiChangeSummary(baselineValues, formValues);
  const changedMap = {
    baseUrl: baselineValues.baseUrl.trim() !== formValues.baseUrl.trim(),
    apiKey: Boolean(formValues.apiKey.trim()),
    chatModel: baselineValues.chatModel.trim() !== formValues.chatModel.trim(),
    embeddingModel: baselineValues.embeddingModel.trim() !== formValues.embeddingModel.trim(),
    timeoutMs: Number(baselineValues.timeoutMs) !== Number(formValues.timeoutMs),
    retries: Number(baselineValues.retries) !== Number(formValues.retries),
    vectorSize: Number(baselineValues.vectorSize) !== Number(formValues.vectorSize),
  };

  const updateDraft = (patch: Partial<AiDraftValues>) => {
    setDraft({
      ...formValues,
      ...patch,
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () =>
      api.put("/settings/ai-config", {
        baseUrl: formValues.baseUrl,
        apiKey: formValues.apiKey.trim() || undefined,
        chatModel: formValues.chatModel,
        embeddingModel: formValues.embeddingModel,
        timeoutMs: Number(formValues.timeoutMs),
        retries: Number(formValues.retries),
        vectorSize: Number(formValues.vectorSize),
      }),
    onSuccess: (response) => {
      const nextValues = toAiDraftValues(response.data);
      const changedFields = buildAiChangeSummary(baselineValues, formValues);
      notifications.show({
        title: "保存成功",
        message: changedFields.length
          ? `本次已更新：${changedFields.join("、")}`
          : "配置已保存，新的调用会优先使用数据库配置",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["ai-config"] });
      queryClient.invalidateQueries({ queryKey: ["settings-overview"] });
      setDraft(nextValues);
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "保存失败",
        message: getErrorMessage(error, "当前智能服务配置暂时无法保存"),
        color: "red",
      });
    },
  });
  const isSaving = saveMutation.isPending;
  const hasUnsavedChanges = canEdit && pendingChanges.length > 0;
  useUnsavedChangesGuard(
    hasUnsavedChanges || isSaving,
    isSaving ? "配置正在保存，请稍候再离开当前页面。" : "AI 配置还有未保存的变更，确定要离开当前页面吗？",
    
  );

  const testMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post("/settings/ai-config/test", {
          baseUrl: formValues.baseUrl,
          apiKey: formValues.apiKey.trim() || undefined,
          timeoutMs: Number(formValues.timeoutMs),
        })
      ).data,
    onSuccess: (result: { message?: string; modelCount?: number }) => {
      notifications.show({
        title: "连接成功",
        message:
          result.modelCount !== undefined
            ? `${result.message || "连接成功"}，共返回 ${result.modelCount} 个模型`
            : result.message || "连接成功",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "连接失败",
        message: getErrorMessage(error, "当前智能服务暂时无法连通"),
        color: "red",
      });
    },
  });

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="智能服务接入配置"
          description="页面化管理外部智能服务地址、模型参数和调用重试策略"
        />

        {!canEdit && (
          <Alert mb="md" color="yellow" icon={<IconShieldLock size={16} />}>
            当前账号只有查看权限，无法修改智能服务配置。
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, xl: 3 }} mb="md">
          <Card withBorder radius="md" p="lg">
            <Group justify="space-between" mb="sm">
              <Text fw={700}>接入状态</Text>
              <Badge color={data?.apiKeyConfigured ? "green" : "yellow"} variant="light">
                {data?.apiKeyConfigured ? "已配置 Key" : "待配置 Key"}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              当前质检分析、向量检索和知识召回会优先读取这里保存的智能服务配置。
            </Text>
          </Card>
          <Card withBorder radius="md" p="lg">
            <Group justify="space-between" mb="sm">
              <Text fw={700}>模型概览</Text>
              <IconRobot size={18} />
            </Group>
            <Stack gap={6}>
              <Text size="sm">对话模型：{data?.chatModel || "-"}</Text>
              <Text size="sm">向量模型：{data?.embeddingModel || "-"}</Text>
              <Text size="sm">向量维度：{data?.vectorSize || 0}</Text>
            </Stack>
          </Card>
          <Card withBorder radius="md" p="lg">
            <Text fw={700} mb="sm">运行策略</Text>
            <Stack gap={6}>
              <Text size="sm">超时：{data?.timeoutMs || 0} ms</Text>
              <Text size="sm">重试次数：{data?.retries || 0}</Text>
              <Text size="sm">服务地址：{data?.baseUrl || "-"}</Text>
            </Stack>
          </Card>
        </SimpleGrid>

        <Card withBorder radius="md" p="lg">
          <Stack gap="md">
            <Text fw={700}>编辑配置</Text>
            <Alert color={isSaving ? "blue" : pendingChanges.length ? "teal" : "gray"} icon={<IconAlertCircle size={16} />}>
              {isSaving
                ? "配置正在保存，请暂时不要关闭页面或重复提交。"
                : pendingChanges.length
                ? `待保存变更：${pendingChanges.join("、")}`
                : "当前没有未保存的配置变更"}
            </Alert>
            <TextInput
              label="服务地址"
              description={getFieldHint(changedMap.baseUrl, isSaving)}
              value={formValues.baseUrl}
              onChange={(event) => updateDraft({ baseUrl: event.currentTarget.value })}
              disabled={!canEdit || isLoading || isSaving}
              placeholder="https://api.openai.com/v1"
            />
            <PasswordInput
              label="接口密钥"
              description={getFieldHint(changedMap.apiKey, isSaving)}
              value={formValues.apiKey}
              onChange={(event) => updateDraft({ apiKey: event.currentTarget.value })}
              disabled={!canEdit || isLoading || isSaving}
              placeholder={data?.apiKeyConfigured ? "留空则保持现有密钥不变" : "输入新的接口密钥"}
            />
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <TextInput
                label="对话模型"
                description={getFieldHint(changedMap.chatModel, isSaving)}
                value={formValues.chatModel}
                onChange={(event) => updateDraft({ chatModel: event.currentTarget.value })}
                disabled={!canEdit || isLoading || isSaving}
              />
              <TextInput
                label="向量模型"
                description={getFieldHint(changedMap.embeddingModel, isSaving)}
                value={formValues.embeddingModel}
                onChange={(event) => updateDraft({ embeddingModel: event.currentTarget.value })}
                disabled={!canEdit || isLoading || isSaving}
              />
              <NumberInput
                label="超时 (ms)"
                description={getFieldHint(changedMap.timeoutMs, isSaving)}
                value={formValues.timeoutMs}
                onChange={(value) => updateDraft({ timeoutMs: value })}
                disabled={!canEdit || isLoading || isSaving}
                min={1000}
                max={120000}
              />
              <NumberInput
                label="重试次数"
                description={getFieldHint(changedMap.retries, isSaving)}
                value={formValues.retries}
                onChange={(value) => updateDraft({ retries: value })}
                disabled={!canEdit || isLoading || isSaving}
                min={0}
                max={10}
              />
              <NumberInput
                label="向量维度"
                description={getFieldHint(changedMap.vectorSize, isSaving)}
                value={formValues.vectorSize}
                onChange={(value) => updateDraft({ vectorSize: value })}
                disabled={!canEdit || isLoading || isSaving}
                min={128}
                max={8192}
              />
            </SimpleGrid>
            <Alert color="blue" icon={<IconAlertCircle size={16} />}>
              保存后，新的智能服务请求会优先读取数据库配置；接口密钥留空时不会覆盖已有值。
            </Alert>
            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={!hasUnsavedChanges || isSaving}
                onClick={() => setDraft(baselineValues)}
              >
                恢复已保存配置
              </Button>
              <Button
                variant="default"
                leftSection={<IconPlugConnected size={16} />}
                loading={testMutation.isPending}
                disabled={!canEdit || !formValues.baseUrl.trim() || isSaving}
                onClick={() => testMutation.mutate()}
              >
                测试连接
              </Button>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                loading={saveMutation.isPending}
                disabled={
                  !canEdit ||
                  !formValues.baseUrl.trim() ||
                  !formValues.chatModel.trim() ||
                  !formValues.embeddingModel.trim()
                }
                onClick={() => saveMutation.mutate()}
              >
                保存配置
              </Button>
            </Group>
          </Stack>
        </Card>
      </Box>
    </PageAnimate>
  );
}
