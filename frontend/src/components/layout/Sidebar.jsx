import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  Users,
  FileText,
  Settings,
  Calendar,
  Clock,
  User,
  Target,
  Ticket,
  MessageCircle,
  Rocket,
  Building2,
  Edit,
  Clipboard,
  Folder,
  Book,
  BookOpen,
  Home,
  Laptop,
  Package,
} from 'lucide-react';

// Define navigation items for each portal
const navigationItems = {
  'Admin Dashboard': [
    { name: 'Admin Overview', path: '/dashboard', icon: Shield },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Activity Logs', path: '/admin/logs', icon: Clipboard },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ],
  'HR Portal': [
    { name: 'HR Dashboard', path: '/dashboard', icon: FileText },
    { name: 'Leave Requests', path: '/hr/leave-requests', icon: Calendar },
    { name: 'Timesheets', path: '/hr/timesheets', icon: Clock },
    { name: 'Employee Directory', path: '/hr/employees', icon: Users },
    { name: 'Onboarding', path: '/hr/onboarding', icon: Target },
    { name: 'HR Tickets', path: '/hr/tickets', icon: Ticket },
    { name: 'Feedback Center', path: '/hr/feedback', icon: MessageCircle },
    { name: 'Career Portal', path: '/hr/career', icon: Rocket },
    { name: 'Org Chart', path: '/hr/org-chart', icon: Building2 },
    { name: 'Content Management', path: '/hr/content', icon: Edit },
  ],
  'IT Portal': [
    { name: 'IT Dashboard', path: '/dashboard', icon: Laptop },
    { name: 'Support Queue', path: '/it/support', icon: Ticket },
    { name: 'Asset Management', path: '/it/assets', icon: Folder },
    { name: 'Inventory', path: '/it/inventory', icon: Package },
    { name: 'Live Chat', path: '/it/chat', icon: MessageCircle },
    { name: 'Knowledge Base', path: '/it/knowledge', icon: BookOpen },
  ],
  'Employee Portal': [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Leave Management', path: '/leave', icon: Calendar },
    { name: 'Timesheet', path: '/timesheet', icon: Clock },
    { name: 'Career Portal', path: '/career', icon: Rocket },
    { name: 'Feedback', path: '/feedback', icon: MessageCircle },
    { name: 'Support Tickets', path: '/tickets', icon: Ticket },
    { name: 'Resources', path: '/resources', icon: Book },
    { name: 'Learning (LMS)', path: '/lms', icon: BookOpen },
    { name: 'Live Chat', path: '/live-chat', icon: MessageCircle },
    { name: 'Org Chart', path: '/hr/org-chart', icon: Building2 },
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
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
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
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
              {currentPortal === 'Admin Dashboard' && (
                <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded ml-auto">
                  ADMIN
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
