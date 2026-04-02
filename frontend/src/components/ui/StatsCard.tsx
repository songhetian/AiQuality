import React from "react";
import { Card, Group, Text, ThemeIcon, rem } from "@mantine/core";
import { CountUp } from "./CountUp";
import { uiTokens } from "./uiTokens";

interface IconProps {
  size?: number | string;
  stroke?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  diff?: string | number;
  icon: React.FC<IconProps>;
  color: string;
  description?: string;
}

export function StatsCard({
  title,
  value,
  diff,
  icon: Icon,
  color,
  description,
}: StatsCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  const isNumeric = !isNaN(numericValue);

  return (
    <Card
      withBorder
      radius="lg"
      p="md"
      shadow="xs"
      style={{
        position: "relative",
        overflow: "hidden",
        borderColor: uiTokens.colors.border,
        background: uiTokens.background.surfaceHighlight,
        boxShadow: uiTokens.shadow.panel,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 auto auto 0",
          width: 88,
          height: 4,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${uiTokens.colors.primary} 0%, ${uiTokens.colors.accent} 100%)`,
        }}
      />
      <Group justify="space-between">
        <Text size="xs" c={uiTokens.colors.textMuted} fw={700} tt="uppercase">
          {title}
        </Text>
        <ThemeIcon
          color={color}
          variant="light"
          size={40}
          radius="xl"
          style={{
            border: `1px solid ${uiTokens.colors.border}`,
            background: uiTokens.background.surfaceGlow,
          }}
        >
          <Icon style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
        </ThemeIcon>
      </Group>

      <Group align="flex-end" gap="xs" mt={rem(20)}>
        <Text fw={800} fz="xl" lh={1} c={uiTokens.colors.heading}>
          {isNumeric ? <CountUp to={numericValue} /> : value}
        </Text>
        {diff && (
          <Text
            c={String(diff).startsWith("+") ? "teal" : "red"}
            fz="xs"
            fw={600}
            lh={1}
            mb={rem(2)}
          >
            {diff}
          </Text>
        )}
      </Group>

      {(description || diff) && (
        <Text fz="xs" c={uiTokens.colors.textMuted} mt={rem(7)}>
          {description || "较昨日数据"}
        </Text>
      )}
    </Card>
  );
}
