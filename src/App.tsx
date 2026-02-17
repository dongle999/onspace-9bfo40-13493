import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/features/LoadingSpinner';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Templates = lazy(() => import('@/pages/Templates'));
const Scans = lazy(() => import('@/pages/Scans'));
const Results = lazy(() => import('@/pages/Results'));
const Settings = lazy(() => import('@/pages/Settings'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/templates"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Templates />
                </Suspense>
              }
            />
            <Route
              path="/scans"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Scans />
                </Suspense>
              }
            />
            <Route
              path="/results"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Results />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
