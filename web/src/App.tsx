import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';
import { CategorizeStatsProvider } from '@/hooks/useCategorizeStats';
import { ToastProvider } from '@/hooks/useToast';
import { UncategorizedCountProvider } from '@/hooks/useUncategorizedCount';
import { DashboardPage } from '@/pages/dashboard';
import { LoginPage } from '@/pages/login';
import { CategorizePage } from '@/pages/categorize';
import { TransactionsPage } from '@/pages/transactions';
import { CategoriesPage } from '@/pages/categories';
import { StatementsPage } from '@/pages/statements';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CategorizeStatsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <UncategorizedCountProvider>
                      <AppShell />
                    </UncategorizedCountProvider>
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/categorize" element={<CategorizePage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/statements" element={<StatementsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CategorizeStatsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
