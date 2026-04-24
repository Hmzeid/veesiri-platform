import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from './store/auth';
import { useGovAuth } from './store/gov';
import AppShell from './components/AppShell';
import GovShell from './components/GovShell';
import LandingPage from './pages/LandingPage';
import SiriFrameworkPage from './pages/SiriFrameworkPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import AssessmentPage from './pages/AssessmentPage';
import GapAnalysisPage from './pages/GapAnalysisPage';
import FactoriesPage from './pages/FactoriesPage';
import RoadmapPage from './pages/RoadmapPage';
import RecommendationsPage from './pages/RecommendationsPage';
import DocumentsPage from './pages/DocumentsPage';
import NotificationsPage from './pages/NotificationsPage';
import CertificatePage from './pages/CertificatePage';
import BenchmarksPage from './pages/BenchmarksPage';
import ExecReportPage from './pages/ExecReportPage';
import SimulatorPage from './pages/SimulatorPage';
import RoiCalculatorPage from './pages/RoiCalculatorPage';
import TeamPage from './pages/TeamPage';
import TrainingHubPage from './pages/TrainingHubPage';
import VendorMarketplacePage from './pages/VendorMarketplacePage';
import IntegrationsPage from './pages/IntegrationsPage';
import CalendarPage from './pages/CalendarPage';
import KanbanPage from './pages/KanbanPage';
import SettingsPage from './pages/SettingsPage';
import ApiDocsPage from './pages/ApiDocsPage';
import GovLoginPage from './pages/gov/GovLoginPage';
import GovDashboardPage from './pages/gov/GovDashboardPage';
import GovFactoryDetailPage from './pages/gov/GovFactoryDetailPage';
import GovAlertsPage from './pages/gov/GovAlertsPage';
import GovLeaderboardPage from './pages/gov/GovLeaderboardPage';
import GovSearchPage from './pages/gov/GovSearchPage';
import GovComparePage from './pages/gov/GovComparePage';
import GovMinisterialReportPage from './pages/gov/GovMinisterialReportPage';
import VerifyCertificatePage from './pages/public/VerifyCertificatePage';

function Protected({ children }: { children: JSX.Element }) {
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  if (!hydrated) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}><Spin /></div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function GovProtected({ children }: { children: JSX.Element }) {
  const token = useGovAuth((s) => s.token);
  const hydrated = useGovAuth((s) => s.hydrated);
  if (!hydrated) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}><Spin /></div>;
  if (!token) return <Navigate to="/gov/login" replace />;
  return children;
}

// Wrap gov routes in a NESTED ConfigProvider using AntD's dark algorithm —
// this means every AntD component (cards, tables, inputs, selects, tags, menus,
// drawers, dropdowns) auto-themes correctly, with no CSS override wars.
function GovThemeWrap({ children }: { children: JSX.Element }) {
  const { i18n } = useTranslation();
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
  return (
    <ConfigProvider
      direction={direction}
      theme={{
        token: {
          colorPrimary: '#C8A548',
          colorInfo: '#C8A548',
          colorBgBase: '#0b1220',
          colorBgLayout: '#0b1220',
          colorBgContainer: '#121a2d',
          colorBgElevated: '#1a2440',
          colorBorder: 'rgba(255,255,255,0.08)',
          colorBorderSecondary: 'rgba(255,255,255,0.06)',
          colorText: '#e2e8f0',
          colorTextSecondary: '#94a3b8',
          colorTextTertiary: '#64748b',
          colorTextDescription: '#94a3b8',
          borderRadius: 10,
          fontFamily:
            direction === 'rtl'
              ? "'Tajawal', 'IBM Plex Sans Arabic', 'Noto Sans Arabic', Tahoma, sans-serif"
              : "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
        algorithm: theme.darkAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default function App() {
  const { i18n } = useTranslation();
  const hydrate = useAuth((s) => s.hydrate);
  const hydrateGov = useGovAuth((s) => s.hydrate);
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    hydrate();
    hydrateGov();
  }, [hydrate, hydrateGov]);

  return (
    <ConfigProvider
      direction={direction}
      theme={{
        token: {
          colorPrimary: '#006C35',
          colorInfo: '#1A2F4E',
          colorText: '#0b1220',
          colorTextSecondary: '#64748b',
          borderRadius: 10,
          fontFamily:
            direction === 'rtl'
              ? "'Tajawal', 'IBM Plex Sans Arabic', 'Noto Sans Arabic', Tahoma, sans-serif"
              : "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/siri" element={<SiriFrameworkPage />} />
        <Route path="/api-docs" element={<ApiDocsPage />} />
        <Route path="/verify/:code" element={<VerifyCertificatePage />} />

        {/* Factory auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Gov portal (dark theme via nested ConfigProvider) */}
        <Route path="/gov/login" element={<GovThemeWrap><GovLoginPage /></GovThemeWrap>} />
        <Route
          path="/gov"
          element={
            <GovProtected>
              <GovThemeWrap>
                <GovShell />
              </GovThemeWrap>
            </GovProtected>
          }
        >
          <Route index element={<Navigate to="/gov/dashboard" replace />} />
          <Route path="dashboard" element={<GovDashboardPage />} />
          <Route path="alerts" element={<GovAlertsPage />} />
          <Route path="leaderboard" element={<GovLeaderboardPage />} />
          <Route path="search" element={<GovSearchPage />} />
          <Route path="compare" element={<GovComparePage />} />
          <Route path="report" element={<GovMinisterialReportPage />} />
          <Route path="factories/:id" element={<GovFactoryDetailPage />} />
        </Route>

        {/* Factory app */}
        <Route
          path="/app"
          element={
            <Protected>
              <AppShell />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="factories" element={<FactoriesPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="factories/:factoryId/assessment/:assessmentId" element={<AssessmentPage />} />
          <Route path="factories/:factoryId/gap-analysis" element={<GapAnalysisPage />} />
          <Route path="factories/:factoryId/roadmap" element={<RoadmapPage />} />
          <Route path="factories/:factoryId/recommendations" element={<RecommendationsPage />} />
          <Route path="factories/:factoryId/documents" element={<DocumentsPage />} />
          <Route path="factories/:factoryId/certificate" element={<CertificatePage />} />
          <Route path="factories/:factoryId/benchmarks" element={<BenchmarksPage />} />
          <Route path="factories/:factoryId/simulator" element={<SimulatorPage />} />
          <Route path="factories/:factoryId/roi" element={<RoiCalculatorPage />} />
          <Route path="factories/:factoryId/team" element={<TeamPage />} />
          <Route path="factories/:factoryId/calendar" element={<CalendarPage />} />
          <Route path="factories/:factoryId/kanban" element={<KanbanPage />} />
          <Route path="training" element={<TrainingHubPage />} />
          <Route path="vendors" element={<VendorMarketplacePage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Standalone printable report */}
        <Route
          path="/app/factories/:factoryId/report"
          element={
            <Protected>
              <ExecReportPage />
            </Protected>
          }
        />

        {/* Legacy path redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/factories" element={<Navigate to="/app/factories" replace />} />
        <Route path="/onboarding" element={<Navigate to="/app/onboarding" replace />} />
        <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
        <Route path="/factories/:factoryId/*" element={<LegacyFactoryRedirect />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
}

function LegacyFactoryRedirect() {
  const path = window.location.pathname;
  return <Navigate to={`/app${path}`} replace />;
}
