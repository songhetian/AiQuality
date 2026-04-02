import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconEdit, IconPlus, IconSearch, IconToggleLeft, IconToggleRight } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import { PageAnimate } from "../../components/ui/PageAnimate";
import api from "../../lib/axios";
import { uiTokens } from "../../components/ui/uiTokens";

type KeywordItem = {
  id: string;
  word?: string | null;
  type?: string | null;
  deptId?: string | null;
  status?: number | null;
  createTime?: string | null;
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

export default function KeywordPage() {
  const queryClient = useQueryClient();
  const [word, setWord] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<KeywordItem | null>(null);
  const [newWord, setNewWord] = useState("");
  const [newType, setNewType] = useState<string | null>("服务规范");

  const { data = [], isLoading } = useQuery<KeywordItem[]>({
    queryKey: ["keywords", word, type, status],
    queryFn: async () =>
      (
        await api.get("/keyword/list", {
          params: {
            word: word || undefined,
            type: type || undefined,
            status: status || undefined,
          },
        })
      ).data,
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post("/keyword", {
        word: newWord,
        type: newType,
      }),
    onSuccess: () => {
      notifications.show({
        title: "添加成功",
        message: "敏感词已加入规则库，后续聊天将自动参与检测",
        color: "green",
      });
      setOpened(false);
      setNewWord("");
      setNewType("服务规范");
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "添加失败",
        message: getErrorMessage(error, "当前敏感词暂时无法保存"),
        color: "red",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      api.put(`/keyword/${editingItem?.id}`, {
        word: newWord,
        type: newType,
      }),
    onSuccess: () => {
      notifications.show({
        title: "更新成功",
        message: "敏感词规则已更新",
        color: "green",
      });
      setOpened(false);
      setEditingItem(null);
      setNewWord("");
      setNewType("服务规范");
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "更新失败",
        message: getErrorMessage(error, "当前敏感词暂时无法更新"),
        color: "red",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: KeywordItem) =>
      api.put(`/keyword/${item.id}/status`, {
        status: item.status === 1 ? 0 : 1,
      }),
    onSuccess: (_result, item) => {
      notifications.show({
        title: item.status === 1 ? "已停用" : "已启用",
        message: `敏感词“${item.word || "-"}”状态已更新`,
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: "状态更新失败",
        message: getErrorMessage(error, "无法修改当前敏感词状态"),
        color: "red",
      });
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setNewWord("");
    setNewType("服务规范");
    setOpened(true);
  };

  const openEditModal = (item: KeywordItem) => {
    setEditingItem(item);
    setNewWord(item.word || "");
    setNewType(item.type || "服务规范");
    setOpened(true);
  };

  const closeModal = () => {
    setOpened(false);
    setEditingItem(null);
    setNewWord("");
    setNewType("服务规范");
  };

  const columns = [
    {
      key: "word",
      title: "敏感词",
      render: (item: KeywordItem) => <Text fw={600}>{item.word || "-"}</Text>,
    },
    {
      key: "type",
      title: "分类",
      render: (item: KeywordItem) => <Badge variant="light">{item.type || "-"}</Badge>,
    },
    {
      key: "deptId",
      title: "作用范围",
      render: (item: KeywordItem) => (
        <Text size="sm" c="dimmed">{item.deptId || "全平台"}</Text>
      ),
    },
    {
      key: "status",
      title: "状态",
      render: (item: KeywordItem) => (
        <Badge color={item.status === 1 ? "green" : "gray"} variant="light">
          {item.status === 1 ? "启用" : "停用"}
        </Badge>
      ),
    },
    {
      key: "createTime",
      title: "创建时间",
      render: (item: KeywordItem) => (
        <Text size="sm" c="dimmed">
          {item.createTime ? new Date(item.createTime).toLocaleString() : "--"}
        </Text>
      ),
    },
    {
      key: "actions",
      title: "操作",
      render: (item: KeywordItem) => (
        <Group gap={6}>
          <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(item)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color={item.status === 1 ? "orange" : "green"}
            loading={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === item.id}
            onClick={() => toggleStatusMutation.mutate(item)}
          >
            {item.status === 1 ? <IconToggleRight size={16} /> : <IconToggleLeft size={16} />}
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="敏感词管理"
          description="维护聊天违规关键词，支撑实时预警、违规记录和质检联动判断"
          rightSection={
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              新增敏感词
            </Button>
          }
        />

        <Card
          withBorder
          radius="lg"
          mb="md"
          p="md"
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
          <Group gap="md" wrap="nowrap" align="end">
            <TextInput
              placeholder="搜索敏感词..."
              leftSection={<IconSearch size={16} />}
              value={word}
              onChange={(event) => setWord(event.currentTarget.value)}
              styles={{ root: { flexGrow: 1 } }}
            />
            <Select
              placeholder="分类"
              data={["服务规范", "营销违规", "售后风险", "合规管控"]}
              clearable
              value={type}
              onChange={setType}
              styles={{ root: { flexGrow: 1 } }}
            />
            <Select
              placeholder="状态"
              data={[
                { value: "1", label: "启用" },
                { value: "0", label: "停用" },
              ]}
              clearable
              value={status}
              onChange={setStatus}
              styles={{ root: { flexGrow: 1 } }}
            />
          </Group>
        </Card>

        <Card withBorder radius="md">
          <CommonTable
            data={data}
            columns={columns}
            total={data.length}
            page={1}
            pageSize={Math.max(data.length, 1)}
            onPageChange={() => {}}
            loading={isLoading}
            emptyTitle="当前还没有敏感词规则"
          />
        </Card>

        <Modal
          opened={opened}
          onClose={closeModal}
          title={editingItem ? "编辑敏感词" : "新增敏感词"}
          centered
          radius="md"
        >
          <Stack gap="md">
            <TextInput
              label="敏感词"
              placeholder="例如：返钱、私下转账、辱骂词"
              value={newWord}
              onChange={(event) => setNewWord(event.currentTarget.value)}
            />
            <Select
              label="分类"
              data={["服务规范", "营销违规", "售后风险", "合规管控"]}
              value={newType}
              onChange={setNewType}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={closeModal}>
                取消
              </Button>
              <Button
                loading={createMutation.isPending || updateMutation.isPending}
                disabled={!newWord.trim() || !newType}
                onClick={() => {
                  if (editingItem) {
                    updateMutation.mutate();
                    return;
                  }
                  createMutation.mutate();
                }}
              >
                {editingItem ? "保存修改" : "保存"}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
