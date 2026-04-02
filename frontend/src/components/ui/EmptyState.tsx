import React from "react";
import { Stack, Text, Center, rem, useMantineTheme, Box } from "@mantine/core";
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
          position: 'relative',
          overflow: 'hidden',
          minWidth: rem(280),
          borderRadius: rem(uiTokens.radius.lg),
          border: `1px dashed ${uiTokens.colors.borderStrong}`,
          background: uiTokens.background.surfaceHighlightSoft,
        }}
      >
        <Box
          style={{
            width: rem(64),
            height: rem(64),
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: uiTokens.background.surfaceGlow,
            border: `1px solid ${uiTokens.colors.border}`,
            boxShadow: uiTokens.shadow.soft,
          }}
        >
          <Icon size={34} stroke={1.35} color={uiTokens.colors.primaryDeep} />
        </Box>
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
