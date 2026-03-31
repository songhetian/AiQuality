import { useState } from "react";
import {
  Box,
  Card,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  ActionIcon,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconUserPlus,
  IconSearch,
  IconEdit,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { CommonTable } from "../../components/table/CommonTable";
import api from "../../lib/axios";

type PagedResult<T> = {
  list: T[];
  total: number;
};

type UserRole = {
  id: string;
  name?: string | null;
};

type Department = {
  name?: string | null;
};

type UserItem = {
  id: string;
  username?: string | null;
  department?: Department | null;
  roles?: UserRole[];
  status?: number | null;
  createTime?: string | null;
};

export default function UserPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PagedResult<UserItem>>({
    queryKey: ["users", page, debouncedSearch],
    queryFn: async () =>
      (
        await api.get("/user/list", {
          params: { page, pageSize: 10, username: debouncedSearch },
        })
      ).data
  });

  const columns = [
    { key: 'username', title: '用户名', render: (item: UserItem) => <Text fw={500}>{item.username}</Text> },
    { key: 'deptName', title: '所属组织', render: (item: UserItem) => item.department?.name || "未分配" },
    { 
      key: 'roles', 
      title: '角色', 
      render: (item: UserItem) => (
        <Group gap={4}>
          {item.roles?.map((role) => (
            <Badge key={role.id} size="xs" variant="outline" color="green">{role.name}</Badge>
          ))}
        </Group>
      ) 
    },
    { 
      key: 'status', 
      title: '状态', 
      render: (item: UserItem) => (
        <Badge color={item.status === 1 ? "green" : "red"} variant="dot">
          {item.status === 1 ? "正常" : "锁定"}
        </Badge>
      ) 
    },
    { 
      key: 'createTime', 
      title: '创建时间', 
      render: (item: UserItem) => <Text size="xs" c="dimmed">{item.createTime ? new Date(item.createTime).toLocaleDateString() : "--"}</Text>
    },
    { 
      key: 'actions', 
      title: '操作', 
      render: () => (
        <Group gap={4}>
          <ActionIcon variant="subtle" color="green"><IconEdit size={16} /></ActionIcon>
          <ActionIcon variant="subtle" color="blue"><IconShieldLock size={16} /></ActionIcon>
        </Group>
      ) 
    },
  ];

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="用户与角色权限"
          description="管理系统访问账号、组织归属及功能权限分配"
          rightSection={
            <Button leftSection={<IconUserPlus size={18} />}>新增用户</Button>
          }
        />
        
        <Card withBorder radius="md">
          <Group mb="md">
            <TextInput
              placeholder="搜索用户名/手机号..."
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1 }}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Select placeholder="所属平台" data={["平台A", "平台B"]} clearable />
            <Select placeholder="用户状态" data={["启用", "禁用"]} clearable />
          </Group>

          <CommonTable 
            data={data?.list} 
            columns={columns} 
            total={data?.total || 0} 
            page={page} 
            pageSize={10} 
            onPageChange={setPage} 
            loading={isLoading}
            emptyIcon={IconUsers}
            emptyTitle="暂无用户数据"
          />
        </Card>
      </Box>
    </PageAnimate>
  );
}
