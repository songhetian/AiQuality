import { Box, Paper, rem } from '@mantine/core';
import { useState } from 'react';

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
        borderRadius: rem(12),
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: -1,
          borderRadius: rem(12),
          background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(64, 192, 87, 0.15), transparent 80%)`,
        }}
      />
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ backgroundColor: 'transparent' }}>
        {children}
      </Paper>
    </Box>
  );
}
