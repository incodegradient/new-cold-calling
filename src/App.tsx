import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import OverviewPage from '@/pages/dashboard/OverviewPage';
import ConnectionsPage from '@/pages/dashboard/ConnectionsPage';
import AgentsPage from '@/pages/dashboard/AgentsPage';
import LeadsPage from '@/pages/dashboard/LeadsPage';
import CampaignsPage from '@/pages/dashboard/CampaignsPage';
import ReportsPage from '@/pages/dashboard/ReportsPage';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = () => {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  const location = useLocation();
  
  useEffect(() => {
    const isDashboard = location.pathname.startsWith('/dashboard');
    if (isDashboard) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="connections" element={<ConnectionsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
