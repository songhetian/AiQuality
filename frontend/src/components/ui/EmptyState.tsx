import React from "react";
import { Stack, Text, Center, rem, useMantineTheme } from "@mantine/core";
import { uiTokens } from "./uiTokens";

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
      <Stack
        align="center"
        gap="xs"
        p="xl"
        style={{
          minWidth: rem(280),
          borderRadius: rem(uiTokens.radius.lg),
          border: `1px dashed ${uiTokens.colors.borderStrong}`,
          background: uiTokens.background.panelSoft,
        }}
      >
        <Icon size={48} stroke={1.2} color={uiTokens.colors.textMuted} />
        <Text fw={700} c={uiTokens.colors.text}>
          {title}
        </Text>
        {description && (
          <Text size="sm" c={theme.colors.gray[5]} ta="center" style={{ maxWidth: 300 }}>
            {description}
          </Text>
        )}
      </Stack>
    </Center>
  );
}
