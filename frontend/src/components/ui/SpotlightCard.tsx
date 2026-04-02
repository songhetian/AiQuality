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
          background: `radial-gradient(520px circle at ${mouse.x}px ${mouse.y}px, rgba(45, 223, 116, 0.14), transparent 72%), radial-gradient(360px circle at ${mouse.x}px ${mouse.y}px, rgba(199, 240, 65, 0.08), transparent 68%)`,
        }}
      />
      <Paper
        withBorder
        p="md"
        radius="lg"
        shadow="xs"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(245,255,248,0.97) 100%)',
          borderColor: uiTokens.colors.border,
          boxShadow: uiTokens.shadow.panel,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
