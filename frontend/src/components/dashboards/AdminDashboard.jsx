import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { 
  Shield, 
  Users, 
  Building2, 
  HardDrive, 
  Eye
} from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { PortalSettings } from '@/components/admin/PortalSettings';
import { AccessControl } from '@/components/admin/AccessControl';
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { ActivityLogs } from '@/components/admin/ActivityLogs';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { PortalViewDialog } from '@/components/dialogs/PortalViewDialog';
import { PortalEditDialog } from '@/components/dialogs/PortalEditDialog';

const handleGetEmployeeCount = async () => {
  const response = await axios.get(`http://localhost:8000/api/employees/count`);
  return response.data;
};

export function AdminDashboard() {
  const { user, logAdminAction } = useAuth();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [employeeCounts, setEmployeeCounts] = useState({ all: 0, HR: 0, IT: 0 });
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin-dashboard")
      .then((res) => res.json())
      .then((data) => setAdminData(data))
      .catch((err) => console.error("Error loading admin dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const countData = await handleGetEmployeeCount();
        setEmployeeCounts({
          all: countData['All'] || 0,
          HR: countData['HR'] || 0,
          IT: countData['IT'] || 0
        });
      } catch (error) {
        console.error('Error fetching employee count:', error);
      }
    };
    fetchEmployeeCount();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin/users') setActiveSection('users');
    else if (path === '/admin/portals') setActiveSection('portals');
    else if (path === '/admin/access') setActiveSection('access');
    else if (path === '/admin/analytics') setActiveSection('analytics');
    else if (path === '/admin/logs') setActiveSection('logs');
    else if (path === '/admin/content') setActiveSection('content');
    else if (path === '/admin/settings') setActiveSection('system');
    else setActiveSection('overview');
  }, [location.pathname]);

  const handleAdminAction = (action, details = {}) => {
    logAdminAction(action, details);
  };

  const handleViewPortal = (portal) => {
    setSelectedPortal(portal);
    setShowViewDialog(true);
    handleAdminAction('Portal View', { portal: portal.name });
  };

  const handleEditPortal = (portal) => {
    setSelectedPortal(portal);
    setShowEditDialog(true);
    handleAdminAction('Portal Edit', { portal: portal.name });
  };

  const handleSavePortal = (updatedPortal) => {
    console.log('Saving portal:', updatedPortal);
    handleAdminAction('Portal Updated', { portal: updatedPortal.name });
  };

  if (loading || !adminData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const {
    pendingFeedback = 0,
    pendingLeaveRequests = 0,
    openItTickets = 0,
    announcements = [],
    activeAnnouncementsCount = 0,
    adminName = "Admin",
    totalEmployees = 0
  } = adminData;

  const portalStats = [
    { name: 'Employee Portal', icon: Users, users: employeeCounts.all, status: 'Active', color: 'text-purple-600 bg-purple-50' },
    { name: 'HR Portal', icon: Building2, users: employeeCounts.HR, status: 'Active', color: 'text-blue-600 bg-blue-50' },
    { name: 'IT Portal', icon: HardDrive, users: employeeCounts.IT, status: 'Active', color: 'text-green-600 bg-green-50' },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'portals':
        return <PortalSettings />;
      case 'access':
        return <AccessControl />;
      case 'analytics':
        return <SystemAnalytics />;
      case 'logs':
        return <ActivityLogs />;
      case 'content':
        return <ContentManagement />;
      case 'system':
        return <SystemSettings />;
      default:
        return (
          <div className="space-y-6">
            {/* Portal Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Portal Overview
                </CardTitle>
                <CardDescription>Monitor and manage all portals across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {portalStats.map((portal) => (
                    <div key={portal.name} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${portal.color}`}>
                          <portal.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">{portal.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground">{portal.name}</h3>
                      <p className="text-sm text-muted-foreground">{portal.users} active users</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleViewPortal(portal)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin KPIs */}
            <h2 className="text-2xl font-bold">Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card><CardHeader><CardTitle>Total Employees</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalEmployees}</CardContent></Card>
              <Card><CardHeader><CardTitle>Pending Feedback</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{pendingFeedback}</CardContent></Card>
              <Card><CardHeader><CardTitle>Pending Leave Requests</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{pendingLeaveRequests}</CardContent></Card>
              <Card><CardHeader><CardTitle>Open IT Tickets</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{openItTickets}</CardContent></Card>
            </div>

            {/* Announcements */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">
                Active Announcements {activeAnnouncementsCount ? `(${activeAnnouncementsCount})` : ""}
              </h3>
              <div className="space-y-2">
                {announcements.length > 0 ? (
                  announcements.map((a, i) => (
                    <div key={i} className="p-3 border rounded-md flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <strong>{a.title}</strong>
                        {a.priority && <Badge variant="outline">{a.priority}</Badge>}
                      </div>
                      <p className="text-sm">{a.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.department ? `Dept: ${a.department} · ` : ""}
                        Created {a.createdDate ? new Date(a.createdDate).toLocaleString() : "Unknown"} · 
                        Expires {a.expiryDate ? new Date(a.expiryDate).toLocaleDateString() : "No expiry"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No active announcements</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || adminName}. Manage all portals and system settings from here.
          </p>
        </div>
        <Badge variant="destructive" className="px-3 py-1">
          <Shield className="h-3 w-3 mr-1" />
          ADMIN ACCESS
        </Badge>
        {renderActiveSection()}
      </div>

      {/* Dialogs */}
      <PortalViewDialog open={showViewDialog} onOpenChange={setShowViewDialog} portal={selectedPortal} />
      <PortalEditDialog open={showEditDialog} onOpenChange={setShowEditDialog} portal={selectedPortal} onSave={handleSavePortal} />
    </>
  );
}
