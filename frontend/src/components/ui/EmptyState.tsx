import React from "react";
import { Stack, Text, Center, rem, useMantineTheme } from "@mantine/core";

interface IconProps {
  size?: number | string;
  stroke?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface EmptyStateProps {
  icon: React.FC<IconProps>;
  title: string;
  description?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  const theme = useMantineTheme();

  return (
    <Center py={rem(60)}>
      <Stack align="center" gap="xs">
        <Icon size={48} stroke={1.2} color={theme.colors.gray[4]} />
        <Text fw={700} c="gray.6">
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 300 }}>
            {description}
          </Text>
        )}
      </Stack>
    </Center>
  );
}
