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
  IconChartBar,
  IconChecks,
  IconCircleCheck,
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
  userMessage?: string;
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

const quickFacts = [
  "规则治理",
  "实时预警",
  "日志审计",
];

const metrics = [
  { label: "实时质检任务", value: "24", accent: uiTokens.colors.primary },
  { label: "风险事件回流", value: "08", accent: uiTokens.colors.primaryDeep },
  { label: "今日处理闭环", value: "96%", accent: uiTokens.colors.primaryTintStrong },
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
      const resolvedError = err as ApiError | undefined;
      notifications.show({
        title: "登录失败",
        message:
          resolvedError?.response?.data?.message ||
          resolvedError?.userMessage ||
          "登录失败，请检查账号密码或服务连接状态",
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
      <Container size={1100} w="100%">
        <Paper
          radius={24}
          p={10}
          style={{
            border: `1px solid ${uiTokens.colors.border}`,
            background: uiTokens.colors.panelGlass,
            boxShadow: uiTokens.shadow.elevated,
            backdropFilter: "blur(18px)",
          }}
        >
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={10}>
            <Paper
              radius={20}
              p={{ base: 24, md: 32, lg: 38 }}
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: rem(620),
                border: "none",
                background: uiTokens.background.loginBrand,
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: uiTokens.background.loginBrandOverlay,
                }}
              />
              <Group gap="xs" mb="lg">
                <Badge
                  variant="filled"
                  style={{ background: uiTokens.colors.whiteAlphaBold, color: uiTokens.colors.textOnDark, border: `1px solid ${uiTokens.colors.whiteAlphaStrong}` }}
                >
                  质检运营平台
                </Badge>
                <Badge
                  variant="filled"
                  style={{
                    color: uiTokens.colors.textOnDark,
                    background: uiTokens.colors.brandAlphaSoft,
                    border: `1px solid ${uiTokens.colors.brandAlphaBorder}`,
                  }}
                >
                  后台系统
                </Badge>
              </Group>

              <Title
                order={1}
                style={{
                  color: uiTokens.colors.textOnDark,
                  fontSize: "clamp(2.6rem, 4.6vw, 4.1rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.04em",
                }}
              >
                雷犀质检
              </Title>
              <Box
                mt="sm"
                style={{
                  width: 132,
                  height: 10,
                  borderRadius: 999,
                  background: uiTokens.background.brandLine,
                  boxShadow: uiTokens.shadow.loginBrand,
                }}
              />
              <Text
                mt="md"
                size="lg"
                c={uiTokens.colors.textOnDarkMuted}
                maw={520}
                style={{ lineHeight: 1.8 }}
              >
                面向客服质检、风险识别和运营复盘的统一后台，聚焦高频任务、执行追踪与问题闭环。
              </Text>
              <Group gap="sm" mt="xl">
                {quickFacts.map((item) => (
                  <Badge
                    key={item}
                    radius="xl"
                    variant="filled"
                    style={{
                      background: uiTokens.colors.whiteAlpha,
                      color: uiTokens.colors.textOnDark,
                      border: `1px solid ${uiTokens.colors.whiteAlpha}`,
                    }}
                  >
                    {item}
                  </Badge>
                ))}
              </Group>

              <Divider
                my="xl"
                color={uiTokens.colors.whiteAlphaStrong}
                labelPosition="left"
                label={<Text size="xs" fw={700} c={uiTokens.colors.textOnDarkSoft}>核心能力</Text>}
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
                        border: `1px solid ${uiTokens.colors.whiteAlpha}`,
                        background: uiTokens.colors.whiteAlphaMuted,
                        boxShadow: "none",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Group align="flex-start" wrap="nowrap">
                        <ThemeIcon
                          size={42}
                          radius="xl"
                          variant="filled"
                          style={{
                            background: uiTokens.background.loginMetricIcon,
                            color: uiTokens.colors.textOnDark,
                            border: `1px solid ${uiTokens.colors.brandAlphaBorder}`,
                          }}
                        >
                          <Icon size={21} />
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

              <Paper
                radius="xl"
                p="lg"
                mt="xl"
                style={{
                  border: `1px solid ${uiTokens.colors.whiteAlpha}`,
                  background: uiTokens.background.loginMetric,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Group justify="space-between" align="flex-start" mb="md">
                  <Box>
                    <Text size="xs" fw={700} c={uiTokens.colors.textOnDarkSoft}>
                      今日态势
                    </Text>
                    <Text fw={800} size="lg" c={uiTokens.colors.textOnDark} mt={4}>
                      运营控制信号稳定
                    </Text>
                  </Box>
                  <ThemeIcon
                    radius="xl"
                    size={42}
                    variant="filled"
                    style={{
                      background: uiTokens.colors.brandAlphaSoft,
                      color: uiTokens.colors.brandGlowText,
                      border: `1px solid ${uiTokens.colors.whiteAlphaStrong}`,
                    }}
                  >
                    <IconChartBar size={20} />
                  </ThemeIcon>
                </Group>

                <SimpleGrid cols={3} spacing="sm">
                  {metrics.map((item) => (
                    <Box
                      key={item.label}
                      p="sm"
                      style={{
                        borderRadius: rem(16),
                        background: uiTokens.colors.whiteAlphaSoft,
                        border: `1px solid ${uiTokens.colors.whiteAlphaMuted}`,
                      }}
                    >
                      <Text size="xs" c={uiTokens.colors.textOnDarkSoft}>
                        {item.label}
                      </Text>
                      <Text fw={800} size="1.5rem" c={item.accent} mt={6} lh={1}>
                        {item.value}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Paper>
            </Paper>

            <Paper
              radius={20}
              p={{ base: 22, sm: 28, lg: 34 }}
              pos="relative"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: uiTokens.background.loginPanel,
              }}
            >
              <LoadingOverlay visible={loading} overlayProps={{ radius: "lg", blur: 2 }} />

              <Paper
                radius={20}
                p={{ base: 22, sm: 24, lg: 28 }}
                maw={420}
                w="100%"
                style={{
                  border: `1px solid ${uiTokens.colors.border}`,
                  background: uiTokens.colors.panel,
                  boxShadow: uiTokens.shadow.cardElevated,
                }}
              >
                <Stack gap="lg">
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm" align="center" wrap="nowrap">
                      <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="filled"
                        style={{
                          background: `linear-gradient(135deg, ${uiTokens.colors.primaryDeeper} 0%, ${uiTokens.colors.primary} 100%)`,
                          color: uiTokens.colors.whiteSolid,
                          boxShadow: uiTokens.shadow.success,
                        }}
                      >
                        <IconReportSearch size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={2} c={uiTokens.colors.heading}>
                          登录后台
                        </Title>
                        <Text size="sm" c={uiTokens.colors.textMuted}>
                          输入账号和密码继续操作
                        </Text>
                      </Box>
                    </Group>
                    <Badge
                      variant="filled"
                      style={{
                        background: uiTokens.colors.successBg,
                        color: uiTokens.colors.successText,
                        border: `1px solid ${uiTokens.colors.successBorder}`,
                      }}
                    >
                      在线
                    </Badge>
                  </Group>

                  <Group gap={8}>
                    <Badge variant="dot" color="green">数据库连接检测</Badge>
                    <Badge variant="dot" color="green">Redis 缓存检测</Badge>
                  </Group>

                  <Paper
                    radius="lg"
                    p="sm"
                    style={{
                      background: uiTokens.colors.panelMuted,
                      border: `1px solid ${uiTokens.colors.border}`,
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon
                        radius="xl"
                        size={30}
                        variant="filled"
                        style={{
                          background: uiTokens.colors.primarySoft,
                          color: uiTokens.colors.primaryDeeper,
                        }}
                      >
                        <IconCircleCheck size={16} />
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={700} c={uiTokens.colors.heading}>
                          建议使用管理员账号登录
                        </Text>
                        <Text size="xs" c={uiTokens.colors.textMuted}>
                          登录后可查看数据库、Redis 与接口配置状态
                        </Text>
                      </Box>
                    </Group>
                  </Paper>

                  <form onSubmit={handleLogin}>
                    <Stack gap="md">
                      <Box>
                        <Text fw={700} size="sm" c={uiTokens.colors.text} mb={8}>
                          账号
                        </Text>
                        <TextInput
                          placeholder="请输入用户名"
                          required
                          size="md"
                          radius="lg"
                          value={username}
                          onChange={(e) => setUsername(e.currentTarget.value)}
                          styles={{
                            input: {
                              height: 50,
                              background: uiTokens.colors.inputBg,
                              borderColor: uiTokens.colors.inputBorder,
                              color: uiTokens.colors.heading,
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Text fw={700} size="sm" c={uiTokens.colors.text} mb={8}>
                          密码
                        </Text>
                        <PasswordInput
                          placeholder="请输入密码"
                          required
                          size="md"
                          radius="lg"
                          value={password}
                          onChange={(e) => setPassword(e.currentTarget.value)}
                          styles={{
                            input: {
                              height: 50,
                              background: uiTokens.colors.inputBg,
                              borderColor: uiTokens.colors.inputBorder,
                              color: uiTokens.colors.heading,
                            },
                            innerInput: {
                              height: 50,
                            },
                          }}
                        />
                      </Box>

                      <Group justify="space-between" mt={4}>
                        <Checkbox label="记住我" color="green" />
                        <Anchor component="button" size="sm" c={uiTokens.colors.primaryDeeper} type="button">
                          忘记密码？
                        </Anchor>
                      </Group>

                      <Button
                        fullWidth
                        mt="sm"
                        type="submit"
                        color="green"
                        radius="xl"
                        size="md"
                        leftSection={<IconChecks size={18} />}
                        styles={{
                          root: {
                            height: 52,
                            background: uiTokens.background.successLine,
                            color: uiTokens.colors.whiteSolid,
                            boxShadow: uiTokens.shadow.success,
                          },
                        }}
                      >
                        立即登录
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </Paper>
            </Paper>
          </SimpleGrid>
        </Paper>
      </Container>
    </Box>
  );
}
