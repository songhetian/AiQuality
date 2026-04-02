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
  Stack,
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
  IconTimeline,
  IconCircleCheck,
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
        width: 278,
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
          backdropFilter: "blur(18px)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: rem(10),
                padding: `${rem(6)} ${rem(10)}`,
                borderRadius: rem(18),
                background: uiTokens.background.surfaceGlow,
                border: `1px solid ${uiTokens.colors.border}`,
                boxShadow: uiTokens.shadow.soft,
              }}
            >
              <Box
                style={{
                  width: rem(38),
                  height: rem(38),
                  borderRadius: rem(14),
                  display: "grid",
                  placeItems: "center",
                  background: `linear-gradient(135deg, ${uiTokens.colors.primaryDeeper} 0%, ${uiTokens.colors.primary} 100%)`,
                  boxShadow: uiTokens.shadow.soft,
                }}
              >
                <IconReportSearch size={19} color={uiTokens.colors.whiteSolid} />
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
              radius="xl"
              variant="filled"
              leftSection={<IconCircleCheck size={12} />}
              style={{
                background: uiTokens.colors.successBg,
                color: uiTokens.colors.successText,
                border: `1px solid ${uiTokens.colors.successBorder}`,
              }}
            >
              系统在线
            </Badge>
            <UnstyledButton
              style={{
                width: rem(34),
                height: rem(34),
                borderRadius: rem(uiTokens.radius.pill),
                display: "grid",
                placeItems: "center",
                background: uiTokens.colors.panelMuted,
                border: `1px solid ${uiTokens.colors.border}`,
                boxShadow: uiTokens.shadow.soft,
              }}
            >
              <IconBell size={18} color={uiTokens.colors.textMuted} />
            </UnstyledButton>
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <UnstyledButton style={{
                    padding: `${rem(5)} ${rem(10)}`,
                    borderRadius: rem(18),
                    background: uiTokens.background.surfaceGlow,
                    border: `${rem(1)} solid ${uiTokens.colors.border}`,
                    boxShadow: uiTokens.shadow.soft,
                  }}>
                  <Group gap="sm">
                    <Avatar
                      size={28}
                      radius="xl"
                      style={{
                        background: `linear-gradient(135deg, ${uiTokens.colors.primaryDeeper} 0%, ${uiTokens.colors.primary} 100%)`,
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
          overflow: "hidden",
        }}
      >
        <AppShell.Section mb="sm">
          <Box
            p="sm"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: rem(22),
              background: uiTokens.background.navCard,
              border: `1px solid ${uiTokens.colors.border}`,
              boxShadow: uiTokens.shadow.soft,
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Box style={{ position: "relative", zIndex: 1 }}>
                <Text size="11px" fw={700} c={uiTokens.colors.textMuted}>
                  导航中心
                </Text>
                <Text size="sm" fw={700} c={uiTokens.colors.heading} mt={2}>
                  业务控制台
                </Text>
                <Text size="11px" c={uiTokens.colors.textMuted} mt={6}>
                  聚焦高频操作与关键模块
                </Text>
              </Box>
              <Badge color="green" variant="filled" radius="xl">
                {filteredNavGroups.length} 组
              </Badge>
            </Group>
            <Box
              style={{
                marginTop: rem(12),
                width: rem(96),
                height: rem(6),
                borderRadius: rem(uiTokens.radius.pill),
                background: uiTokens.background.navLine,
              }}
            />
            <Box
              style={{
                position: "absolute",
                right: rem(-18),
                bottom: rem(-26),
                width: rem(96),
                height: rem(96),
                borderRadius: "50%",
                background: uiTokens.background.navOrb,
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
                        borderRadius: rem(10),
                        display: "grid",
                        placeItems: "center",
                        background: isOpened
                          ? uiTokens.background.navSectionOpen
                          : uiTokens.colors.navIconIdle,
                        border: `1px solid ${isOpened ? uiTokens.colors.navIconBorderActive : uiTokens.colors.border}`,
                      }}
                    >
                      <group.icon
                        size="1rem"
                        stroke={1.8}
                        color={isOpened ? uiTokens.colors.primaryDeep : uiTokens.colors.textMuted}
                      />
                    </Box>
                  }
                  childrenOffset={12}
                  opened={isOpened}
                  onClick={() =>
                    setOpenedGroup((current) =>
                      current === group.label ? null : group.label,
                    )
                  }
                  variant="subtle"
                  color="green"
                  styles={{
                    root: {
                      padding: `${rem(6)} ${rem(8)}`,
                      borderRadius: rem(18),
                      fontWeight: 600,
                      background: isOpened
                        ? uiTokens.background.navSectionBg
                        : "transparent",
                      color: uiTokens.colors.heading,
                      border: isOpened
                        ? `1px solid ${uiTokens.colors.borderStrong}`
                        : "1px solid transparent",
                      boxShadow: isOpened ? uiTokens.shadow.navSection : "none",
                    },
                    label: { fontSize: rem(13), color: uiTokens.colors.heading, fontWeight: 700 },
                    description: { fontSize: rem(11), color: uiTokens.colors.textMuted, marginTop: rem(2) },
                    section: { color: uiTokens.colors.textMuted },
                    body: { overflow: "hidden" },
                    children: { paddingTop: rem(6), gap: rem(4) },
                    chevron: { color: isOpened ? uiTokens.colors.primaryDeep : uiTokens.colors.textMuted },
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
                        color="green"
                        leftSection={
                          <Box
                            style={{
                              width: rem(6),
                              height: rem(6),
                              borderRadius: "50%",
                              background: isActive ? uiTokens.colors.primary : uiTokens.colors.navDotIdle,
                              boxShadow: isActive ? uiTokens.shadow.focusRing : "none",
                            }}
                          />
                        }
                        styles={{
                          root: {
                            borderRadius: rem(14),
                            minHeight: rem(38),
                            marginLeft: rem(6),
                            paddingInline: rem(10),
                            background: isActive
                              ? uiTokens.background.navItemActive
                              : uiTokens.colors.navHover,
                            border: isActive
                              ? `1px solid ${uiTokens.colors.borderStrong}`
                              : "1px solid transparent",
                            boxShadow: isActive ? uiTokens.shadow.navItem : "none",
                            position: "relative",
                          },
                          label: {
                            fontSize: rem(12),
                            fontWeight: isActive ? 700 : 600,
                            color: isActive ? uiTokens.colors.heading : uiTokens.colors.text,
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
              borderRadius: rem(18),
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
