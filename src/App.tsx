import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Logo from './components/Logo';
import RouteScrollManager from './components/RouteScrollManager';
import LandingPage from './pages/LandingPage';
import { LEGAL_DOCUMENT_TYPES } from './lib/legalDocuments';

const DashboardPage = lazy(() => import('./dashboard/DashboardPage'));
const AuthCallbackPage = lazy(() => import('./dashboard/AuthCallbackPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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
      <RouteScrollManager />
      <Suspense fallback={<AppLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {LEGAL_DOCUMENT_TYPES.map((type) => (
            <Route key={type} path={`/${type}`} element={<LegalPage type={type} />} />
          ))}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
