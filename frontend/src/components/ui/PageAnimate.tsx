import { Box } from "@mantine/core";
import type { ReactNode } from "react";

interface PageAnimateProps {
  children: ReactNode;
}

export function PageAnimate({ children }: PageAnimateProps) {
  return (
    <Box
      style={{
        animation: "page-enter 0.35s ease-out",
      }}
    >
      {children}
    </Box>
  );
}
