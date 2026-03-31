import { useMemo, useState } from 'react';
import { Avatar, Box, Group, Paper, SegmentedControl, Text } from '@mantine/core';

export type ChatStyle = 'wechat' | 'modern' | 'qq';

export interface ChatRecord {
  id: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  content: string;
  sendTime: string | Date;
}

interface VirtualChatListProps {
  records: ChatRecord[];
  highlightKeywords?: string[];
}

const STYLES = {
  wechat: { agentBg: '#95ec69', customerBg: '#ffffff', radius: 4, showAvatar: true },
  modern: {
    agentBg: 'var(--mantine-color-green-6)',
    customerBg: 'var(--mantine-color-gray-1)',
    radius: 16,
    showAvatar: true,
  },
  qq: { agentBg: '#0099ff', customerBg: '#ebebeb', radius: 12, showAvatar: false },
} as const;

export function VirtualChatList({
  records,
  highlightKeywords = [],
}: VirtualChatListProps) {
  const [chatStyle, setChatStyle] = useState<ChatStyle>(
    (localStorage.getItem('chat-style') as ChatStyle) || 'wechat',
  );

  const currentStyle = STYLES[chatStyle];
  const highlightRegex = useMemo(() => {
    if (highlightKeywords.length === 0) {
      return null;
    }

    return new RegExp(`(${highlightKeywords.join('|')})`, 'gi');
  }, [highlightKeywords]);

  const renderContent = (text: string) => {
    if (!highlightRegex) {
      return text;
    }

    return text.split(highlightRegex).map((part, index) =>
      highlightRegex.test(part) ? (
        <span
          key={`${part}-${index}`}
          style={{
            backgroundColor: '#ffc9c9',
            color: '#e03131',
            padding: '0 2px',
            borderRadius: 2,
          }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <Box style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <Box p="xs" bg="gray.0" style={{ borderBottom: '1px solid #eee' }}>
        <Group justify="space-between">
          <Text size="xs" fw={700}>
            聊天回顾
          </Text>
          <SegmentedControl
            size="xs"
            value={chatStyle}
            onChange={(value) => {
              setChatStyle(value as ChatStyle);
              localStorage.setItem('chat-style', value);
            }}
            data={[
              { label: '微信', value: 'wechat' },
              { label: '现代', value: 'modern' },
              { label: '极简', value: 'qq' },
            ]}
          />
        </Group>
      </Box>

      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {records.map((record) => {
          const isAgent = record.senderType === 'AGENT';
          const isSystem = record.senderType === 'SYSTEM';

          if (isSystem) {
            return (
              <Text key={record.id} size="xs" c="dimmed" ta="center" py="sm">
                {record.content}
              </Text>
            );
          }

          return (
            <Group
              key={record.id}
              p="xs"
              justify={isAgent ? 'flex-end' : 'flex-start'}
              align="flex-start"
              wrap="nowrap"
              gap="sm"
            >
              {!isAgent && currentStyle.showAvatar && (
                <Avatar radius="xl" color="blue" size="sm">
                  C
                </Avatar>
              )}
              <Paper
                p="sm"
                shadow="xs"
                style={{
                  maxWidth: '70%',
                  backgroundColor: isAgent ? currentStyle.agentBg : currentStyle.customerBg,
                  borderRadius: currentStyle.radius,
                  color: isAgent && chatStyle === 'qq' ? 'white' : 'inherit',
                  border: isAgent ? 'none' : '1px solid #dee2e6',
                }}
              >
                <Text size="sm">{renderContent(record.content)}</Text>
                <Text size="10px" c="dimmed" ta="right" mt={4} style={{ opacity: 0.7 }}>
                  {new Date(record.sendTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Paper>
              {isAgent && currentStyle.showAvatar && (
                <Avatar radius="xl" color="green" size="sm">
                  A
                </Avatar>
              )}
            </Group>
          );
        })}
      </Box>
    </Box>
  );
}
