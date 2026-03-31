import { useState } from 'react';
import { 
  Paper, 
  Button, 
  Table, 
  Group, 
  ActionIcon, 
  Badge, 
  Modal, 
  MultiSelect, 
  Stack,
  Text
} from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconEdit, IconTrash, IconLockAccess } from '@tabler/icons-react';
import api from '../../lib/axios';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../components/ui/PageHeader';

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

      <Paper withBorder shadow="sm" radius="md">
        <Table verticalSpacing="sm">
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

      {/* 权限分配 Modal */}
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
  );
}
