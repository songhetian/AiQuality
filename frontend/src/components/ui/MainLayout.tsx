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
  ScrollArea,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconHierarchy,
  IconPlugConnected,
  IconMessages,
  IconReportSearch,
  IconChartBar,
  IconLogout,
  IconBell,
  IconTimeline
} from "@tabler/icons-react";
import { useAuthStore } from "../../store/authStore";
import { uiTokens } from "./uiTokens";

export function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, roles, permissions } = useAuthStore();

  const navGroups = [
    {
      label: "控制台",
      icon: IconLayoutDashboard,
      children: [
        { label: "控制台概览", link: "/", permission: "dashboard:view" },
      ],
    },
    {
      label: "组织权限",
      icon: IconHierarchy,
      children: [
        { label: "组织架构", link: "/org", permission: "org:view" },
        { label: "用户管理", link: "/user", permission: "user:view" },
        { label: "角色权限", link: "/role", permission: "role:view" },
      ],
    },
    {
      label: "业务运营",
      icon: IconMessages,
      children: [
        { label: "聊天记录", link: "/chat", permission: "chat:view" },
        { label: "质检管理", link: "/quality", permission: "quality:view" },
        { label: "标签管理", link: "/tag", permission: "tag:view" },
        { label: "敏感词管理", link: "/keyword", permission: "keyword:view" },
        { label: "敏感词记录", link: "/violation", permission: "violation:record" },
      ],
    },
    {
      label: "分析洞察",
      icon: IconChartBar,
      children: [
        { label: "高频问题", link: "/insight/question", permission: "insight:question" },
        { label: "流失分析", link: "/insight/loss", permission: "insight:loss" },
        { label: "成本统计", link: "/cost", permission: "cost:view" },
      ],
    },
    {
      label: "平台配置",
      icon: IconPlugConnected,
      children: [
        { label: "接口适配", link: "/adapter", permission: "adapter:view" },
        { label: "知识库管理", link: "/knowledge", permission: "knowledge:view" },
        { label: "AI 配置", link: "/ai-config", permission: "ai-config:view" },
        { label: "系统设置", link: "/settings", permission: "settings:view" },
      ],
    },
    {
      label: "日志审计",
      icon: IconTimeline,
      children: [
        { label: "操作日志", link: "/log/operation", permission: "log:view" },
        { label: "系统日志", link: "/log/system", permission: "log:view" },
      ],
    },
  ];

  const filteredNavGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          children: group.children.filter(
            (item) =>
              roles.includes("SUPER_ADMIN") ||
              permissions.includes(item.permission) ||
              !item.permission,
          ),
        }))
        .filter((group) => group.children.length > 0),
    [permissions, roles],
  );
  const [openedGroup, setOpenedGroup] = useState<string | null>(null);

  useEffect(() => {
    const activeGroup = filteredNavGroups.find((group) =>
      group.children.some((item) => item.link === location.pathname),
    );
    if (activeGroup) {
      setOpenedGroup(activeGroup.label);
    }
  }, [filteredNavGroups, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppShell
      header={{ height: 58 }}
      navbar={{
        width: 252,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="sm"
      styles={{
        main: {
          background: uiTokens.background.app,
        },
      }}
    >
      <AppShell.Header
        style={{
          borderBottom: `${rem(1)} solid ${uiTokens.colors.border}`,
          background: "rgba(250, 252, 249, 0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Box style={{ display: "flex", alignItems: "center", gap: rem(8) }}>
              <Box
                style={{
                  width: rem(34),
                  height: rem(34),
                  borderRadius: rem(uiTokens.radius.md),
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #7d9b75 0%, #688362 100%)",
                  boxShadow: uiTokens.shadow.soft,
                }}
              >
                <IconReportSearch size={18} color="#ffffff" />
              </Box>
              <Box>
                <Title order={4} fw={800} c={uiTokens.colors.heading}>
                  雷犀质检系统
                </Title>
                <Text size="11px" c={uiTokens.colors.textMuted}>
                  质检运营管理后台
                </Text>
              </Box>
            </Box>
          </Group>

          <Group gap="md">
            <UnstyledButton
              style={{
                width: rem(34),
                height: rem(34),
                borderRadius: rem(uiTokens.radius.md),
                display: "grid",
                placeItems: "center",
                background: uiTokens.colors.panelMuted,
                border: `1px solid ${uiTokens.colors.border}`,
              }}
            >
              <IconBell size={18} color={uiTokens.colors.textMuted} />
            </UnstyledButton>
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <UnstyledButton style={{
                    padding: `${rem(4)} ${rem(10)}`,
                    borderRadius: rem(uiTokens.radius.md),
                    backgroundColor: uiTokens.colors.panelMuted,
                    border: `${rem(1)} solid ${uiTokens.colors.border}`,
                  }}>
                  <Group gap="sm">
                    <Avatar
                      size={28}
                      radius="xl"
                      style={{
                        background: "linear-gradient(135deg, #7d9b75 0%, #688362 100%)",
                        color: "#fff",
                      }}
                    >
                      {user?.username?.[0]?.toUpperCase() || "A"}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <Text size="xs" fw={700} c={uiTokens.colors.heading}>
                        {user?.username || "超级管理员"}
                      </Text>
                      <Text size="xs" c={uiTokens.colors.textMuted}>
                        {roles.includes("SUPER_ADMIN") ? "系统管理员" : "普通用户"}
                      </Text>
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

      <AppShell.Navbar
        p="xs"
        style={{
          background: uiTokens.background.nav,
          borderRight: `${rem(1)} solid ${uiTokens.colors.border}`,
          boxShadow: uiTokens.shadow.nav,
        }}
      >
        <AppShell.Section mb="sm">
          <Box
            p="sm"
            style={{
              borderRadius: rem(uiTokens.radius.lg),
              background: "rgba(255,255,255,0.82)",
              border: `1px solid ${uiTokens.colors.border}`,
              boxShadow: uiTokens.shadow.soft,
            }}
          >
            <Group justify="space-between" align="center">
              <Box>
                <Text size="11px" fw={700} c={uiTokens.colors.textMuted}>
                  导航中心
                </Text>
                <Text size="sm" fw={700} c={uiTokens.colors.heading} mt={2}>
                  业务控制台
                </Text>
              </Box>
              <Badge color="green" variant="light">
                {filteredNavGroups.length} 组
              </Badge>
            </Group>
          </Box>
        </AppShell.Section>
        <AppShell.Section grow component={ScrollArea} scrollbarSize={6}>
          {filteredNavGroups.map((group) => (
            <NavLink
              key={group.label}
              label={group.label}
              leftSection={<group.icon size="1rem" stroke={1.6} />}
              childrenOffset={12}
              opened={openedGroup === group.label}
              onClick={() =>
                setOpenedGroup((current) =>
                  current === group.label ? null : group.label,
                )
              }
              variant="filled"
              color="green"
              mb={rem(4)}
              styles={{
                root: {
                  borderRadius: rem(uiTokens.radius.md),
                  fontWeight: 600,
                  minHeight: rem(40),
                  backgroundColor:
                    openedGroup === group.label
                      ? uiTokens.colors.navActive
                      : "transparent",
                  color: uiTokens.colors.heading,
                  border: openedGroup === group.label
                    ? `1px solid ${uiTokens.colors.borderStrong}`
                    : "1px solid transparent",
                },
                label: { fontSize: rem(13), color: uiTokens.colors.heading },
                section: { color: uiTokens.colors.textMuted },
                body: { overflow: "hidden" },
                children: { paddingTop: rem(4), gap: rem(2) },
                chevron: { color: uiTokens.colors.textMuted },
              }}
            >
              {group.children.map((item) => (
                <NavLink
                  key={item.link}
                  label={item.label}
                  active={location.pathname === item.link}
                  onClick={() => navigate(item.link)}
                  variant="subtle"
                  color="green"
                  styles={{
                    root: {
                      borderRadius: rem(uiTokens.radius.md),
                      minHeight: rem(34),
                      marginLeft: rem(6),
                      backgroundColor:
                        location.pathname === item.link
                          ? uiTokens.colors.primaryTintStrong
                          : "transparent",
                      border:
                        location.pathname === item.link
                          ? `1px solid ${uiTokens.colors.borderStrong}`
                          : "1px solid transparent",
                    },
                    label: {
                      fontSize: rem(12),
                      fontWeight: location.pathname === item.link ? 600 : 500,
                      color:
                        location.pathname === item.link
                          ? uiTokens.colors.heading
                          : uiTokens.colors.text,
                    },
                  }}
                />
              ))}
            </NavLink>
          ))}
        </AppShell.Section>
        <AppShell.Section>
          <Box
            p="xs"
            style={{
              backgroundColor: "rgba(255,255,255,0.72)",
              borderRadius: rem(uiTokens.radius.lg),
              border: `1px solid ${uiTokens.colors.border}`,
            }}
          >
            <Text size="xs" c={uiTokens.colors.textMuted} ta="center">
              雷犀科技 © 2026
            </Text>
            <Text size="xs" c={uiTokens.colors.textMuted} ta="center">
              v1.0.0-prod
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main><Outlet /></AppShell.Main>
    </AppShell>
  );
}
