import { useState } from 'react';
import { 
  Box,
  Paper, 
  Button, 
  Table, 
  Group, 
  ActionIcon, 
  Badge, 
  Modal, 
  MultiSelect, 
  Stack,
  Text,
  rem
} from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconEdit, IconTrash, IconLockAccess } from '@tabler/icons-react';
import api from '../../lib/axios';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageAnimate } from '../../components/ui/PageAnimate';
import { uiTokens } from '../../components/ui/uiTokens';

type PermissionOption = {
  value: string;
  label: string;
};

type RolePermission = {
  id: string;
};

type RoleItem = {
  id: string;
  name?: string | null;
  description?: string | null;
  status?: number | null;
  isSystem?: boolean;
  permissions?: RolePermission[];
};

type PermissionItem = {
  id: string;
  name?: string | null;
  code?: string | null;
};

export default function RolePage() {
  const queryClient = useQueryClient();
  const [permModalOpened, setPermModalOpened] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  // 1. 获取角色列表
  const { data: roles = [] } = useQuery<RoleItem[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await api.get('/role/list');
      return data;
    }
  });

  // 2. 获取所有可用权限 (从数据库动态加载)
  const { data: allPermissions = [] } = useQuery<PermissionOption[]>({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data } = await api.get<PermissionItem[]>('/permission/list');
      return data.map((permission) => ({ value: permission.id, label: `${permission.name} (${permission.code})` }));
    }
  });

  const handleSavePerms = async () => {
    if (!selectedRole) return;
    try {
      await api.post(`/role/${selectedRole.id}/permissions`, { permissionIds: selectedPerms });
      notifications.show({ title: '成功', message: '权限分配成功', color: 'green' });
      setPermModalOpened(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    } catch {
      notifications.show({ title: '失败', message: '权限分配失败', color: 'red' });
    }
  };

  return (
    <PageAnimate>
      <Stack>
        <PageHeader 
          title="角色权限管理" 
          description="管理系统角色及其对应的功能权限"
          rightSection={
            <Button leftSection={<IconPlus size={16} />} color="green">
              新增角色
            </Button>
          }
        />

        <Paper
          withBorder
          shadow="sm"
          radius="lg"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderColor: uiTokens.colors.border,
            background:
              'radial-gradient(circle at top right, rgba(199, 240, 65, 0.12), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(245,255,248,0.98) 100%)',
            boxShadow: uiTokens.shadow.panel,
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: rem(120),
              height: rem(4),
              borderRadius: rem(uiTokens.radius.pill),
              background: `linear-gradient(90deg, ${uiTokens.colors.primary} 0%, ${uiTokens.colors.accent} 100%)`,
            }}
          />
          <Table
            verticalSpacing="sm"
            styles={{
              thead: {
                background:
                  'linear-gradient(180deg, rgba(240,255,244,0.96) 0%, rgba(233,252,239,0.96) 100%)',
              },
              th: {
                fontSize: 12,
                fontWeight: 800,
                color: uiTokens.colors.textMuted,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${uiTokens.colors.border}`,
              },
              td: {
                borderBottom: `1px solid ${uiTokens.colors.border}`,
              },
            }}
          >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>角色名称</Table.Th>
              <Table.Th>描述</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>权限数量</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {roles.map((role) => (
              <Table.Tr key={role.id}>
                <Table.Td>
                  <Group gap="xs">
                    <Text fw={500}>{role.name}</Text>
                    {role.isSystem && <Badge size="xs" color="blue">系统</Badge>}
                  </Group>
                </Table.Td>
                <Table.Td c="dimmed">{role.description || '-'}</Table.Td>
                <Table.Td>
                  <Badge color={role.status === 1 ? 'green' : 'gray'}>
                    {role.status === 1 ? '启用' : '禁用'}
                  </Badge>
                </Table.Td>
                <Table.Td>{role.permissions?.length || 0} 个权限</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon 
                      variant="light" 
                      color="blue" 
                      onClick={() => {
                        setSelectedRole(role);
                        setSelectedPerms(role.permissions?.map((permission) => permission.id) || []);
                        setPermModalOpened(true);
                      }}
                      title="分配权限"
                    >
                      <IconLockAccess size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="green">
                      <IconEdit size={16} />
                    </ActionIcon>
                    {!role.isSystem && (
                      <ActionIcon variant="light" color="red">
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          </Table>
        </Paper>

        <Modal 
          opened={permModalOpened} 
          onClose={() => {
            setPermModalOpened(false);
            setSelectedRole(null);
            setSelectedPerms([]);
          }} 
          title={`分配权限 - ${selectedRole?.name}`}
          size="lg"
        >
          <Stack>
            <MultiSelect
              label="功能权限"
              placeholder="请选择权限"
              data={allPermissions}
              value={selectedPerms}
              onChange={setSelectedPerms}
              searchable
              clearable
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setPermModalOpened(false)}>取消</Button>
              <Button color="green" onClick={handleSavePerms}>保存权限</Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </PageAnimate>
  );
}
