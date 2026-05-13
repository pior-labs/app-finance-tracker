import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';
import { DashboardPage } from '@/pages/Dashboard';
import { LoginPage } from '@/pages/Login';
import { CategorizePage } from '@/pages/Categorize';
import { TransactionsPage } from '@/pages/Transactions';
import { CategoriesPage } from '@/pages/Categories';
import { StatementsPage } from '@/pages/Statements';
import { DashboardOne } from '@/pages/designs/DashboardOne';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/1" element={<DashboardOne />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
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
    </AuthProvider>
  );
}
