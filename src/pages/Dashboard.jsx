
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { HRDashboard } from '@/components/dashboards/HRDashboard';
import { ITDashboard } from '@/components/dashboards/ITDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, currentPortal, canAccessPortal } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const previousPortalRef = useRef(currentPortal);

  useEffect(() => {
    if (user && !canAccessPortal(currentPortal)) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access the ${currentPortal}.`,
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, currentPortal, canAccessPortal, navigate, toast]);

  // Auto-refresh when portal changes
  useEffect(() => {
    if (previousPortalRef.current !== currentPortal) {
      console.log(`Portal changed from ${previousPortalRef.current} to ${currentPortal} - refreshing dashboard`);
      
      // Update the ref to the new portal
      previousPortalRef.current = currentPortal;
      
      // Force a re-render by triggering a state change in the component tree
      // This ensures all child components refresh with the new portal context
      window.dispatchEvent(new CustomEvent('portalChanged', { 
        detail: { 
          from: previousPortalRef.current, 
          to: currentPortal 
        }
      }));
    }
  }, [currentPortal]);

  const renderDashboard = () => {
    // Admin Dashboard
    if (currentPortal === 'Admin Dashboard' && user?.role === 'admin') {
      return <AdminDashboard key={`admin-${currentPortal}`} />;
    }

    // For general employees, always show Employee Dashboard
    if (user?.role === 'employee') {
      return <EmployeeDashboard key={`employee-${currentPortal}`} />;
    }

    // For HR/IT/Admin users, show dashboard based on current portal
    switch (currentPortal) {
      case 'HR Portal':
        if (user?.role === 'hr' || user?.role === 'admin') {
          return <HRDashboard key={`hr-${currentPortal}`} />;
        }
        return <EmployeeDashboard key={`employee-${currentPortal}`} />;
      case 'IT Portal':
        if (user?.role === 'it' || user?.role === 'admin') {
          return <ITDashboard key={`it-${currentPortal}`} />;
        }
        return <EmployeeDashboard key={`employee-${currentPortal}`} />;
      case 'Employee Portal':
      default:
        return <EmployeeDashboard key={`employee-${currentPortal}`} />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
