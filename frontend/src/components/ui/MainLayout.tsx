import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  IconBell,
  IconChartBar,
  IconCircleCheck,
  IconHierarchy,
  IconLayoutDashboard,
  IconLogout,
  IconMessages,
  IconPlugConnected,
  IconReportSearch,
  IconTimeline,
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
      children: [{ label: "控制台概览", link: "/", permission: "dashboard:view" }],
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
  const activeItem = filteredNavGroups
    .flatMap((group) => group.children.map((item) => ({ ...item, group: group.label })))
    .find((item) => item.link === location.pathname);

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
        width: 268,
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
          background: uiTokens.colors.navPanelGlass,
          backdropFilter: "blur(10px)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="sm">
              <Box
                style={{
                  width: rem(36),
                  height: rem(36),
                  borderRadius: rem(10),
                  display: "grid",
                  placeItems: "center",
                  background: uiTokens.colors.heading,
                }}
              >
                <IconReportSearch size={18} color={uiTokens.colors.whiteSolid} />
              </Box>
              <Box>
                <Title order={4} fw={800} c={uiTokens.colors.heading}>
                  雷技质检系统
                </Title>
                <Text size="11px" c={uiTokens.colors.textMuted}>
                  运营与质检后台
                </Text>
              </Box>
            </Group>
            <Box visibleFrom="md">
              <Text size="11px" fw={700} c={uiTokens.colors.textMuted}>
                {activeItem?.group || "控制台"}
              </Text>
              <Text size="sm" fw={700} c={uiTokens.colors.heading}>
                {activeItem?.label || "控制台概览"}
              </Text>
            </Box>
          </Group>

          <Group gap="md">
            <Badge
              visibleFrom="md"
              radius="sm"
              variant="light"
              color="green"
              leftSection={<IconCircleCheck size={12} />}
            >
              系统在线
            </Badge>
            <UnstyledButton
              style={{
                width: rem(34),
                height: rem(34),
                borderRadius: rem(10),
                display: "grid",
                placeItems: "center",
                background: uiTokens.colors.panel,
                border: `1px solid ${uiTokens.colors.border}`,
              }}
            >
              <IconBell size={18} color={uiTokens.colors.textMuted} />
            </UnstyledButton>
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <UnstyledButton
                  style={{
                    padding: `${rem(5)} ${rem(10)}`,
                    borderRadius: rem(14),
                    background: uiTokens.colors.panel,
                    border: `${rem(1)} solid ${uiTokens.colors.border}`,
                  }}
                >
                  <Group gap="sm">
                    <Avatar
                      size={28}
                      radius="xl"
                      style={{
                        background: uiTokens.colors.primary,
                        color: uiTokens.colors.whiteSolid,
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
                <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>
                  退出登录
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="xs"
        style={{
          background: uiTokens.background.nav,
          borderRight: "none",
          boxShadow: uiTokens.shadow.nav,
          overflow: "hidden",
        }}
      >
        <AppShell.Section mb="sm">
          <Box
            p="md"
            style={{
              borderRadius: rem(18),
              background: uiTokens.background.navCard,
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
          >
            <Text size="11px" fw={700} c={uiTokens.colors.textOnDarkSoft}>
              导航中心
            </Text>
            <Text size="sm" fw={700} c={uiTokens.colors.textOnDark} mt={4}>
              业务控制台
            </Text>
            <Text size="11px" c={uiTokens.colors.textOnDarkMuted} mt={6}>
              按组织、运营、配置和日志模块浏览系统
            </Text>
            <Box
              style={{
                marginTop: rem(14),
                width: rem(82),
                height: rem(4),
                borderRadius: rem(uiTokens.radius.pill),
                background: uiTokens.background.navLine,
              }}
            />
          </Box>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} scrollbarSize={6}>
          <Stack gap={8}>
            {filteredNavGroups.map((group) => {
              const isOpened = openedGroup === group.label;

              return (
                <NavLink
                  key={group.label}
                  label={group.label}
                  description={`${group.children.length} 个页面`}
                  leftSection={
                    <Box
                      style={{
                        width: rem(28),
                        height: rem(28),
                        borderRadius: rem(8),
                        display: "grid",
                        placeItems: "center",
                        background: isOpened ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isOpened ? "rgba(96,165,250,0.28)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <group.icon
                        size="1rem"
                        stroke={1.8}
                        color={isOpened ? "#93c5fd" : "#cbd5e1"}
                      />
                    </Box>
                  }
                  childrenOffset={12}
                  opened={isOpened}
                  onClick={() =>
                    setOpenedGroup((current) => (current === group.label ? null : group.label))
                  }
                  variant="subtle"
                  styles={{
                    root: {
                      padding: `${rem(6)} ${rem(8)}`,
                      borderRadius: rem(14),
                      fontWeight: 600,
                      background: isOpened ? uiTokens.background.navSectionBg : "transparent",
                      color: uiTokens.colors.textOnDark,
                      border: isOpened ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                    },
                    label: { fontSize: rem(13), color: uiTokens.colors.textOnDark, fontWeight: 700 },
                    description: { fontSize: rem(11), color: uiTokens.colors.textOnDarkMuted, marginTop: rem(2) },
                    section: { color: uiTokens.colors.textOnDarkMuted },
                    body: { overflow: "hidden" },
                    children: { paddingTop: rem(6), gap: rem(4) },
                    chevron: { color: isOpened ? "#93c5fd" : uiTokens.colors.textOnDarkMuted },
                  }}
                >
                  {group.children.map((item) => {
                    const isActive = location.pathname === item.link;

                    return (
                      <NavLink
                        key={item.link}
                        label={item.label}
                        active={isActive}
                        onClick={() => navigate(item.link)}
                        variant="subtle"
                        leftSection={
                          <Box
                            style={{
                              width: rem(6),
                              height: rem(6),
                              borderRadius: "50%",
                              background: isActive ? "#93c5fd" : "rgba(148,163,184,0.6)",
                            }}
                          />
                        }
                        styles={{
                          root: {
                            borderRadius: rem(12),
                            minHeight: rem(38),
                            marginLeft: rem(6),
                            paddingInline: rem(10),
                            background: isActive ? uiTokens.background.navItemActive : "transparent",
                            border: isActive ? "1px solid rgba(96,165,250,0.2)" : "1px solid transparent",
                          },
                          label: {
                            fontSize: rem(12),
                            fontWeight: isActive ? 700 : 600,
                            color: isActive ? uiTokens.colors.textOnDark : uiTokens.colors.textOnDarkSoft,
                          },
                          section: {
                            marginInlineEnd: rem(10),
                          },
                        }}
                      />
                    );
                  })}
                </NavLink>
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Box
            p="xs"
            style={{
              background: uiTokens.background.footerGlass,
              borderRadius: rem(14),
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
          >
            <Text size="xs" c={uiTokens.colors.textOnDarkMuted} ta="center">
              雷技科技 © 2026
            </Text>
            <Text size="xs" c={uiTokens.colors.textOnDarkMuted} ta="center">
              v1.0.0-prod
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
