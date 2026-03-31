import { Button, Card, Center, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowLeft, IconHome, IconLockAccess } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateToPreviousOrHome } from "./errorPageNavigation";

type UnauthorizedState = {
  requiredPermission?: string;
  requiredRoles?: string[];
};

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as UnauthorizedState;

  return (
    <Center mih="100vh" px="md">
      <Card withBorder radius="lg" p="xl" maw={520} w="100%">
        <Stack align="center" gap="md">
          <ThemeIcon size={64} radius="xl" color="yellow" variant="light">
            <IconLockAccess size={32} />
          </ThemeIcon>
          <Text fw={800} size="1.5rem">
            无权访问当前页面
          </Text>
          <Text c="dimmed" ta="center">
            你的账号尚未分配访问这个功能所需的权限。
            {state.requiredPermission ? ` 当前缺少权限：${state.requiredPermission}` : ""}
            {state.requiredRoles?.length
              ? ` 当前需要角色：${state.requiredRoles.join(" / ")}`
              : ""}
            {location.pathname ? ` 当前路径：${location.pathname}` : ""}
          </Text>
          <Group>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigateToPreviousOrHome(navigate)}
            >
              返回上一页
            </Button>
            <Button leftSection={<IconHome size={16} />} onClick={() => navigate("/", { replace: true })}>
              返回首页
            </Button>
          </Group>
        </Stack>
      </Card>
    </Center>
  );
}
