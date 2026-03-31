import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Group,
  Text,
  Title,
  RingProgress,
  Center,
  Box,
  rem,
  Stack,
  Badge,
} from "@mantine/core";
import {
  IconMessages,
  IconAlertTriangle,
  IconCheckupList,
  IconTrendingUp,
} from "@tabler/icons-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { LineChart } from "../../components/ui/LineChart";
import { StatsCard } from "../../components/ui/StatsCard";
import { useSocket } from "../../hooks/useSocket";
import { notifications } from "@mantine/notifications";
import type { EChartsOption } from "echarts";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { PageAnimate } from "../../components/ui/PageAnimate";

type ViolationAlertEvent = {
  sessionId?: string;
};

export default function DashboardPage() {
  const { on } = useSocket();
  const [violations, setViolations] = useState(34);

  useEffect(() => {
    const cleanup = on("violation_alert", (payload) => {
      const data = (payload ?? {}) as ViolationAlertEvent;
      setViolations((prev) => prev + 1);
      notifications.show({
        title: "实时违规告警",
        message: `会话 ${data.sessionId || "-"} 检测到违规词`,
        color: "red",
      });
    });
    return cleanup;
  }, [on]);

  const trendOption: EChartsOption = {
    xAxis: {
      type: "category",
      data: ["03-11", "03-12", "03-13", "03-14", "03-15", "03-16", "03-17"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "质检趋势",
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: "line",
        smooth: true,
        areaStyle: { opacity: 0.1 },
      },
    ],
  };

  return (
    <PageAnimate>
      <Box>
        <SpotlightCard>
          <PageHeader
            title="雷犀质检控制台"
            description="欢迎回来，这是您今日的质检业务概览"
          />
          <Group justify="space-between" mt="sm" wrap="wrap">
            <Text size="sm" c="dimmed">
              实时违规提醒与关键质检指标会在这里持续刷新
            </Text>
            <Badge color="green" variant="light">
              今日运行稳定
            </Badge>
          </Group>
        </SpotlightCard>
      </Box>

      <Grid my="md">
        <Grid.Col span={3}>
          <Box>
            <StatsCard
              title="今日会话总量"
              value={1240}
              diff="+12%"
              icon={IconMessages}
              color="blue"
            />
          </Box>
        </Grid.Col>
        <Grid.Col span={3}>
          <Box>
            <StatsCard
              title="累计违规记录"
              value={violations}
              diff="-5%"
              icon={IconAlertTriangle}
              color="red"
            />
          </Box>
        </Grid.Col>
        <Grid.Col span={3}>
          <Box>
            <StatsCard
              title="待处理复核"
              value={18}
              diff="+8"
              icon={IconCheckupList}
              color="orange"
            />
          </Box>
        </Grid.Col>
        <Grid.Col span={3}>
          <Box>
            <StatsCard
              title="AI 自动化率"
              value="98.5%"
              diff="+2%"
              icon={IconTrendingUp}
              color="green"
            />
          </Box>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={8}>
          <Box>
            <Card withBorder radius="md" shadow="sm">
              <Title order={4} mb="lg" c="green.9">
                质检工作趋势 (近7日)
              </Title>
              <LineChart option={trendOption} height={320} />
            </Card>
          </Box>
        </Grid.Col>
        <Grid.Col span={4}>
          <Box>
            <Card withBorder radius="md" shadow="sm">
              <Title order={4} mb="lg" c="green.9">
                风险维度分布
              </Title>
              <Center py={rem(20)}>
                <RingProgress
                  size={220}
                  thickness={22}
                  roundCaps
                  sections={[
                    { value: 40, color: "red", tooltip: "敏感词" },
                    { value: 25, color: "orange", tooltip: "服务态度" },
                    { value: 35, color: "yellow", tooltip: "逻辑错误" },
                  ]}
                  label={
                    <Center>
                      <Stack gap={0} align="center">
                        <Text fw={800} fz="xl" c="green.9">
                          100%
                        </Text>
                        <Text size="xs" c="dimmed">
                          健康度
                        </Text>
                      </Stack>
                    </Center>
                  }
                />
              </Center>
              <Group justify="center" mt="md" gap="xl">
                <Badge color="red" variant="dot">
                  敏感词
                </Badge>
                <Badge color="orange" variant="dot">
                  态度
                </Badge>
                <Badge color="yellow" variant="dot">
                  逻辑
                </Badge>
              </Group>
            </Card>
          </Box>
        </Grid.Col>
      </Grid>
    </PageAnimate>
  );
}
