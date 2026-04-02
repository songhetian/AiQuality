import { Box, Paper, rem } from '@mantine/core';
import { useState } from 'react';
import { uiTokens } from './uiTokens';

export function SpotlightCard({ children }: { children: React.ReactNode }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    setMouse({ x: clientX - left, y: clientY - top });
  }

  return (
    <Box
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        borderRadius: rem(uiTokens.radius.lg),
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: -1,
          borderRadius: rem(uiTokens.radius.lg),
          background: `radial-gradient(520px circle at ${mouse.x}px ${mouse.y}px, rgba(125, 154, 118, 0.1), transparent 78%)`,
        }}
      />
      <Paper
        withBorder
        p="md"
        radius="md"
        shadow="xs"
        style={{
          backgroundColor: 'transparent',
          borderColor: uiTokens.colors.border,
          boxShadow: uiTokens.shadow.panel,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
