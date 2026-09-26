import { AppProvider, useApp } from './store';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminGate } from './pages/AdminGate';

function Router() {
  const { view, isAdmin } = useApp();

  switch (view) {
    case 'student':
      return <StudentDashboard />;
    case 'report':
      return <ReportIssuePage />;
    case 'admin':
      return isAdmin ? <AdminDashboard /> : <AdminGate />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}