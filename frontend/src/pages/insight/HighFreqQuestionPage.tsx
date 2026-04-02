import { useState } from "react";
import {
  Box,
  Card,
  Group,
  Badge,
  Text,
  Select,
  rem,
  UnstyledButton,
  TextInput,
  Grid,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconChartBar, IconSearch, IconFilter, IconHash } from "@tabler/icons-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { CommonTable } from "../../components/table/CommonTable";
import { PageAnimate } from "../../components/ui/PageAnimate";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { PieChart } from "../../components/ui/PieChart";
import { uiTokens } from "../../components/ui/uiTokens";
import api from "../../lib/axios";
import type { EChartsOption } from "echarts";

type PagedResult<T> = {
  list: T[];
  total: number;
};

type QuestionTag = {
  id?: string;
  name?: string | null;
  color?: string | null;
};

type HighFreqQuestionItem = {
  id: string;
  content?: string | null;
  tag?: QuestionTag | null;
  count?: number | null;
  productId?: string | null;
};

export default function HighFreqQuestionPage() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState('7d');
  const [search, setSearch] = useState('');
  const [tagId, setTagId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PagedResult<HighFreqQuestionItem>>({
    queryKey: ["high-freq-questions", page, dateRange, tagId, search],
    queryFn: async () => (await api.get("/ai/insight/question", { 
      params: { page, pageSize: 10, dateRange, tagId, search } 
    })).data
  });
  const { data: questionTags = [] } = useQuery<QuestionTag[]>({
    queryKey: ["high-freq-question-tags"],
    queryFn: async () => (await api.get("/ai/insight/question/tags")).data,
  });
  const tagOptions = questionTags.map((item) => ({
    value: item.id || "",
    label: item.name || "",
  }));

  const pieData = data?.list?.reduce<Record<string, number>>((acc, curr) => {
    const tagName = curr.tag?.name || '其他';
    acc[tagName] = (acc[tagName] || 0) + (curr.count || 0);
    return acc;
  }, {}) || {};
  
  const pieOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: Object.keys(pieData || {}).map(k => ({ value: pieData[k], name: k }))
    }]
  };

  const columns = [
    { key: 'content', title: '问题描述', render: (item: HighFreqQuestionItem) => <Text size="sm" fw={500}>{item.content}</Text> },
    { key: 'tag', title: '分类标签', render: (item: HighFreqQuestionItem) => <Badge color="blue" variant="outline">{item.tag?.name || '未分类'}</Badge> },
    { 
      key: 'count', 
      title: '咨询频次', 
      render: (item: HighFreqQuestionItem) => (
        <Group gap="xs">
          <Text size="sm" fw={700}>{item.count}</Text>
          <IconChartBar size={14} color="gray" />
        </Group>
      )
    },
    { key: 'relatedProduct', title: '关联商品', render: (item: HighFreqQuestionItem) => <Text size="xs" c="dimmed">{item.productId || '全局通用'}</Text> },
  ];

  const dateBtnStyle = {
    height: rem(44),
    border: `1px solid ${uiTokens.colors.borderStrong}`,
    padding: `0 ${rem(16)}`,
    fontSize: rem(14),
    fontWeight: 600,
    color: uiTokens.colors.text,
    backgroundColor: uiTokens.colors.panel,
  };

  return (
    <PageAnimate>
      <Box>
        <PageHeader
          title="高频问题分析"
          description="基于 AI 语义聚类自动发现热门咨询点，辅助客服知识库沉淀"
        />

        <SpotlightCard>
          <Group gap="md" wrap="nowrap" style={{ width: '100%' }}>
            <TextInput
              placeholder="搜索问题关键词..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              styles={{ root: { flexGrow: 2 } }}
            />
            <Select
              placeholder="分类过滤"
              data={tagOptions} 
              leftSection={<IconFilter size={16} />}
              value={tagId}
              onChange={setTagId}
              clearable
              styles={{ root: { flexGrow: 1 } }}
            />
            
            <Group gap={0} wrap="nowrap" style={{ border: `1px solid ${uiTokens.colors.borderStrong}`, borderRadius: rem(10), overflow: 'hidden' }}>
              <UnstyledButton 
                style={{ ...dateBtnStyle, border: 'none', background: dateRange === 'today' ? uiTokens.background.navItemActive : uiTokens.colors.panel }}
                onClick={() => setDateRange('today')}
              >今天</UnstyledButton>
              <UnstyledButton 
                style={{ ...dateBtnStyle, border: 'none', borderLeft: `1px solid ${uiTokens.colors.borderStrong}`, borderRight: `1px solid ${uiTokens.colors.borderStrong}`, background: dateRange === '7d' ? uiTokens.background.navItemActive : uiTokens.colors.panel }}
                onClick={() => setDateRange('7d')}
              >近7天</UnstyledButton>
              <UnstyledButton 
                style={{ ...dateBtnStyle, border: 'none', background: dateRange === '30d' ? uiTokens.background.navItemActive : uiTokens.colors.panel }}
                onClick={() => setDateRange('30d')}
              >近30天</UnstyledButton>
            </Group>
          </Group>
        </SpotlightCard>

        <Grid my="md">
          <Grid.Col span={12}>
            <Card withBorder radius="md" padding="lg">
              <Text fw={700} mb="md" c="dimmed">问题分类占比</Text>
              <PieChart option={pieOption} height={300} />
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder radius="md">
          <CommonTable 
            data={data?.list} 
            columns={columns} 
            total={data?.total || 0} 
            page={page} 
            pageSize={10}
            onPageChange={setPage} 
            loading={isLoading}
            emptyIcon={IconHash}
            emptyTitle="暂无高频问题总结"
          />
        </Card>
      </Box>
    </PageAnimate>
  );
}
