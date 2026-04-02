import {
  Tabs,
  rem,
  Card,
  Text,
  Box,
  Group,
  Button,
  Table,
  ActionIcon,
  Badge,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconBuilding,
  IconHierarchy2,
  IconBuildingStore,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { uiTokens } from "../../components/ui/uiTokens";
import axios from "axios";

type PlatformItem = {
  id: string;
  name?: string | null;
  code?: string | null;
  status?: number | null;
};

type DepartmentItem = {
  id: string;
  name?: string | null;
  platform?: {
    name?: string | null;
  } | null;
};

export default function OrganizationPage() {
  // ... rest of component logic
  const iconStyle = { width: rem(16), height: rem(16) };

  const { data: platforms, isLoading: platformLoading } = useQuery<PlatformItem[]>({
    queryKey: ["platforms"],
    queryFn: async () => (await axios.get("/api/platform/list")).data?.data,
  });

  const { data: depts, isLoading: deptLoading } = useQuery<DepartmentItem[]>({
    queryKey: ["depts"],
    queryFn: async () => (await axios.get("/api/dept/list")).data?.data,
  });

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="组织架构"
          description="管理雷犀系统的平台、多级部门及业务店铺，实现数据行级隔离"
        />
        {/* ... tabs content */}
        <Tabs variant="pills" defaultValue="platform" color="green" radius="md">
          <Tabs.List mb="xl">
            <Tabs.Tab
              value="platform"
              leftSection={<IconBuilding style={iconStyle} />}
            >
              平台中心
            </Tabs.Tab>
            <Tabs.Tab
              value="dept"
              leftSection={<IconHierarchy2 style={iconStyle} />}
            >
              部门层级
            </Tabs.Tab>
            <Tabs.Tab
              value="shop"
              leftSection={<IconBuildingStore style={iconStyle} />}
            >
              业务店铺
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="platform">
            <Card withBorder radius="md" shadow="sm">
              <Group justify="space-between" mb="lg">
                <Box>
                  <Text fw={700} c="green.9">
                    平台接入列表
                  </Text>
                  <Text size="xs" c="dimmed">
                    对接外部客服系统或自有后端的顶级实体
                  </Text>
                </Box>
                <Button size="xs" leftSection={<IconPlus size={14} />}>
                  新增接入
                </Button>
              </Group>

              <Box pos="relative">
                <LoadingOverlay visible={platformLoading} />
                {platforms?.length === 0 ? (
                  <EmptyState
                    icon={IconBuilding}
                    title="暂无平台配置"
                    description="请先添加一个第三方平台或自有系统"
                  />
                ) : (
                  <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead style={{ background: uiTokens.background.tableHead }}>
                      <Table.Tr>
                        <Table.Th>平台名称</Table.Th>
                        <Table.Th>唯一编码</Table.Th>
                        <Table.Th>状态</Table.Th>
                        <Table.Th>操作</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {platforms?.map((p) => (
                        <Table.Tr key={p.id}>
                          <Table.Td fw={500}>{p.name}</Table.Td>
                          <Table.Td>
                            <Badge color="gray" variant="light" radius="xs">
                              {p.code}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={p.status === 1 ? "green" : "red"}
                              variant="dot"
                            >
                              {p.status === 1 ? "运行中" : "已禁用"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4}>
                              <ActionIcon variant="subtle" color="green">
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon variant="subtle" color="red">
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Box>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="dept">
            <Card withBorder radius="md" shadow="sm">
              <Group justify="space-between" mb="lg">
                <Box>
                  <Text fw={700} c="green.9">
                    内部部门树
                  </Text>
                  <Text size="xs" c="dimmed">
                    基于层级的权限管理与向量数据库分区隔离
                  </Text>
                </Box>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                >
                  创建部门
                </Button>
              </Group>
              <Box pos="relative">
                <LoadingOverlay visible={deptLoading} />
                {depts?.length === 0 ? (
                  <EmptyState
                    icon={IconHierarchy2}
                    title="部门树空空如也"
                    description="建立部门层级是实现数据权限隔离的基础"
                  />
                ) : (
                  <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead style={{ background: uiTokens.background.tableHead }}>
                      <Table.Tr>
                        <Table.Th>部门名称</Table.Th>
                        <Table.Th>所属平台</Table.Th>
                        <Table.Th>管理权限</Table.Th>
                        <Table.Th>操作</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {depts?.map((d) => (
                        <Table.Tr key={d.id}>
                          <Table.Td fw={500}>{d.name}</Table.Td>
                          <Table.Td>
                            <Badge variant="outline" color="blue">
                              {d.platform?.name}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              管理员、质检员
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon variant="subtle" color="green">
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Box>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="shop">
            <Card withBorder radius="md" shadow="sm">
              <EmptyState
                icon={IconBuildingStore}
                title="请先选择部门"
                description="店铺是业务的最细粒度，需挂载在具体部门下"
              />
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </PageAnimate>
  );
}
