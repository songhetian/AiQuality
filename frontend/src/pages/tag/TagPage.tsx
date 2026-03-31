import { useState } from 'react';
import { 
  Button, Group, TextInput, Select, Modal, Box, Badge, 
  Card, ActionIcon, Text, Stack, Tabs, rem
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconTags, IconRobot, IconCheck, IconX, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageAnimate } from '../../components/ui/PageAnimate';
import { CommonTable } from '../../components/table/CommonTable';
import api from '../../lib/axios';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '../../store/authStore';

type PagedResult<T> = {
  list: T[];
  total: number;
};

type TagItem = {
  tagCode: string;
  tagName?: string | null;
  tagType?: string | null;
  applyDimension?: string | null;
  dimensionDetail?: string | null;
  description?: string | null;
  aiMatchRule?: string | null;
  status?: number | null;
};

type TagAuditItem = {
  id: string;
  tagName?: string | null;
  reason?: string | null;
};

type DeleteTagResult = {
  mode?: 'deleted' | 'disabled';
  relationCount?: number;
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
  return typeof message === 'string' && message.trim() ? message : fallback;
};

export default function TagPage() {
  const queryClient = useQueryClient();
  const { user, permissions } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string | null>('formal');
  const [opened, setOpened] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tagType, setTagType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>('1');
  const [formTagName, setFormTagName] = useState('');
  const [formTagType, setFormTagType] = useState<string | null>('规范类');
  const [formApplyDimension, setFormApplyDimension] = useState<string | null>('部门');
  const [formDimensionDetail, setFormDimensionDetail] = useState('all');
  const [formDescription, setFormDescription] = useState('');
  const [formAiMatchRule, setFormAiMatchRule] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const canEdit = permissions.includes('tag:edit');
  const canAudit = permissions.includes('tag:audit');

  const { data: formalData, isLoading: formalLoading } = useQuery<PagedResult<TagItem>>({
    queryKey: ['tags', page, debouncedSearch, tagType, status],
    queryFn: async () => (
      await api.get("/tag/list", {
        params: {
          page,
          pageSize: 10,
          tagName: debouncedSearch || undefined,
          tagType: tagType || undefined,
          status: status || undefined,
        },
      })
    ).data,
    enabled: activeTab === 'formal'
  });

  const { data: auditData, isLoading: auditLoading } = useQuery<TagAuditItem[]>({
    queryKey: ['tags-audit'],
    queryFn: async () => (await api.get("/tag/audit/list")).data,
    enabled: activeTab === 'discovery'
  });

  const auditMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: number }) => api.post(`/tag/audit/${id}`, { status }),
    onSuccess: () => {
      notifications.show({ title: '操作成功', message: '已更新标签发现状态', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['tags-audit'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post('/tag', {
        tagName: formTagName.trim(),
        tagType: formTagType,
        applyDimension: formApplyDimension || '部门',
        dimensionDetail: formDimensionDetail.trim() || 'all',
        description: formDescription.trim() || undefined,
        aiMatchRule: formAiMatchRule.trim() || undefined,
        createBy: user?.id || 'SYSTEM_AI',
        deptId: formApplyDimension === '部门' ? user?.deptId || undefined : undefined,
      }),
    onSuccess: () => {
      notifications.show({ title: '创建成功', message: '新标签已加入正式标签库', color: 'green' });
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '创建失败',
        message: getErrorMessage(error, '当前标签暂时无法创建'),
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      api.put(`/tag/${editingTag?.tagCode}`, {
        tagName: formTagName.trim(),
        tagType: formTagType,
        applyDimension: formApplyDimension || '部门',
        dimensionDetail: formDimensionDetail.trim() || 'all',
        description: formDescription.trim() || null,
        aiMatchRule: formAiMatchRule.trim() || null,
      }),
    onSuccess: () => {
      notifications.show({ title: '更新成功', message: '标签信息已保存', color: 'green' });
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '更新失败',
        message: getErrorMessage(error, '当前标签暂时无法更新'),
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation<DeleteTagResult, unknown, string>({
    mutationFn: async (tagCode: string) =>
      (await api.delete(`/tag/delete/${tagCode}`)).data,
    onSuccess: (result) => {
      notifications.show({
        title: result.mode === 'disabled' ? '标签已停用' : '删除成功',
        message:
          result.mode === 'disabled'
            ? `标签已被 ${result.relationCount || 0} 条历史记录引用，已自动改为停用`
            : '标签已从正式标签库移除',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: '删除失败',
        message: getErrorMessage(error, '当前标签暂时无法删除'),
        color: 'red',
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (item: TagItem) =>
      api.put(`/tag/${item.tagCode}/status`, {
        status: item.status === 1 ? 0 : 1,
      }),
    onSuccess: (_result, item) => {
      notifications.show({
        title: item.status === 1 ? '已停用' : '已启用',
        message: `标签“${item.tagName || '-'}”状态已更新`,
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const resetForm = () => {
    setFormTagName('');
    setFormTagType('规范类');
    setFormApplyDimension('部门');
    setFormDimensionDetail('all');
    setFormDescription('');
    setFormAiMatchRule('');
  };

  const openCreateModal = () => {
    setEditingTag(null);
    resetForm();
    setOpened(true);
  };

  const openEditModal = (item: TagItem) => {
    setEditingTag(item);
    setFormTagName(item.tagName || '');
    setFormTagType(item.tagType || '规范类');
    setFormApplyDimension(item.applyDimension || '部门');
    setFormDimensionDetail(item.dimensionDetail || 'all');
    setFormDescription(item.description || '');
    setFormAiMatchRule(item.aiMatchRule || '');
    setOpened(true);
  };

  const closeModal = () => {
    setOpened(false);
    setEditingTag(null);
    resetForm();
  };

  const formalColumns = [
    { key: 'tagName', title: '名称', render: (item: TagItem) => <Text fw={600} c="green.9">{item.tagName}</Text> },
    { key: 'tagType', title: '分类', render: (item: TagItem) => <Badge variant="dot" color={item.tagType === '违规类' ? 'red' : 'blue'}>{item.tagType}</Badge> },
    { key: 'applyDimension', title: '维度', render: (item: TagItem) => <Badge variant="light" color="green">{item.applyDimension}</Badge> },
    { key: 'status', title: '状态', render: (item: TagItem) => <Badge color={item.status === 1 ? 'green' : 'gray'} variant="filled">{item.status === 1 ? '启用' : '禁用'}</Badge> },
    { key: 'actions', title: '操作', render: (item: TagItem) => (
      <Group gap="xs">
        {canEdit && (
          <ActionIcon variant="subtle" color="green" onClick={() => openEditModal(item)}><IconEdit size={16} /></ActionIcon>
        )}
        {canEdit && (
          <ActionIcon
            variant="subtle"
            color={item.status === 1 ? 'orange' : 'green'}
            loading={toggleStatusMutation.isPending && toggleStatusMutation.variables?.tagCode === item.tagCode}
            onClick={() => toggleStatusMutation.mutate(item)}
          >
            {item.status === 1 ? <IconToggleRight size={16} /> : <IconToggleLeft size={16} />}
          </ActionIcon>
        )}
        {canEdit && (
          <ActionIcon
            variant="subtle"
            color="red"
            loading={deleteMutation.isPending && deleteMutation.variables === item.tagCode}
            onClick={() => deleteMutation.mutate(item.tagCode)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    )}
  ];

  const discoveryColumns = [
    { key: 'tagName', title: '建议标签名', render: (item: TagAuditItem) => <Text fw={700}>{item.tagName}</Text> },
    { key: 'reason', title: '发现理由', render: (item: TagAuditItem) => <Text size="sm" c="dimmed" style={{ maxWidth: rem(400) }}>{item.reason}</Text> },
    { key: 'actions', title: '审核操作', render: (item: TagAuditItem) => (
      <Group gap="xs">
        {canAudit ? (
          <>
            <Button size="xs" variant="light" color="green" leftSection={<IconCheck size={14} />} onClick={() => auditMutation.mutate({ id: item.id, status: 1 })}>转为正式</Button>
            <Button size="xs" variant="light" color="gray" leftSection={<IconX size={14} />} onClick={() => auditMutation.mutate({ id: item.id, status: 2 })}>忽略</Button>
          </>
        ) : (
          <Text size="sm" c="dimmed">当前账号没有审核权限</Text>
        )}
      </Group>
    )}
  ];

  return (
    <PageAnimate>
      <Box>
        <PageHeader 
          title="标签管理中心" 
          description="定义质检维度与业务分类，支持 AI 自动发现新特征"
          rightSection={canEdit ? <Button leftSection={<IconPlus size={18} />} onClick={openCreateModal}>创建新标签</Button> : undefined}
        />

        <Tabs value={activeTab} onChange={setActiveTab} color="green" variant="pills" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="formal" leftSection={<IconTags size={16} />}>正式标签库</Tabs.Tab>
            <Tabs.Tab value="discovery" leftSection={<IconRobot size={16} />}>AI 自动发现</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="formal">
            <Card withBorder radius="md" shadow="sm">
              <Group mb="md">
                <TextInput placeholder="搜索正式标签..." leftSection={<IconSearch size={16} />} style={{ flex: 1 }} value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
                <Select placeholder="类型过滤" data={['违规类', '规范类', '其他类', 'AI发现']} clearable value={tagType} onChange={setTagType} />
                <Select
                  placeholder="状态过滤"
                  data={[
                    { value: '1', label: '启用' },
                    { value: '0', label: '禁用' },
                  ]}
                  clearable
                  value={status}
                  onChange={setStatus}
                />
              </Group>
              <CommonTable data={formalData?.list} columns={formalColumns} total={formalData?.total || 0} page={page} pageSize={10} onPageChange={setPage} loading={formalLoading} emptyIcon={IconTags} emptyTitle="暂无正式标签" />
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="discovery">
            <Card withBorder radius="md" shadow="sm">
              <CommonTable data={auditData} columns={discoveryColumns} total={auditData?.length || 0} page={1} pageSize={100} onPageChange={() => {}} loading={auditLoading} emptyIcon={IconRobot} emptyTitle="AI 暂未发现新特征" />
            </Card>
          </Tabs.Panel>
        </Tabs>

        <Modal opened={opened} onClose={closeModal} title={editingTag ? '修改标签' : '新标签'} radius="md">
          <Stack gap="md">
            <TextInput label="名称" required value={formTagName} onChange={(event) => setFormTagName(event.currentTarget.value)} />
            <Select label="分类" data={['违规类', '规范类', '其他类', 'AI发现']} value={formTagType} onChange={setFormTagType} />
            <Select label="适用维度" data={['部门', '全平台']} value={formApplyDimension} onChange={setFormApplyDimension} />
            <TextInput label="维度详情" value={formDimensionDetail} onChange={(event) => setFormDimensionDetail(event.currentTarget.value)} placeholder="例如 all、售后组、天猫平台" />
            <TextInput label="自动匹配规则" value={formAiMatchRule} onChange={(event) => setFormAiMatchRule(event.currentTarget.value)} placeholder="支持填写正则，用于 AI 自动打标" />
            <TextInput label="说明" value={formDescription} onChange={(event) => setFormDescription(event.currentTarget.value)} placeholder="补充标签用途和适用场景" />
            <Group justify="flex-end">
              <Button variant="default" onClick={closeModal}>取消</Button>
              <Button
                loading={createMutation.isPending || updateMutation.isPending}
                disabled={!formTagName.trim() || !formTagType || !formApplyDimension}
                onClick={() => {
                  if (editingTag) {
                    updateMutation.mutate();
                    return;
                  }
                  createMutation.mutate();
                }}
              >
                {editingTag ? '保存修改' : '创建标签'}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
    </PageAnimate>
  );
}
