import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MantineProvider, Center, Loader, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./components/ui/MainLayout";
import { uiTokens } from "./components/ui/uiTokens";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const TagPage = lazy(() => import("./pages/tag/TagPage"));
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const OrganizationPage = lazy(() => import("./pages/org/OrganizationPage"));
const AdapterPage = lazy(() => import("./pages/adapter/AdapterPage"));
const UserPage = lazy(() => import("./pages/user/UserPage"));
const KeywordPage = lazy(() => import("./pages/keyword/KeywordPage"));
const RolePage = lazy(() => import("./pages/role/RolePage"));
const QualityPage = lazy(() => import("./pages/quality/QualityPage"));
const CostPage = lazy(() => import("./pages/cost/CostPage"));
const AiConfigPage = lazy(() => import("./pages/ai/AiConfigPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/auth/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("./pages/auth/UnauthorizedPage"));
const ViolationRecordPage = lazy(() => import("./pages/violation/ViolationRecordPage"));
const HighFreqQuestionPage = lazy(() => import("./pages/insight/HighFreqQuestionPage"));
const LossAnalysisPage = lazy(() => import("./pages/insight/LossAnalysisPage"));
const KnowledgePage = lazy(() => import("./pages/knowledge/KnowledgePage"));
const OperationLogPage = lazy(() => import("./pages/log/OperationLogPage"));
const SystemLogPage = lazy(() => import("./pages/log/SystemLogPage"));

const queryClient = new QueryClient();

const theme = createTheme({
  primaryColor: "blue",
  primaryShade: 6,
  defaultRadius: "md",
  fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif",
  fontSizes: {
    xs: "12px",
    sm: "13px",
    md: "14px",
    lg: "15px",
    xl: "17px",
  },
  headings: {
    fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif",
    sizes: {
      h1: { fontSize: "30px", lineHeight: "1.2", fontWeight: "700" },
      h2: { fontSize: "24px", lineHeight: "1.25", fontWeight: "700" },
      h3: { fontSize: "20px", lineHeight: "1.3", fontWeight: "700" },
      h4: { fontSize: "17px", lineHeight: "1.35", fontWeight: "700" },
      h5: { fontSize: "15px", lineHeight: "1.4", fontWeight: "700" },
      h6: { fontSize: "14px", lineHeight: "1.4", fontWeight: "700" },
    },
  },
  colors: {
    blue: [
      "#eef4ff",
      "#dfeafe",
      "#c4d9fd",
      "#9fc0fb",
      "#73a2f8",
      "#4a85f2",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#172f75",
    ],
    gray: [
      "#f8fafc",
      "#f1f5f9",
      "#e2e8f0",
      "#cbd5e1",
      "#94a3b8",
      "#64748b",
      "#475569",
      "#334155",
      "#1e293b",
      "#0f172a",
    ],
  },
  components: {
    Button: {
      defaultProps: {
        size: "sm",
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          boxShadow: uiTokens.shadow.soft,
          transition: "transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: "md",
        variant: "light",
      },
      styles: {
        root: {
          border: `1px solid ${uiTokens.colors.border}`,
          background: uiTokens.colors.panel,
          boxShadow: "none",
        },
      },
    },
    TextInput: {
      defaultProps: {
        size: "sm",
        radius: "md",
      },
      styles: {
        input: {
          borderColor: uiTokens.colors.border,
          backgroundColor: uiTokens.colors.panel,
          minHeight: 42,
        },
      },
    },
    PasswordInput: {
      defaultProps: {
        size: "sm",
        radius: "md",
      },
      styles: {
        input: {
          borderColor: uiTokens.colors.border,
          backgroundColor: uiTokens.colors.panel,
          minHeight: 42,
        },
      },
    },
    Select: {
      defaultProps: {
        size: "sm",
        radius: "md",
      },
      styles: {
        input: {
          borderColor: uiTokens.colors.border,
          backgroundColor: uiTokens.colors.panel,
          minHeight: 42,
        },
      },
    },
    NumberInput: {
      defaultProps: {
        size: "sm",
        radius: "md",
      },
      styles: {
        input: {
          borderColor: uiTokens.colors.border,
          backgroundColor: uiTokens.colors.panel,
          minHeight: 42,
        },
      },
    },
    Textarea: {
      defaultProps: {
        size: "sm",
        radius: "md",
      },
      styles: {
        input: {
          borderColor: uiTokens.colors.border,
          backgroundColor: uiTokens.colors.panel,
        },
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        radius: "lg",
        shadow: "xs",
      },
      styles: {
        root: {
          borderColor: uiTokens.colors.border,
          boxShadow: uiTokens.shadow.panel,
          background: uiTokens.background.panel,
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        root: {
          borderColor: uiTokens.colors.border,
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.1px",
          paddingInline: 10,
        },
      },
    },
    Tabs: {
      styles: {
        list: {
          gap: 8,
        },
        tab: {
          borderRadius: uiTokens.radius.md,
          fontWeight: 600,
          paddingInline: 14,
          background: "rgba(255,255,255,0.72)",
          border: `1px solid transparent`,
        },
      },
    },
    Table: {
      styles: {
        th: {
          backgroundColor: uiTokens.colors.panelSubtle,
          color: uiTokens.colors.text,
          fontWeight: 700,
          borderBottomColor: uiTokens.colors.border,
        },
        td: {
          borderBottomColor: uiTokens.colors.border,
        },
      },
    },
    Pagination: {
      defaultProps: {
        radius: "md",
        size: "sm",
      },
    },
    Menu: {
      styles: {
        dropdown: {
          borderColor: uiTokens.colors.border,
          boxShadow: uiTokens.shadow.panel,
        },
      },
    },
    Modal: {
      styles: {
        content: {
          borderRadius: uiTokens.radius.lg,
        },
        header: {
          borderBottom: `1px solid ${uiTokens.colors.border}`,
        },
      },
    },
  },
});

function AppShellFallback() {
  return (
    <Center mih="100vh">
      <Loader color="blue" size="lg" />
    </Center>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications />
        <BrowserRouter>
          <Suspense fallback={<AppShellFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/403" element={<UnauthorizedPage />} />
              <Route path="/404" element={<NotFoundPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<DashboardPage />} />

                  <Route element={<ProtectedRoute requiredPermission="org:view" />}>
                    <Route path="/org" element={<OrganizationPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="adapter:view" />}>
                    <Route path="/adapter" element={<AdapterPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="user:view" />}>
                    <Route path="/user" element={<UserPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="role:view" />}>
                    <Route path="/role" element={<RolePage />} />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="violation:record" />}>
                    <Route path="/violation" element={<ViolationRecordPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="insight:question" />}>
                    <Route path="/insight/question" element={<HighFreqQuestionPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="insight:loss" />}>
                    <Route path="/insight/loss" element={<LossAnalysisPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="knowledge:view" />}>
                    <Route path="/knowledge" element={<KnowledgePage />} />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="tag:view" />}>
                    <Route path="/tag" element={<TagPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="keyword:view" />}>
                    <Route path="/keyword" element={<KeywordPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="chat:view" />}>
                    <Route path="/chat" element={<ChatPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="quality:view" />}>
                    <Route path="/quality" element={<QualityPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="cost:view" />}>
                    <Route path="/cost" element={<CostPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="ai-config:view" />}>
                    <Route path="/ai-config" element={<AiConfigPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="settings:view" />}>
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="log:view" />}>
                    <Route path="/log/operation" element={<OperationLogPage />} />
                    <Route path="/log/system" element={<SystemLogPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}
