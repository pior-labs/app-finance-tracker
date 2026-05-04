import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';
import { DashboardPage } from '@/pages/Dashboard';
import { LoginPage } from '@/pages/Login';
import { TransactionsPage } from '@/pages/Transactions';
import { UploadPage } from '@/pages/Upload';
import { Design1 } from '@/pages/designs/Design1';
import { Design2 } from '@/pages/designs/Design2';
import { Design3 } from '@/pages/designs/Design3';
import { Design4 } from '@/pages/designs/Design4';
import { Design5 } from '@/pages/designs/Design5';
import { Design6 } from '@/pages/designs/Design6';
import { Design7 } from '@/pages/designs/Design7';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/1" element={<Design1 />} />
          <Route path="/2" element={<Design2 />} />
          <Route path="/3" element={<Design3 />} />
          <Route path="/4" element={<Design4 />} />
          <Route path="/5" element={<Design5 />} />
          <Route path="/6" element={<Design6 />} />
          <Route path="/7" element={<Design7 />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
