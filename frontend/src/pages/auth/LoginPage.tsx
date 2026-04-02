import React, { useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBuildingBank,
  IconChecklist,
  IconLockAccess,
  IconShieldCheck,
  IconTimeline,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import type { AuthUser } from "../../store/authStore";
import { uiTokens } from "../../components/ui/uiTokens";

type LoginRole = {
  name: string;
};

type LoginResponse = {
  access_token: string;
  permissions?: string[];
  user: AuthUser & {
    roles?: LoginRole[];
  };
};

type ApiError = {
  userMessage?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

const overviewItems = [
  {
    icon: IconChecklist,
    title: "统一质检口径",
    description: "将规则、复核和整改记录放在同一套流程里，减少口径分散和重复沟通。",
  },
  {
    icon: IconTimeline,
    title: "覆盖关键运营链路",
    description: "从会话、风险到复盘，全量信息在一个后台里可追踪、可审计。",
  },
  {
    icon: IconShieldCheck,
    title: "适合多人协作",
    description: "支持部门、角色和权限隔离，更接近真实业务后台的使用场景。",
  },
];

const statusItems = ["权限控制", "审计留痕", "运行监控"];

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        username,
        password,
      });
      const roles = data.user.roles?.map((role) => role.name) || [];
      const permissions = data.permissions || [];

      setAuth(data.user, data.access_token, roles, permissions);

      notifications.show({
        title: "登录成功",
        message: `欢迎回来，${data.user.username}`,
        color: "blue",
      });

      navigate("/");
    } catch (err: unknown) {
      const resolvedError = err as ApiError | undefined;
      notifications.show({
        title: "登录失败",
        message:
          resolvedError?.response?.data?.message ||
          resolvedError?.userMessage ||
          "登录失败，请检查账号密码或服务连接状态。",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: uiTokens.background.loginShell,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <Container size={1120} w="100%">
        <Paper
          radius={24}
          style={{
            overflow: "hidden",
            border: `1px solid ${uiTokens.colors.border}`,
            background: uiTokens.colors.panelGlass,
            boxShadow: uiTokens.shadow.elevated,
          }}
        >
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
            <Box
              p={{ base: 28, md: 38, lg: 52 }}
              style={{
                minHeight: rem(640),
                background: uiTokens.background.loginBrand,
                color: uiTokens.colors.textOnDark,
                display: "flex",
              }}
            >
              <Stack justify="space-between" style={{ flex: 1 }}>
                <Stack gap="xl">
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      <ThemeIcon
                        size={44}
                        radius="md"
                        variant="filled"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: `1px solid ${uiTokens.colors.whiteAlphaStrong}`,
                          color: uiTokens.colors.textOnDark,
                        }}
                      >
                        <IconBuildingBank size={22} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="sm" c={uiTokens.colors.textOnDark}>
                          雷技质检后台
                        </Text>
                        <Text size="xs" c={uiTokens.colors.textOnDarkMuted}>
                          Enterprise Operations Console
                        </Text>
                      </Box>
                    </Group>
                    <Badge
                      variant="light"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: uiTokens.colors.textOnDark,
                        border: `1px solid ${uiTokens.colors.whiteAlphaStrong}`,
                      }}
                    >
                      内部系统
                    </Badge>
                  </Group>

                  <Box pt="lg">
                    <Text size="sm" fw={600} c={uiTokens.colors.textOnDarkSoft} mb="lg">
                      客服质检系统
                    </Text>
                    <Title
                      order={1}
                      style={{
                        color: uiTokens.colors.textOnDark,
                        fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
                        lineHeight: 1.06,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      更像真实业务后台的
                      <br />
                      质检与运营工作台
                    </Title>
                    <Text
                      mt="lg"
                      size="md"
                      c={uiTokens.colors.textOnDarkMuted}
                      maw={520}
                      style={{ lineHeight: 1.8 }}
                    >
                      聚焦规则执行、流程闭环和团队协作，不再用大面积渐变和装饰信息堆页面，而是回到稳定、清晰、可长期使用的后台体验。
                    </Text>
                  </Box>

                  <Group gap="sm">
                    {statusItems.map((item) => (
                      <Badge
                        key={item}
                        variant="light"
                        style={{
                          background: uiTokens.colors.whiteAlphaSoft,
                          color: uiTokens.colors.textOnDark,
                          border: `1px solid ${uiTokens.colors.whiteAlphaStrong}`,
                        }}
                      >
                        {item}
                      </Badge>
                    ))}
                  </Group>
                </Stack>

                <Stack gap="sm">
                  {overviewItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Paper
                        key={item.title}
                        radius="md"
                        p="md"
                        style={{
                          background: uiTokens.colors.whiteAlphaSoft,
                          border: `1px solid ${uiTokens.colors.whiteAlphaStrong}`,
                          boxShadow: "none",
                        }}
                      >
                        <Group align="flex-start" wrap="nowrap">
                          <ThemeIcon
                            size={36}
                            radius="md"
                            variant="filled"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              color: uiTokens.colors.textOnDark,
                            }}
                          >
                            <Icon size={18} />
                          </ThemeIcon>
                          <Box>
                            <Text fw={700} c={uiTokens.colors.textOnDark}>
                              {item.title}
                            </Text>
                            <Text size="sm" c={uiTokens.colors.textOnDarkMuted} mt={4}>
                              {item.description}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </Stack>
            </Box>

            <Box
              p={{ base: 24, md: 34, lg: 44 }}
              style={{
                background: uiTokens.background.loginPanel,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Paper
                radius={20}
                p={{ base: 22, sm: 28, lg: 30 }}
                maw={420}
                w="100%"
                pos="relative"
                style={{
                  border: `1px solid ${uiTokens.colors.border}`,
                  background: uiTokens.colors.panel,
                  boxShadow: uiTokens.shadow.cardElevated,
                }}
              >
                <LoadingOverlay visible={loading} overlayProps={{ radius: "lg", blur: 2 }} />

                <Stack gap="lg">
                  <Box>
                    <Group justify="space-between" align="center" mb="md">
                      <Box>
                        <Title order={2} c={uiTokens.colors.heading}>
                          登录系统
                        </Title>
                        <Text size="sm" c={uiTokens.colors.textMuted} mt={6}>
                          输入账号和密码进入后台管理界面。
                        </Text>
                      </Box>
                      <ThemeIcon
                        size={44}
                        radius="md"
                        variant="light"
                        color="blue"
                      >
                        <IconLockAccess size={20} />
                      </ThemeIcon>
                    </Group>

                    <Group gap={8}>
                      <Badge variant="light" color="green">
                        服务在线
                      </Badge>
                      <Badge variant="light" color="blue">
                        安全访问
                      </Badge>
                    </Group>
                  </Box>

                  <Divider />

                  <form onSubmit={handleLogin}>
                    <Stack gap="md">
                      <TextInput
                        label="账号"
                        placeholder="请输入用户名"
                        required
                        size="md"
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                      />

                      <PasswordInput
                        label="密码"
                        placeholder="请输入密码"
                        required
                        size="md"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                      />

                      <Group justify="space-between" mt={4}>
                        <Checkbox label="记住账号" color="blue" />
                        <Anchor component="button" size="sm" c={uiTokens.colors.primaryDeep} type="button">
                          忘记密码？
                        </Anchor>
                      </Group>

                      <Button
                        fullWidth
                        mt="sm"
                        type="submit"
                        color="blue"
                        radius="md"
                        size="md"
                        styles={{
                          root: {
                            height: 46,
                            background: uiTokens.background.successLine,
                            color: uiTokens.colors.whiteSolid,
                          },
                        }}
                      >
                        登录
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </Paper>
            </Box>
          </SimpleGrid>
        </Paper>
      </Container>
    </Box>
  );
}
