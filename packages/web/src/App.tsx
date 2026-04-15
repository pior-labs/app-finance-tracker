import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { UploadPage } from './pages/UploadPage';
import { DesignOne } from './pages/DesignOne';
import { DesignTwo } from './pages/DesignTwo';
import { DesignThree } from './pages/DesignThree';
import { DesignFour } from './pages/DesignFour';
import { DesignFive } from './pages/DesignFive';
import { DesignSix } from './pages/DesignSix';
import { DesignSeven } from './pages/DesignSeven';
import { DesignEight } from './pages/DesignEight';
import { DesignNine } from './pages/DesignNine';
import { DesignTen } from './pages/DesignTen';

export default function App() {
  return (
    <Routes>
      <Route path="/1" element={<DesignOne />} />
      <Route path="/2" element={<DesignTwo />} />
      <Route path="/3" element={<DesignThree />} />
      <Route path="/4" element={<DesignFour />} />
      <Route path="/5" element={<DesignFive />} />
      <Route path="/6" element={<DesignSix />} />
      <Route path="/7" element={<DesignSeven />} />
      <Route path="/8" element={<DesignEight />} />
      <Route path="/9" element={<DesignNine />} />
      <Route path="/10" element={<DesignTen />} />
      <Route
        path="/*"
        element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Routes>
          </AppLayout>
        }
      />
    </Routes>
  );
}
