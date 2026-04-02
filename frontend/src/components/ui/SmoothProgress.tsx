import { Box, Group, Text, rem, useMantineTheme } from '@mantine/core';
import { uiTokens } from './uiTokens';

interface SmoothProgressProps {
  value: number; // 0-100
  height?: number;
  color?: string;
  label?: string;
  subLabel?: string;
}

export function SmoothProgress({ value, height = 12, color, label, subLabel }: SmoothProgressProps) {
  const theme = useMantineTheme();
  const activeColor = color || theme.colors.blue[6];

  return (
    <Box w="100%">
      {(label || subLabel) && (
        <Group justify="space-between" mb={6}>
          {label && <Text size="sm" fw={600} c="dark.3">{label}</Text>}
          <Group gap={4}>
             {subLabel && <Text size="xs" c="dimmed">{subLabel}</Text>}
             <Text size="sm" fw={700} c={activeColor} style={{ fontVariantNumeric: 'tabular-nums' }}>
               {Math.round(value)}%
             </Text>
          </Group>
        </Group>
      )}
      
      <Box
        style={{
          height: rem(height),
          backgroundColor: theme.colors.gray[2],
          borderRadius: rem(height),
          overflow: 'hidden',
          position: 'relative',
          boxShadow: `inset 0 1px 2px ${uiTokens.colors.border}`
        }}
      >
        <Box
          style={{
            height: '100%',
            width: `${value}%`,
            backgroundColor: activeColor,
            borderRadius: rem(height),
            position: 'relative',
            overflow: 'hidden',
            transition: 'width 320ms ease'
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${uiTokens.colors.panelGlass}, transparent)`,
              transform: 'skewX(-20deg)',
              animation: 'progress-shimmer 1.5s linear infinite',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
