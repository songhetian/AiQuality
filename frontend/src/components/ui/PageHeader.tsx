import { Title, Text, Group, Box, Breadcrumbs, Anchor, rem, Paper } from '@mantine/core';
import { uiTokens } from './uiTokens';

interface PageHeaderProps {
  title: string;
  description?: string;
  rightSection?: React.ReactNode;
  action?: React.ReactNode; // 兼容性支持
  breadcrumbs?: { title: string; href: string }[];
}

export function PageHeader({ title, description, rightSection, action, breadcrumbs }: PageHeaderProps) {
  const items = breadcrumbs?.map((item, index) => (
    <Anchor href={item.href} key={index} size="xs" c={uiTokens.colors.textMuted} fw={600}>
      {item.title}
    </Anchor>
  )) || [];

  const finalRightSection = rightSection || action;

  return (
    <Paper
      mb="md"
      p="md"
      radius="lg"
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${uiTokens.colors.border}`,
        background: uiTokens.background.surfaceHighlight,
        boxShadow: uiTokens.shadow.panel,
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: rem(132),
          height: rem(6),
          borderRadius: rem(uiTokens.radius.pill),
          background: uiTokens.background.navLine,
        }}
      />
      {items.length > 0 && <Breadcrumbs mb="xs">{items}</Breadcrumbs>}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} c={uiTokens.colors.heading} fw={800}>{title}</Title>
          {description && <Text size="sm" c={uiTokens.colors.textMuted} mt={rem(4)}>{description}</Text>}
        </Box>
        {finalRightSection && <Box>{finalRightSection}</Box>}
      </Group>
    </Paper>
  );
}
