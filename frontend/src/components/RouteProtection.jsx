
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast.jsx';

export function RouteProtection({ children }) {
  const { user, canAccessPortal, currentPortal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const path = location.pathname;
    
    // Admin users have access to all routes
    if (user.role === 'admin') return;
    
    // Check if user is trying to access Admin routes
    if (path.startsWith('/admin/') && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access admin features.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    // Check if user is trying to access HR routes
    if (path.startsWith('/hr/') && user.role !== 'hr') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access HR portal features.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    // Check if user is trying to access IT routes
    if (path.startsWith('/it/') && user.role !== 'it') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access IT portal features.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    // Redirect general employees if they somehow get to restricted portals
    if (user.role === 'employee' && (currentPortal === 'HR Portal' || currentPortal === 'IT Portal' || currentPortal === 'Admin Dashboard')) {
      toast({
        title: "Access Denied",
        description: "You can only access the Employee Portal.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
  }, [user, location.pathname, currentPortal, navigate, toast]);

  return <>{children}</>;
}
