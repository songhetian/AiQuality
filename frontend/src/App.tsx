import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MantineProvider, Center, Loader, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./components/ui/MainLayout";
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
  primaryColor: "green",
  primaryShade: 6,
  colors: {
    green: [
      "#ebfbee",
      "#d3f9d8",
      "#b2f2bb",
      "#8ce99a",
      "#69db7c",
      "#51cf66",
      "#40c057",
      "#37b24d",
      "#2f9e44",
      "#2b8a3e",
    ],
  },
});

function AppShellFallback() {
  return (
    <Center mih="100vh">
      <Loader color="green" size="lg" />
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

                  <Route
                    element={<ProtectedRoute requiredPermission="violation:record" />}
                  >
                    <Route path="/violation" element={<ViolationRecordPage />} />
                  </Route>
                  <Route
                    element={<ProtectedRoute requiredPermission="insight:question" />}
                  >
                    <Route
                      path="/insight/question"
                      element={<HighFreqQuestionPage />}
                    />
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
