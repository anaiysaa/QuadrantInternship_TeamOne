import { useAuth } from '@/contexts/AuthContext';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { HRDashboard } from '@/components/dashboards/HRDashboard';
import { ITDashboard } from '@/components/dashboards/ITDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'hr':
        return <HRDashboard />;
      case 'it':
        return <ITDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}