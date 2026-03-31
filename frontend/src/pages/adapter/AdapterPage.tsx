import { useState } from "react";
import {
  ActionIcon,
  Switch,
  Alert,
  Badge,
  Box,
  Button,
  Modal,
  Card,
  Checkbox,
  Code,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconApi,
  IconAlertCircle,
  IconArrowsShuffle,
  IconDatabaseImport,
  IconEdit,
  IconEye,
  IconPlus,
  IconPlugConnected,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "../../components/ui/PageHeader";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import { useSearchParams } from "react-router-dom";
import api from "../../lib/axios";

type AdapterMapping = {
  id: string;
  thirdPartyFields?: string | null;
  systemFields?: string | null;
  formatMapping?: string | null;
};

type AdapterItem = {
  id: string;
  name: string;
  type?: string | null;
  url?: string | null;
  method?: string | null;
  headers?: string | null;
  authParams?: string | null;
  status?: number | null;
  enableFakeData?: boolean | null;
  platform?: {
    id?: string | null;
    name?: string | null;
    code?: string | null;
  } | null;
  department?: {
    id?: string | null;
    name?: string | null;
  } | null;
  mappings?: AdapterMapping[];
  fakeData?: Array<{
    fakeData?: string | null;
  }>;
};

type ConfigOption = {
  id: string;
  name?: string | null;
  code?: string | null;
  platformId?: string | null;
};

type AdapterPreviewResult = {
  normalized?: Record<string, unknown>;
  preview?: {
    sessionId?: string | null;
    senderType?: string | null;
    sendTime?: string | null;
    isSessionEnd?: boolean | null;
    matchedShop?: {
      id?: string | null;
      name?: string | null;
      code?: string | null;
    } | null;
  };
};

type AdapterCollectResult = {
  list?: Array<Record<string, unknown>>;
  persisted?: {
    sessionCount?: number;
    recordCount?: number;
    alertCount?: number;
  };
};

type AdapterMonitorItem = {
  id: string;
  responseTime?: number | null;
  successRate?: number | null;
  status?: string | null;
  createTime?: string | null;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type AdapterConfigValues = {
  name: string;
  type: string | null;
  url: string;
  method: string | null;
  platformId: string | null;
  deptId: string | null;
  headers: string;
  authParams: string;
  mappings: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError | undefined)?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const prettyJson = (value: unknown) => JSON.stringify(value, null, 2);

const parseJsonInput = <T,>(raw: string, label: string): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${label} 不是合法的 JSON`);
  }
};

const buildAdapterChangeSummary = (
  before: AdapterConfigValues,
  after: AdapterConfigValues,
) => {
  const changes: string[] = [];

  if (before.name.trim() !== after.name.trim()) changes.push("接口名称");
  if (before.type !== after.type) changes.push("接口类型");
  if (before.url.trim() !== after.url.trim()) changes.push("请求地址");
  if (before.method !== after.method) changes.push("请求方式");
  if (before.platformId !== after.platformId) changes.push("所属平台");
  if (before.deptId !== after.deptId) changes.push("所属部门");
  if (before.headers.trim() !== after.headers.trim()) changes.push("请求头");
  if (before.authParams.trim() !== after.authParams.trim()) changes.push("认证参数");
  if (before.mappings.trim() !== after.mappings.trim()) changes.push("字段映射");

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

const getRequestMethodLabel = (method?: string | null) => {
  if (method === "POST") {
    return "提交";
  }

  if (method === "GET") {
    return "获取";
  }

  return method || "-";
};

const getMonitorStatusLabel = (status?: string | null) => {
  if (status === "ONLINE") {
    return "在线";
  }

  if (status === "OFFLINE") {
    return "离线";
  }

  return "未知";
};

export default function AdapterPage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<string | null>(null);
  const [persistEnabled, setPersistEnabled] = useState(false);
  const [fakeDataDrafts, setFakeDataDrafts] = useState<Record<string, string>>({});
  const [configOpened, setConfigOpened] = useState(false);
  const [editingAdapter, setEditingAdapter] = useState<AdapterItem | null>(null);
  const [configName, setConfigName] = useState("");
  const [configType, setConfigType] = useState<string | null>("THIRD_PARTY");
  const [configUrl, setConfigUrl] = useState("");
  const [configMethod, setConfigMethod] = useState<string | null>("GET");
  const [configPlatformId, setConfigPlatformId] = useState<string | null>(null);
  const [configDeptId, setConfigDeptId] = useState<string | null>(null);
  const [configHeaders, setConfigHeaders] = useState("{}");
  const [configAuthParams, setConfigAuthParams] = useState("{}");
  const [configMappings, setConfigMappings] = useState(
    prettyJson([
      {
        thirdPartyFields: "session_id",
        systemFields: "sessionId",
        formatMapping: "",
      },
    ]),
  );
  const [payloadInput, setPayloadInput] = useState(
    prettyJson({
      session_id: "session_demo_001",
      sender_type: "CUSTOMER",
      sender_id: "buyer_1001",
      content: "你好，我想咨询一下退货规则",
      content_type: "TEXT",
      send_time: new Date().toISOString(),
      is_session_end: false,
      shop_code: "SHOP_DEMO",
    }),
  );

  const { data: interfaces = [], isLoading } = useQuery<AdapterItem[]>({
    queryKey: ["adapter-interfaces"],
    queryFn: async () => (await api.get("/adapter/list")).data,
  });

  const { data: configOptions } = useQuery<{
    platforms: ConfigOption[];
    departments: ConfigOption[];
  }>({
    queryKey: ["adapter-config-options"],
    queryFn: async () => (await api.get("/adapter/config-options")).data,
  });

  const requestedInterfaceId = searchParams.get("interfaceId");
  const effectiveInterfaceId = selectedInterfaceId || requestedInterfaceId || interfaces[0]?.id || null;
  const selectedAdapter =
    interfaces.find((item) => item.id === effectiveInterfaceId) || null;
  const defaultPlatformId = configOptions?.platforms?.[0]?.id || null;
  const configBaseline: AdapterConfigValues = editingAdapter
    ? {
        name: editingAdapter.name || "",
        type: editingAdapter.type || "THIRD_PARTY",
        url: editingAdapter.url || "",
        method: editingAdapter.method || "GET",
        platformId: editingAdapter.platform?.id || null,
        deptId: editingAdapter.department?.id || null,
        headers: editingAdapter.headers || "{}",
        authParams: editingAdapter.authParams || "{}",
        mappings: prettyJson(
          (editingAdapter.mappings || []).map((mapping) => ({
            thirdPartyFields: mapping.thirdPartyFields || "",
            systemFields: mapping.systemFields || "",
            formatMapping: mapping.formatMapping || "",
          })),
        ),
      }
    : {
        name: "",
        type: "THIRD_PARTY",
        url: "",
        method: "GET",
        platformId: defaultPlatformId,
        deptId: null,
        headers: "{}",
        authParams: "{}",
        mappings: prettyJson([
          {
            thirdPartyFields: "session_id",
            systemFields: "sessionId",
            formatMapping: "",
          },
        ]),
      };
  const currentConfigValues: AdapterConfigValues = {
    name: configName,
    type: configType,
    url: configUrl,
    method: configMethod,
    platformId: configPlatformId,
    deptId: configDeptId,
    headers: configHeaders,
    authParams: configAuthParams,
    mappings: configMappings,
  };
  const configChangeSummary = buildAdapterChangeSummary(configBaseline, currentConfigValues);
  const configChangedMap = {
    name: configBaseline.name.trim() !== currentConfigValues.name.trim(),
    type: configBaseline.type !== currentConfigValues.type,
    url: configBaseline.url.trim() !== currentConfigValues.url.trim(),
    method: configBaseline.method !== currentConfigValues.method,
    platformId: configBaseline.platformId !== currentConfigValues.platformId,
    deptId: configBaseline.deptId !== currentConfigValues.deptId,
    headers: configBaseline.headers.trim() !== currentConfigValues.headers.trim(),
    authParams: configBaseline.authParams.trim() !== currentConfigValues.authParams.trim(),
    mappings: configBaseline.mappings.trim() !== currentConfigValues.mappings.trim(),
  };
  const selectedFakeData = selectedAdapter?.fakeData?.[0]?.fakeData;
  const defaultFakeDataInput = (() => {
    if (!selectedFakeData) {
      return prettyJson([]);
    }

    try {
      return prettyJson(JSON.parse(selectedFakeData) as unknown);
    } catch {
      return selectedFakeData;
    }
  })();
  const fakeDataInput =
    (effectiveInterfaceId && fakeDataDrafts[effectiveInterfaceId]) || defaultFakeDataInput;

  const { data: monitorData = [], isFetching: monitorLoading } = useQuery<AdapterMonitorItem[]>({
    queryKey: ["adapter-monitor", effectiveInterfaceId],
    queryFn: async () =>
      (await api.get("/adapter/monitor", { params: { interfaceId: effectiveInterfaceId } })).data,
    enabled: !!effectiveInterfaceId,
    refetchInterval: 10000,
  });

  const previewMutation = useMutation<AdapterPreviewResult, Error, void>({
    mutationFn: async () => {
      const payload = parseJsonInput<Record<string, unknown>>(payloadInput, "示例载荷");
      const response = await api.post(`/adapter/preview/${effectiveInterfaceId}`, payload);
      return response.data;
    },
    onError: (error) => {
      notifications.show({
        title: "映射预览失败",
        message: getErrorMessage(error, "请检查数据格式和当前字段映射配置"),
        color: "red",
      });
    },
  });

  const collectMutation = useMutation<AdapterCollectResult, Error, void>({
    mutationFn: async () => {
      const response = await api.post(`/adapter/collect/${effectiveInterfaceId}`, {
        persist: persistEnabled,
      });
      return response.data;
    },
    onSuccess: (result) => {
      const persisted = result.persisted;
      notifications.show({
        title: "采集完成",
        message: persistEnabled
          ? `已落库 ${persisted?.recordCount || 0} 条消息，触达 ${persisted?.sessionCount || 0} 个会话`
          : `已完成预采集，共返回 ${(result.list || []).length} 条映射结果`,
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "采集失败",
        message: getErrorMessage(error, "当前接口暂时无法采集，请检查配置与网络"),
        color: "red",
      });
    },
  });

  const toggleFakeModeMutation = useMutation({
    mutationFn: async (enable: boolean) =>
      api.post(`/adapter/fake-mode/${effectiveInterfaceId}`, { enable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adapter-interfaces"] });
      notifications.show({
        title: "模式已更新",
        message: "接口适配的示例数据模式已切换",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "切换失败",
        message: getErrorMessage(error, "无法切换当前接口的示例数据模式"),
        color: "red",
      });
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      const parsedHeaders = parseJsonInput<Record<string, unknown>>(configHeaders, "请求头配置");
      const parsedAuthParams = parseJsonInput<Record<string, unknown>>(
        configAuthParams,
        "认证参数",
      );
      const parsedMappings = parseJsonInput<
        Array<{
          thirdPartyFields: string;
          systemFields: string;
          formatMapping?: string;
        }>
      >(configMappings, "字段映射配置");

      if (!Array.isArray(parsedMappings)) {
        throw new Error("字段映射配置必须是数组");
      }

      const payload = {
        name: configName.trim(),
        type: configType,
        url: configUrl.trim(),
        method: configMethod,
        platformId: configPlatformId,
        deptId: configDeptId || null,
        headers: prettyJson(parsedHeaders),
        authParams: prettyJson(parsedAuthParams),
        enableFakeData: Boolean(editingAdapter?.enableFakeData),
        status: editingAdapter?.status === 0 ? 0 : 1,
        mappings: parsedMappings,
      };

      if (editingAdapter?.id) {
        return api.put(`/adapter/${editingAdapter.id}`, payload);
      }

      return api.post("/adapter", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adapter-interfaces"] });
      notifications.show({
        title: editingAdapter ? "更新成功" : "创建成功",
        message: editingAdapter
          ? configChangeSummary.length
            ? `本次已更新：${configChangeSummary.join("、")}`
            : "接口配置已保存"
          : "新的接口配置已创建，可以立即开始联调",
        color: "green",
      });
      closeConfigModal();
    },
    onError: (error: unknown) => {
      notifications.show({
        title: editingAdapter ? "更新失败" : "创建失败",
        message: getErrorMessage(error, "请检查接口配置和映射内容"),
        color: "red",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: AdapterItem) =>
      api.put(`/adapter/${item.id}/status`, {
        status: item.status === 1 ? 0 : 1,
      }),
    onSuccess: (_result, item) => {
      queryClient.invalidateQueries({ queryKey: ["adapter-interfaces"] });
      notifications.show({
        title: item.status === 1 ? "接口已停用" : "接口已启用",
        message: `接口“${item.name}”状态已更新`,
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "状态更新失败",
        message: getErrorMessage(error, "无法切换当前接口状态"),
        color: "red",
      });
    },
  });

  const saveFakeDataMutation = useMutation({
    mutationFn: async () =>
      api.post(`/adapter/fake-data/${effectiveInterfaceId}`, {
        data: parseJsonInput<unknown>(fakeDataInput, "FakeData 示例数据"),
        
        scene: "manual",
      }),
    onSuccess: () => {
      if (effectiveInterfaceId) {
        setFakeDataDrafts((current) => {
          const next = { ...current };
          delete next[effectiveInterfaceId];
          return next;
        });
      }
      queryClient.invalidateQueries({ queryKey: ["adapter-interfaces"] });
      notifications.show({
        title: "示例数据已保存",
        message: "示例数据已更新，可直接用于预采集或联调验证",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "保存失败",
        message: getErrorMessage(error, "请检查数据格式后重试"),
        color: "red",
      });
    },
  });
  const isSavingConfig = saveConfigMutation.isPending;
  const hasConfigUnsavedChanges = configOpened && configChangeSummary.length > 0;
  const { confirmDiscard } = useUnsavedChangesGuard(
    hasConfigUnsavedChanges || isSavingConfig,
    isSavingConfig ? "接口配置正在保存，请稍候再离开当前页面。" : "接口配置还有未保存的变更，确定要离开当前页面吗？",
  );

  const interfaceOptions = interfaces.map((item) => ({
    value: item.id,
    label: `${item.name} · ${item.platform?.name || "未知平台"}`,
  }));

  const platformOptions = (configOptions?.platforms || []).map((item) => ({
    value: item.id,
    label: `${item.name || "未命名平台"}${item.code ? ` · ${item.code}` : ""}`,
  }));

  const departmentOptions = (configOptions?.departments || [])
    .filter((item) => !configPlatformId || item.platformId === configPlatformId)
    .map((item) => ({
      value: item.id,
      label: `${item.name || "未命名部门"}${item.code ? ` · ${item.code}` : ""}`,
    }));

  const resetCreateForm = () => {
    setEditingAdapter(null);
    setConfigName("");
    setConfigType("THIRD_PARTY");
    setConfigUrl("");
    setConfigMethod("GET");
    setConfigPlatformId(platformOptions[0]?.value || null);
    setConfigDeptId(null);
    setConfigHeaders("{}");
    setConfigAuthParams("{}");
    setConfigMappings(
      prettyJson([
        {
          thirdPartyFields: "session_id",
          systemFields: "sessionId",
          formatMapping: "",
        },
      ]),
    );
  };

  const resetEditForm = (item: AdapterItem) => {
    setEditingAdapter(item);
    setConfigName(item.name || "");
    setConfigType(item.type || "THIRD_PARTY");
    setConfigUrl(item.url || "");
    setConfigMethod(item.method || "GET");
    setConfigPlatformId(item.platform?.id || null);
    setConfigDeptId(item.department?.id || null);
    setConfigHeaders(item.headers || "{}");
    setConfigAuthParams(item.authParams || "{}");
    setConfigMappings(
      prettyJson(
        (item.mappings || []).map((mapping) => ({
          thirdPartyFields: mapping.thirdPartyFields || "",
          systemFields: mapping.systemFields || "",
          formatMapping: mapping.formatMapping || "",
        })),
      ),
    );
  };

  const openCreateModal = () => {
    if (!confirmDiscard()) {
      return;
    }

    resetCreateForm();
    setConfigOpened(true);
  };

  const openEditModal = (item: AdapterItem) => {
    if (!confirmDiscard()) {
      return;
    }

    resetEditForm(item);
    setConfigOpened(true);
  };

  const closeConfigModal = () => {
    if (!confirmDiscard()) {
      return;
    }

    setConfigOpened(false);
    setEditingAdapter(null);
  };

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="接口适配"
          description="联调第三方客服接口、预览字段映射结果，并执行预采集或补录落库"
          rightSection={
            <Group>
              <Button
                variant="default"
                leftSection={<IconPlus size={16} />}
                onClick={openCreateModal}
              >
                新建接口
              </Button>
              <Select
                placeholder="选择适配接口"
                data={interfaceOptions}
                value={effectiveInterfaceId}
                onChange={setSelectedInterfaceId}
                w={320}
                searchable
              />
              <Button
                leftSection={<IconEye size={16} />}
                disabled={!effectiveInterfaceId}
                loading={previewMutation.isPending}
                onClick={() => previewMutation.mutate()}
              >
                预览映射
              </Button>
              <Button
                color="green"
                leftSection={<IconDatabaseImport size={16} />}
                disabled={!effectiveInterfaceId}
                loading={collectMutation.isPending}
                onClick={() => collectMutation.mutate()}
              >
                执行采集
              </Button>
            </Group>
          }
        />

        {!selectedAdapter && !isLoading && (
          <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
            当前没有可用的接口适配配置，请先在数据库中初始化 `AdapterInterface` 和映射字段。
            
          </Alert>
        )}

        {selectedAdapter && (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, xl: 3 }}>
              <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="sm">
                  <Text fw={700}>接口概览</Text>
                  <Group gap={8}>
                    <Badge color={selectedAdapter.status === 1 ? "green" : "red"} variant="light">
                      {selectedAdapter.status === 1 ? "启用中" : "已停用"}
                    </Badge>
                    <ActionIcon variant="subtle" color="green" onClick={() => openEditModal(selectedAdapter)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color={selectedAdapter.status === 1 ? "orange" : "green"}
                      loading={
                        toggleStatusMutation.isPending &&
                        toggleStatusMutation.variables?.id === selectedAdapter.id
                      }
                      onClick={() => toggleStatusMutation.mutate(selectedAdapter)}
                    >
                      {selectedAdapter.status === 1 ? (
                        <IconToggleRight size={16} />
                      ) : (
                        <IconToggleLeft size={16} />
                      )}
                    </ActionIcon>
                  </Group>
                </Group>
                <Stack gap={6}>
                  <Text size="sm">名称：{selectedAdapter.name}</Text>
                  <Text size="sm">平台：{selectedAdapter.platform?.name || "-"}</Text>
                  <Text size="sm">部门：{selectedAdapter.department?.name || "全平台"}</Text>
                  <Text size="sm">类型：{selectedAdapter.type || "-"}</Text>
                  <Text size="sm">方式：{getRequestMethodLabel(selectedAdapter.method)}</Text>
                </Stack>
              </Card>

              <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="sm">
                  <Text fw={700}>联调配置</Text>
                  <Badge color={selectedAdapter.enableFakeData ? "blue" : "gray"} variant="light">
                    {selectedAdapter.enableFakeData ? "示例数据模式已开启" : "真实接口模式"}
                  </Badge>
                </Group>
                <Code block>{selectedAdapter.url || "-"}</Code>
                <Checkbox
                  mt="md"
                  checked={persistEnabled}
                  onChange={(event) => setPersistEnabled(event.currentTarget.checked)}
                  label="采集后直接落库，用于补录历史聊天数据"
                />
                <Text size="xs" c="dimmed" mt="xs">
                  关闭时只做预采集和映射验证；开启后会生成聊天记录，并联动违规/质检链路。
                </Text>
                <Switch
                  mt="md"
                  checked={Boolean(selectedAdapter.enableFakeData)}
                  onChange={(event) =>
                    toggleFakeModeMutation.mutate(event.currentTarget.checked)
                  }
                  label="启用示例数据模式"
                  description="开启后将优先使用示例数据而不请求真实第三方接口"
                />
              </Card>

              <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="sm">
                  <Text fw={700}>最近监控</Text>
                  <IconPlugConnected size={18} />
                </Group>
                <Stack gap="xs">
                  {monitorLoading ? (
                    <Text size="sm" c="dimmed">正在同步采集监控...</Text>
                  ) : monitorData.length > 0 ? (
                    monitorData.slice(0, 3).map((item) => (
                      <Paper key={item.id} withBorder radius="md" p="sm">
                        <Group justify="space-between">
                          <Badge color={item.status === "ONLINE" ? "green" : "red"} variant="light">
                            {getMonitorStatusLabel(item.status)}
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {item.createTime ? new Date(item.createTime).toLocaleString() : "--"}
                          </Text>
                        </Group>
                        <Text size="sm" mt={6}>响应时间：{item.responseTime || 0} ms</Text>
                        <Text size="sm">成功率：{item.successRate || 0}%</Text>
                      </Paper>
                    ))
                  ) : (
                    <Text size="sm" c="dimmed">当前还没有监控数据。</Text>
                  )}
                </Stack>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, xl: 2 }}>
              <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="sm">
                  <Text fw={700}>示例载荷</Text>
                  <IconApi size={18} />
                </Group>
                <Textarea
                  minRows={18}
                  autosize
                  value={payloadInput}
                  onChange={(event) => setPayloadInput(event.currentTarget.value)}
                placeholder='请输入数据示例，例如 {"session_id":"xxx"}'
                />
              </Card>

              <Card withBorder radius="md" p="lg">
                <Group justify="space-between" mb="sm">
                  <Text fw={700}>映射结果</Text>
                  <IconArrowsShuffle size={18} />
                </Group>
                {previewMutation.data ? (
                  <Stack gap="md">
                    <Paper withBorder radius="md" p="md">
                      <Text size="sm" fw={600} mb="xs">预览摘要</Text>
                      <Stack gap={4}>
                        <Text size="sm">会话 ID：{previewMutation.data.preview?.sessionId || "-"}</Text>
                        <Text size="sm">发送方：{previewMutation.data.preview?.senderType || "-"}</Text>
                        <Text size="sm">发送时间：{previewMutation.data.preview?.sendTime || "-"}</Text>
                        <Text size="sm">
                          匹配店铺：{previewMutation.data.preview?.matchedShop?.name || "未匹配"}
                        </Text>
                      </Stack>
                    </Paper>
                    <Paper withBorder radius="md" p="md">
                      <Text size="sm" fw={600} mb="xs">标准化结果</Text>
                      <Code block>{prettyJson(previewMutation.data.normalized || {})}</Code>
                    </Paper>
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">
                    选择接口后输入示例载荷，点击“预览映射”即可看到标准化结果和店铺匹配情况。
                  </Text>
                )}
              </Card>
            </SimpleGrid>

            <Card withBorder radius="md" p="lg">
              <Group justify="space-between" mb="sm">
                <Text fw={700}>示例数据</Text>
                <Button
                  size="xs"
                  variant="light"
                  loading={saveFakeDataMutation.isPending}
                  onClick={() => saveFakeDataMutation.mutate()}
                >
                  保存示例数据
                </Button>
              </Group>
              <Text size="sm" c="dimmed" mb="sm">
                适用于新平台联调、字段映射验证和离线补录前的预演。
              </Text>
              <Textarea
                minRows={14}
                autosize
                value={fakeDataInput}
                onChange={(event) => {
                  if (!effectiveInterfaceId) {
                    return;
                  }
                  setFakeDataDrafts((current) => ({
                    ...current,
                    [effectiveInterfaceId]: event.currentTarget.value,
                  }));
                }}
                placeholder={selectedFakeData || "请输入数组或对象格式的示例响应数据"}
              />
            </Card>

            <Card withBorder radius="md" p="lg">
              <Text fw={700} mb="sm">字段映射</Text>
              <Text size="sm" c="dimmed" mb="md">
                这里展示第三方返回字段如何转换成系统可识别的标准字段，便于确认会话、发送方、消息内容和发送时间是否能被正确识别。
              </Text>
              <Stack gap="xs">
                {(selectedAdapter.mappings || []).map((mapping) => (
                  <Paper key={mapping.id} withBorder radius="md" p="sm">
                    <Stack gap={8}>
                      <Group justify="space-between" align="flex-start">
                        <Box>
                          <Text size="sm" fw={600}>系统字段：{mapping.systemFields || "-"}</Text>
                          <Text size="xs" c="dimmed">第三方字段：{mapping.thirdPartyFields || "-"}</Text>
                        </Box>
                        {mapping.formatMapping && (
                          <Badge variant="outline" color="green">转换规则：{mapping.formatMapping}</Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        用途说明：
                        {mapping.systemFields === "sessionId"
                          ? " 用于识别同一个会话。"
                          : mapping.systemFields === "senderType"
                            ? " 用于区分买家、客服等发送方身份。"
                            : mapping.systemFields === "sendTime"
                              ? " 用于还原消息发送时间和排序。"
                              : mapping.systemFields === "content"
                                ? " 用于记录消息正文，支撑质检、检索和洞察分析。"
                                : " 该字段会参与系统标准化处理。"}
                      </Text>
                    </Stack>
                  </Paper>
                ))}
                {(selectedAdapter.mappings || []).length === 0 && (
                  <Text size="sm" c="dimmed">当前接口还没有配置字段映射。</Text>
                )}
              </Stack>
            </Card>
          </Stack>
        )}

        <Modal
          opened={configOpened}
          onClose={closeConfigModal}
          title={editingAdapter ? "编辑接口配置" : "新建接口配置"}
          size="xl"
          centered
          radius="md"
        >
          <Stack gap="md">
            <Alert color={isSavingConfig ? "blue" : configChangeSummary.length ? "teal" : "gray"} icon={<IconAlertCircle size={16} />}>
              {isSavingConfig
                ? "接口配置正在保存，请暂时不要关闭弹窗或重复提交。"
                : editingAdapter
                ? configChangeSummary.length
                  ? `待保存变更：${configChangeSummary.join("、")}`
                  : "当前没有未保存的接口配置变更"
                : "创建后会保存当前接口信息与字段映射配置"}
            </Alert>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <TextInput
                label="接口名称"
                description={getFieldHint(configChangedMap.name, isSavingConfig)}
                value={configName}
                onChange={(event) => setConfigName(event.currentTarget.value)}
                disabled={isSavingConfig}
                placeholder="例如：天猫客服回调接口"
              />
              <Select
                label="接口类型"
                description={getFieldHint(configChangedMap.type, isSavingConfig)}
                data={[
                  { value: "THIRD_PARTY", label: "第三方平台" },
                  { value: "SELF_BACKEND", label: "自有后端" },
                ]}
                value={configType}
                onChange={setConfigType}
                disabled={isSavingConfig}
              />
              <TextInput
                label="请求地址"
                description={getFieldHint(configChangedMap.url, isSavingConfig)}
                value={configUrl}
                onChange={(event) => setConfigUrl(event.currentTarget.value)}
                disabled={isSavingConfig}
                placeholder="https://example.com/webhook"
              />
              <Select
                label="请求方式"
                description={getFieldHint(configChangedMap.method, isSavingConfig)}
                data={[
                  { value: "GET", label: "获取" },
                  { value: "POST", label: "提交" },
                ]}
                value={configMethod}
                onChange={setConfigMethod}
                disabled={isSavingConfig}
              />
              <Select
                label="所属平台"
                description={getFieldHint(configChangedMap.platformId, isSavingConfig)}
                data={platformOptions}
                value={configPlatformId}
                onChange={(value) => {
                  setConfigPlatformId(value);
                  setConfigDeptId(null);
                }}
                disabled={isSavingConfig}
                searchable
              />
              <Select
                label="所属部门"
                description={getFieldHint(configChangedMap.deptId, isSavingConfig)}
                data={departmentOptions}
                value={configDeptId}
                onChange={setConfigDeptId}
                disabled={isSavingConfig}
                clearable
                searchable
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <Textarea
                label="请求头配置"
                description={getFieldHint(configChangedMap.headers, isSavingConfig)}
                minRows={6}
                value={configHeaders}
                onChange={(event) => setConfigHeaders(event.currentTarget.value)}
                disabled={isSavingConfig}
                placeholder='{"鉴权信息":"Bearer xxx"}'
              />
              <Textarea
                label="认证参数"
                description={getFieldHint(configChangedMap.authParams, isSavingConfig)}
                minRows={6}
                value={configAuthParams}
                onChange={(event) => setConfigAuthParams(event.currentTarget.value)}
                disabled={isSavingConfig}
                placeholder='{"应用标识":"demo"}'
              />
            </SimpleGrid>

            <Textarea
              label="字段映射配置"
              description={getFieldHint(configChangedMap.mappings, isSavingConfig)}
              minRows={10}
              value={configMappings}
              onChange={(event) => setConfigMappings(event.currentTarget.value)}
              disabled={isSavingConfig}
              placeholder='[{"thirdPartyFields":"session_id","systemFields":"sessionId","formatMapping":""}]'
            />
            <Text size="xs" c="dimmed">
              映射请使用数组格式，每项包含来源字段、系统字段，以及可选的格式转换规则。
            </Text>
            <Alert color="gray" icon={<IconAlertCircle size={16} />}>
              常用系统字段示例：`sessionId` 表示会话编号，`senderType` 表示发送方身份，`content` 表示消息内容，`sendTime` 表示发送时间。
            </Alert>

            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={!hasConfigUnsavedChanges || isSavingConfig}
                onClick={() => {
                  if (editingAdapter) {
                    resetEditForm(editingAdapter);
                    return;
                  }
                  resetCreateForm();
                }}
              >
                恢复当前配置
              </Button>
              <Button variant="default" disabled={isSavingConfig} onClick={closeConfigModal}>
                取消
              </Button>
              <Button
                loading={saveConfigMutation.isPending}
                disabled={
                  !configName.trim() ||
                  !configType ||
                  !configUrl.trim() ||
                  !configMethod ||
                  !configPlatformId
                }
                onClick={() => saveConfigMutation.mutate()}
              >
                {editingAdapter ? "保存修改" : "创建接口"}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
