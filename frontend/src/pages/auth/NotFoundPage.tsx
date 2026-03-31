import { Button, Card, Center, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowLeft, IconHome, IconMoodSearch } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateToPreviousOrHome } from "./errorPageNavigation";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Center mih="100vh" px="md">
      <Card withBorder radius="lg" p="xl" maw={560} w="100%">
        <Stack align="center" gap="md">
          <ThemeIcon size={64} radius="xl" color="grape" variant="light">
            <IconMoodSearch size={32} />
          </ThemeIcon>
          <Text fw={800} size="1.6rem">
            页面不存在
          </Text>
          <Text c="dimmed" ta="center">
            你访问的地址可能已经变更、被删除，或者当前链接本身就不正确。
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
