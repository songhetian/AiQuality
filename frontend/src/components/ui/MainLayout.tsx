import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  UnstyledButton,
  Text,
  Avatar,
  Menu,
  Box,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconUsers,
  IconHierarchy,
  IconPlugConnected,
  IconTags,
  IconMessages,
  IconReportSearch,
  IconCreditCard,
  IconCpu,
  IconSettings,
  IconLogout,
  IconBell,
  IconLockAccess,
  IconAlertTriangle,
  IconShieldExclamation,
  IconHash,
  IconShoppingCartOff,
  IconBook,
  IconTimeline
} from "@tabler/icons-react";
import { useAuthStore } from "../../store/authStore";

export function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();
  const { user, logout, roles, permissions } = useAuthStore();

  const navItems = [
    { label: "控制台概览", icon: IconLayoutDashboard, link: "/", permission: "dashboard:view" },
    { label: "组织架构", icon: IconHierarchy, link: "/org", permission: "org:view" },
    { label: "接口适配", icon: IconPlugConnected, link: "/adapter", permission: "adapter:view" },
    { label: "用户管理", icon: IconUsers, link: "/user", permission: "user:view" },
    { label: "角色权限", icon: IconLockAccess, link: "/role", permission: "role:view" },
    { label: "知识库管理", icon: IconBook, link: "/knowledge", permission: "knowledge:view" },
    { label: "标签管理", icon: IconTags, link: "/tag", permission: "tag:view" },
    { label: "敏感词管理", icon: IconShieldExclamation, link: "/keyword", permission: "keyword:view" },
    { label: "敏感词记录", icon: IconAlertTriangle, link: "/violation", permission: "violation:record" },
    { label: "高频问题", icon: IconHash, link: "/insight/question", permission: "insight:question" },
    { label: "流失分析", icon: IconShoppingCartOff, link: "/insight/loss", permission: "insight:loss" },
    { label: "聊天记录", icon: IconMessages, link: "/chat", permission: "chat:view" },
    { label: "质检管理", icon: IconReportSearch, link: "/quality", permission: "quality:view" },
    { label: "操作日志", icon: IconTimeline, link: "/log/operation", permission: "log:view" },
    { label: "系统日志", icon: IconBell, link: "/log/system", permission: "log:view" },
    { label: "成本统计", icon: IconCreditCard, link: "/cost", permission: "cost:view" },
    { label: "AI 配置", icon: IconCpu, link: "/ai-config", permission: "ai-config:view" },
    { label: "系统设置", icon: IconSettings, link: "/settings", permission: "settings:view" },
  ];

  const filteredNavItems = navItems.filter(
    (item) => roles.includes("SUPER_ADMIN") || permissions.includes(item.permission) || !item.permission
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{ main: { background: "#f8f9fa" } }}
    >
      <AppShell.Header style={{ borderBottom: `${rem(1)} solid ${theme.colors.green[2]}` }}>
        <Group h="100%" px="xl" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Box style={{ display: "flex", alignItems: "center", gap: rem(8) }}>
              <IconReportSearch size={32} color={theme.colors.green[7]} />
              <Title order={3} fw={800} c="green.8">雷犀质检系统</Title>
            </Box>
          </Group>

          <Group gap="lg">
            <UnstyledButton><IconBell size={22} color={theme.colors.gray[6]} /></UnstyledButton>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton style={{
                    padding: `${rem(4)} ${rem(12)}`,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.green[0],
                    border: `${rem(1)} solid ${theme.colors.green[2]}`,
                  }}>
                  <Group gap="sm">
                    <Avatar size="sm" color="green" radius="xl">{user?.username?.[0]?.toUpperCase() || "A"}</Avatar>
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={600} c="green.9">{user?.username || "超级管理员"}</Text>
                      <Text size="xs" c="dimmed">{roles.includes("SUPER_ADMIN") ? "系统管理员" : "普通用户"}</Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>退出登录</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ backgroundColor: theme.colors.green[0], borderRight: `${rem(1)} solid ${theme.colors.green[2]}` }}>
        <AppShell.Section grow>
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.link}
              label={item.label}
              leftSection={<item.icon size="1.2rem" stroke={1.5} />}
              active={location.pathname === item.link}
              onClick={() => navigate(item.link)}
              variant="light"
              color="green"
              mb={rem(6)}
              styles={{
                root: { borderRadius: theme.radius.md, fontWeight: 500, height: rem(44) },
                label: { fontSize: rem(14) },
              }}
            />
          ))}
        </AppShell.Section>
        <AppShell.Section>
          <Box p="xs" style={{ backgroundColor: "white", borderRadius: theme.radius.md, border: `${rem(1)} solid ${theme.colors.green[2]}` }}>
            <Text size="xs" c="dimmed" ta="center">雷犀科技 © 2026</Text>
            <Text size="xs" c="dimmed" ta="center">v1.0.0-prod</Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main><Outlet /></AppShell.Main>
    </AppShell>
  );
}
