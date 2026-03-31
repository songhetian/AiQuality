import { Title, Text, Group, Box, Breadcrumbs, Anchor, rem } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  description?: string;
  rightSection?: React.ReactNode;
  action?: React.ReactNode; // 兼容性支持
  breadcrumbs?: { title: string; href: string }[];
}

export function PageHeader({ title, description, rightSection, action, breadcrumbs }: PageHeaderProps) {
  const items = breadcrumbs?.map((item, index) => (
    <Anchor href={item.href} key={index} size="xs" c="green.7">
      {item.title}
    </Anchor>
  )) || [];

  const finalRightSection = rightSection || action;

  return (
    <Box mb="xl">
      {items.length > 0 && <Breadcrumbs mb="xs">{items}</Breadcrumbs>}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} c="green.9" fw={800}>{title}</Title>
          {description && <Text size="sm" c="dimmed" mt={rem(4)}>{description}</Text>}
        </Box>
        {finalRightSection && <Box>{finalRightSection}</Box>}
      </Group>
    </Box>
  );
}
