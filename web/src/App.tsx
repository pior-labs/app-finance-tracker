import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';
import { DashboardThemeProvider } from '@/hooks/useDashboardTheme';
import { CategorizeStatsProvider } from '@/hooks/useCategorizeStats';
import { DashboardPage } from '@/pages/Dashboard';
import { LoginPage } from '@/pages/Login';
import { CategorizePage } from '@/pages/Categorize';
import { TransactionsPage } from '@/pages/Transactions';
import { CategoriesPage } from '@/pages/Categories';
import { StatementsPage } from '@/pages/Statements';
import { DashboardOne } from '@/pages/designs/DashboardOne';
import { DashboardTwo } from '@/pages/designs/DashboardTwo';
import { DashboardThree } from '@/pages/designs/DashboardThree';
import { DashboardFour } from '@/pages/designs/DashboardFour';
import { CategorizeOne } from '@/pages/designs/CategorizeOne';
import { CategorizeTwo } from '@/pages/designs/CategorizeTwo';
import { CategorizeThree } from '@/pages/designs/CategorizeThree';
import { CategorizeFour } from '@/pages/designs/CategorizeFour';
import { CategorizeFive } from '@/pages/designs/CategorizeFive';
import { CategorizeSeven } from '@/pages/designs/CategorizeSeven';

export function App() {
  return (
    <AuthProvider>
      <DashboardThemeProvider>
        <CategorizeStatsProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/1" element={<DashboardOne />} />
          <Route path="/2" element={<DashboardTwo />} />
          <Route path="/3" element={<DashboardThree />} />
          <Route path="/4" element={<DashboardFour />} />
          <Route path="/categorize/1" element={<CategorizeOne />} />
          <Route path="/categorize/2" element={<CategorizeTwo />} />
          <Route path="/categorize/3" element={<CategorizeThree />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/categorize" element={<CategorizePage />} />
            <Route path="/categorize/4" element={<CategorizeFour />} />
            <Route path="/categorize/5" element={<CategorizeFive />} />
            <Route path="/categorize/7" element={<CategorizeSeven />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/statements" element={<StatementsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
        </CategorizeStatsProvider>
      </DashboardThemeProvider>
    </AuthProvider>
  );
}
