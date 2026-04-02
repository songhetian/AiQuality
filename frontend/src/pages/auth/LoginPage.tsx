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
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChartBar,
  IconReportSearch,
  IconShieldCheck,
  IconTopologyStar3,
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
  response?: {
    data?: {
      message?: string;
    };
  };
};

const highlights = [
  {
    icon: IconShieldCheck,
    title: "统一规则标准",
    description: "把质检规则、人工复核口径和整改流程统一沉淀，形成稳定的管理标准。",
  },
  {
    icon: IconChartBar,
    title: "实时运营视角",
    description: "从会话、风险、整改到复盘的数据在一个后台里持续串联，不靠炫技视觉撑场面。",
  },
  {
    icon: IconTopologyStar3,
    title: "多角色协同",
    description: "平台配置、部门执行和日志审计共用一套界面语言，切换页面不会出戏。",
  },
];

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
        message: `欢迎回来, ${data.user.username}`,
        color: "green",
      });

      navigate("/");
    } catch (err: unknown) {
      notifications.show({
        title: "登录失败",
        message: (err as ApiError | undefined)?.response?.data?.message || "账号或密码错误",
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
        background: uiTokens.background.hero,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Container size={1200} w="100%">
        <Paper
          radius="lg"
          p={{ base: 16, sm: 20, lg: 22 }}
          style={{
            border: `1px solid ${uiTokens.colors.border}`,
            background: "rgba(255,255,255,0.84)",
            boxShadow: uiTokens.shadow.panel,
            backdropFilter: "blur(10px)",
          }}
        >
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 18, md: 22 }}>
            <Paper
              radius="lg"
              p={{ base: 20, md: 24, lg: 28 }}
              style={{
                border: `1px solid ${uiTokens.colors.border}`,
                background: uiTokens.background.panelSoft,
              }}
            >
              <Group gap="xs" mb="md">
                <Badge color="green" variant="light">
                  质检运营平台
                </Badge>
                <Badge color="gray" variant="outline">
                  后台系统
                </Badge>
              </Group>

              <Title
                order={1}
                style={{
                  color: uiTokens.colors.heading,
                  fontSize: "clamp(2.3rem, 4vw, 3.7rem)",
                  lineHeight: 1.08,
                }}
              >
                雷犀质检
              </Title>
              <Text
                mt="md"
                size="md"
                c={uiTokens.colors.textMuted}
                maw={520}
                style={{ lineHeight: 1.82 }}
              >
                这是面向业务管理和质检执行的后台系统，所以整体回到更稳、更耐看的界面秩序，用柔和绿色、圆角卡片和清晰层级来支撑日常使用。
              </Text>

              <Divider
                my="lg"
                color={uiTokens.colors.border}
                labelPosition="left"
                label={
                  <Text size="xs" fw={700} c={uiTokens.colors.textMuted}>
                    平台能力
                  </Text>
                }
              />

              <Stack gap="sm">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Paper
                      key={item.title}
                      radius="md"
                      p="md"
                      style={{
                        border: `1px solid ${uiTokens.colors.border}`,
                        background: "rgba(255,255,255,0.78)",
                        boxShadow: uiTokens.shadow.soft,
                      }}
                    >
                      <Group align="flex-start" wrap="nowrap">
                        <ThemeIcon size={42} radius="md" color="green" variant="light">
                          <Icon size={22} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} c={uiTokens.colors.heading}>
                            {item.title}
                          </Text>
                          <Text size="sm" c={uiTokens.colors.textMuted} mt={4}>
                            {item.description}
                          </Text>
                        </Box>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>

            <Paper
              radius="lg"
              p={{ base: 24, sm: 30, lg: 34 }}
              pos="relative"
              style={{
                border: `1px solid ${uiTokens.colors.border}`,
                background: uiTokens.background.panel,
                boxShadow: uiTokens.shadow.panel,
              }}
            >
              <LoadingOverlay visible={loading} overlayProps={{ radius: "lg", blur: 2 }} />

              <Box maw={560} mx="auto">
                <Group justify="space-between" align="flex-start" mb={28}>
                  <Group gap="sm" align="center" wrap="nowrap">
                    <ThemeIcon size={48} radius="md" color="green" variant="light">
                      <IconReportSearch size={24} />
                    </ThemeIcon>
                    <Box>
                      <Title order={2} c={uiTokens.colors.heading}>
                        欢迎登录
                      </Title>
                      <Text size="sm" c={uiTokens.colors.textMuted}>
                        输入账号和密码，进入统一质检运营后台
                      </Text>
                    </Box>
                  </Group>
                  <Badge color="green" variant="light">
                    稳定接入
                  </Badge>
                </Group>

                <form onSubmit={handleLogin}>
                  <Stack gap="lg">
                    <Group align="center" wrap="nowrap" gap="md">
                      <Text fw={700} size="sm" c={uiTokens.colors.text} style={{ minWidth: 74, textAlign: "right" }}>
                        账号
                      </Text>
                      <TextInput
                        placeholder="请输入用户名"
                        required
                        size="md"
                        radius="md"
                        flex={1}
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        styles={{
                          root: { flex: 1 },
                          input: {
                            height: 48,
                            background: uiTokens.colors.panel,
                            borderColor: uiTokens.colors.borderStrong,
                          },
                        }}
                      />
                    </Group>

                    <Group align="center" wrap="nowrap" gap="md">
                      <Text fw={700} size="sm" c={uiTokens.colors.text} style={{ minWidth: 74, textAlign: "right" }}>
                        密码
                      </Text>
                      <PasswordInput
                        placeholder="请输入密码"
                        required
                        size="md"
                        radius="md"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        styles={{
                          root: { flex: 1 },
                          input: {
                            height: 48,
                            background: uiTokens.colors.panel,
                            borderColor: uiTokens.colors.borderStrong,
                          },
                          innerInput: {
                            height: 48,
                          },
                        }}
                      />
                    </Group>
                  </Stack>

                  <Group justify="space-between" mt="lg">
                    <Checkbox label="记住我" color="green" />
                    <Anchor component="button" size="sm" c={uiTokens.colors.primaryDeep} type="button">
                      忘记密码？
                    </Anchor>
                  </Group>

                  <Button
                    fullWidth
                    mt="xl"
                    type="submit"
                    color="green"
                    radius="md"
                    size="md"
                    styles={{
                      root: {
                        height: 50,
                        background: "linear-gradient(135deg, #7c9674 0%, #688362 100%)",
                        boxShadow: "0 14px 28px rgba(103, 128, 99, 0.18)",
                      },
                    }}
                  >
                    立即登录
                  </Button>
                </form>
              </Box>
            </Paper>
          </SimpleGrid>
        </Paper>
      </Container>
    </Box>
  );
}
