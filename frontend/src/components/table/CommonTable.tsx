import React from 'react';
import { 
  Table, 
  Pagination, 
  Group, 
  Box, 
  Skeleton,
  Checkbox,
  rem,
} from '@mantine/core';
import { EmptyState } from '../ui/EmptyState';
import { uiTokens } from '../ui/uiTokens';
import { IconSearch } from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

interface CommonTableProps<T> {
  data: T[] | undefined;
  columns: Column<T>[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyIcon?: TablerIcon;
  emptyTitle?: string;
  selectable?: boolean;
  selectedIds?: Array<string | number>;
  onToggleRow?: (id: string | number, checked: boolean) => void;
  onToggleAll?: (ids: Array<string | number>, checked: boolean) => void;
}

export function CommonTable<T extends { id?: string | number; tagCode?: string }>({ 
  data = [], 
  columns, 
  total, 
  page, 
  pageSize,
  onPageChange, 
  loading = false,
  emptyIcon = IconSearch,
  emptyTitle = '暂无相关数据',
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
}: CommonTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rowIds = data
    .map((item, index) => item.id || item.tagCode || index)
    .filter((id): id is string | number => id !== undefined);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.includes(id));

  const renderSkeletons = () => (
    Array.from({ length: 5 }).map((_, idx) => (
      <Table.Tr key={`skeleton-${idx}`}>
        {selectable && (
          <Table.Td>
            <Skeleton height={20} radius="md" width={20} />
          </Table.Td>
        )}
        {columns.map((_, cIdx) => (
          <Table.Td key={`col-${cIdx}`}>
            <Skeleton height={20} radius="md" width="80%" />
          </Table.Td>
        ))}
      </Table.Tr>
    ))
  );

  return (
    <Box pos="relative">
      {!loading && data.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description="尝试调整搜索关键词或重置筛选条件" />
      ) : (
        <>
          <Table.ScrollContainer
            minWidth={800}
            style={{
              overflow: 'hidden',
              border: `1px solid ${uiTokens.colors.border}`,
              borderRadius: rem(uiTokens.radius.lg),
              background: uiTokens.background.surfaceHighlightSoft,
              boxShadow: uiTokens.shadow.panel,
            }}
          >
            <Table
              verticalSpacing="md"
              highlightOnHover
              withRowBorders
              styles={{
                table: {
                  overflow: 'hidden',
                },
                thead: {
                  background: uiTokens.background.tableHead,
                },
                th: {
                  fontSize: 12,
                  fontWeight: 800,
                  color: uiTokens.colors.textMuted,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${uiTokens.colors.border}`,
                },
                tr: {
                  transition: "background-color 0.18s ease, transform 0.18s ease",
                },
                tbody: {
                  fontSize: 13,
                },
                td: {
                  borderBottom: `1px solid ${uiTokens.colors.border}`,
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  {selectable && (
                    <Table.Th style={{ width: 48 }}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={!allSelected && selectedIds.length > 0}
                        onChange={(event) => onToggleAll?.(rowIds, event.currentTarget.checked)}
                      />
                    </Table.Th>
                  )}
                  {columns.map(col => (
                    <Table.Th key={col.key} style={{ width: col.width }}>{col.title}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loading
                  ? renderSkeletons()
                  : data.map((item, index) => (
                      <Table.Tr key={item.id || item.tagCode || index}>
                        {selectable && (
                          <Table.Td>
                            <Checkbox
                              checked={selectedIds.includes(item.id || item.tagCode || index)}
                              onChange={(event) =>
                                onToggleRow?.(
                                  (item.id || item.tagCode || index) as string | number,
                                  event.currentTarget.checked,
                                )
                              }
                            />
                          </Table.Td>
                        )}
                        {columns.map(col => (
                          <Table.Td key={col.key}>
                            {col.render
                              ? col.render(item)
                              : String((item as Record<string, unknown>)[col.key] ?? '')}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Group justify="space-between" mt="lg">
            <Box c={uiTokens.colors.textMuted} fz={13}>
              共 {total} 条记录
            </Box>
            <Pagination 
              total={totalPages} 
              value={page} 
              onChange={onPageChange} 
              color="green" 
              withEdges
              disabled={loading}
            />
          </Group>
        </>
      )}
    </Box>
  );
}
