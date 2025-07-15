
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Define navigation items for each portal
const navigationItems = {
  'Admin Dashboard': [
    { name: 'Admin Overview', path: '/dashboard', icon: '🛡️' },
    { name: 'User Management', path: '/admin/users', icon: '👥' },
    { name: 'Portal Settings', path: '/admin/portals', icon: '⚙️' },
    { name: 'Access Control', path: '/admin/access', icon: '🔐' },
    { name: 'System Analytics', path: '/admin/analytics', icon: '📊' },
    { name: 'Activity Logs', path: '/admin/logs', icon: '📋' },
    { name: 'Content Management', path: '/admin/content', icon: '📝' },
    { name: 'System Settings', path: '/admin/settings', icon: '🔧' },
  ],
  'HR Portal': [
    { name: 'HR Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Leave Requests', path: '/hr/leave-requests', icon: '📅' },
    { name: 'Timesheets', path: '/hr/timesheets', icon: '⏰' },
    { name: 'Employee Directory', path: '/hr/employees', icon: '👥' },
    { name: 'Onboarding', path: '/hr/onboarding', icon: '🎯' },
    { name: 'HR Tickets', path: '/hr/tickets', icon: '🎫' },
    { name: 'Feedback Center', path: '/hr/feedback', icon: '💭' },
    { name: 'Career Portal', path: '/hr/career', icon: '🚀' },
    { name: 'Payroll', path: '/hr/payroll', icon: '💰' },
    { name: 'Org Chart', path: '/hr/org-chart', icon: '🏢' },
    { name: 'Live Chat', path: '/hr/live-chat', icon: '💬' },
  ],
  'IT Portal': [
    { name: 'IT Dashboard', path: '/dashboard', icon: '🖥️' },
    { name: 'Support Queue', path: '/it/support', icon: '🎫' },
    { name: 'Asset Management', path: '/it/assets', icon: '📱' },
    { name: 'Inventory', path: '/it/inventory', icon: '📦' },
    { name: 'Live Chat', path: '/it/chat', icon: '💬' },
    { name: 'Knowledge Base', path: '/it/knowledge', icon: '📖' },
    { name: 'Software Center', path: '/it/software', icon: '💿' },
  ],
  'Employee Portal': [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Leave Management', path: '/leave', icon: '📅' },
    { name: 'Timesheet', path: '/timesheet', icon: '⏰' },
    { name: 'Performance Hub', path: '/performance', icon: '📈' },
    { name: 'Career Portal', path: '/career', icon: '🚀' },
    { name: 'Feedback', path: '/feedback', icon: '💬' },
    { name: 'Support Tickets', path: '/tickets', icon: '🎫' },
    { name: 'Resources', path: '/resources', icon: '📚' },
    { name: 'Learning (LMS)', path: '/lms', icon: '🎓' },
    { name: 'Live Chat', path: '/live-chat', icon: '💬' },
  ]
};

export function Sidebar() {
  const { user, currentPortal } = useAuth();
  
  // Determine which navigation items to show based on current portal
  const getNavItems = () => {
    return navigationItems[currentPortal] || navigationItems['Employee Portal'];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-card border-r border-border h-full">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
            {currentPortal === 'Admin Dashboard' && (
              <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded ml-auto">
                ADMIN
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
