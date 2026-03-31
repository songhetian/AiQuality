import React from "react";
import { Card, Group, Text, ThemeIcon, rem } from "@mantine/core";
import { CountUp } from "./CountUp";

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
    <Card withBorder radius="md" p="md" shadow="sm">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {title}
        </Text>
        <ThemeIcon color={color} variant="light" size={32} radius="md">
          <Icon style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
        </ThemeIcon>
      </Group>

      <Group align="flex-end" gap="xs" mt={rem(20)}>
        <Text fw={800} fz="xl" lh={1} c="green.9">
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
        <Text fz="xs" c="dimmed" mt={rem(7)}>
          {description || "较昨日数据"}
        </Text>
      )}
    </Card>
  );
}
