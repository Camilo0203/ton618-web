import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import Logo from './components/Logo';
import CookieConsent from './components/CookieConsent';
import RouteScrollManager from './components/RouteScrollManager';
import SecurityHeaders from './components/SecurityHeaders';
import LandingPage from './pages/LandingPage';
import { LEGAL_DOCUMENT_TYPES } from './lib/legalDocuments';

const DashboardPage = lazy(() => import('./dashboard/DashboardPage'));
const AuthCallbackPage = lazy(() => import('./dashboard/AuthCallbackPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
function TebexRedirect() {
  useEffect(() => { window.location.replace('https://ton618-bot-webshop.tebex.io/'); }, []);
  return null;
}
const BillingSuccessPage = lazy(() => import('./billing/pages/BillingSuccessPage'));
const BillingCancelPage = lazy(() => import('./billing/pages/BillingCancelPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));

function AuthCallbackRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const hasAuthError = searchParams.get('error') || searchParams.get('error_description');

    if ((code || hasAuthError) && location.pathname !== '/auth/callback') {
      navigate(`/auth/callback${location.search}${location.hash}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

function DomainRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === 'dash.ton618bot.xyz' || hostname.startsWith('dash.')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return <LandingPage />;
}

function AppLoadingFallback() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Logo size="lg" withText={false} />
        </motion.div>
        <div className="text-center">
          <p className="text-lg font-semibold">{t('app.loadingTitle')}</p>
          <p className="text-sm text-slate-300">{t('app.loadingDescription')}</p>
        </div>
        <div className="flex gap-1">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="h-2 w-2 rounded-full bg-indigo-500"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-2 w-2 rounded-full bg-indigo-500"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="h-2 w-2 rounded-full bg-indigo-500"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <SecurityHeaders />
      <Toaster theme="dark" position="bottom-right" richColors />
      <RouteScrollManager />
      <AuthCallbackRedirect />
      <Suspense fallback={<AppLoadingFallback />}>
        <Routes>
          <Route path="/" element={<DomainRedirect />} />
          {LEGAL_DOCUMENT_TYPES.map((type) => (
            <Route key={type} path={`/${type}`} element={<LegalPage type={type} />} />
          ))}
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/pricing" element={<TebexRedirect />} />
          <Route path="/billing/success" element={<BillingSuccessPage />} />
          <Route path="/billing/cancel" element={<BillingCancelPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </>
  );
}
