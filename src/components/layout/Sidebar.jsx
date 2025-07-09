import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Define navigation items for each role
const navigationItems = {
  employee: [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Leave Management', path: '/leave', icon: '📅' },
    { name: 'Timesheet', path: '/timesheet', icon: '⏰' },
    { name: 'Career Portal', path: '/career', icon: '🚀' },
    { name: 'Feedback', path: '/feedback', icon: '💬' },
    { name: 'Support Tickets', path: '/tickets', icon: '🎫' },
    { name: 'Resources', path: '/resources', icon: '📚' },
  ],
  hr: [
    { name: 'HR Dashboard', path: '/hr/dashboard', icon: '📊' },
    { name: 'Leave Requests', path: '/hr/leave-requests', icon: '📅' },
    { name: 'Timesheets', path: '/hr/timesheets', icon: '⏰' },
    { name: 'Employee Directory', path: '/hr/employees', icon: '👥' },
    { name: 'Onboarding', path: '/hr/onboarding', icon: '🎯' },
    { name: 'HR Tickets', path: '/hr/tickets', icon: '🎫' },
    { name: 'Feedback Center', path: '/hr/feedback', icon: '💭' },
    { name: 'Career Portal', path: '/hr/career', icon: '🚀' },
    { name: 'Payroll', path: '/hr/payroll', icon: '💰' },
    { name: 'Org Chart', path: '/hr/org-chart', icon: '🏢' },
  ],
  it: [
    { name: 'IT Dashboard', path: '/it/dashboard', icon: '🖥️' },
    { name: 'Support Queue', path: '/it/support', icon: '🎫' },
    { name: 'Asset Management', path: '/it/assets', icon: '📱' },
    { name: 'Inventory', path: '/it/inventory', icon: '📦' },
    { name: 'Live Chat', path: '/it/chat', icon: '💬' },
    { name: 'Knowledge Base', path: '/it/knowledge', icon: '📖' },
    { name: 'Software Center', path: '/it/software', icon: '💿' },
  ]
};

export function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role || 'employee';
  const navItems = navigationItems[userRole];

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
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}