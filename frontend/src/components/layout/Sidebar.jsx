import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  Shield, Users, FileText, Settings, Calendar, Clock, User, Target, Ticket,
  MessageCircle, Rocket, Building2, Edit, Clipboard, Folder, Book, BookOpen,
  Home, Laptop, Package, MoveLeft, MoveRight,
} from 'lucide-react';

const navigationItems = {
  'Admin Dashboard': [
    { name: 'Admin Overview', path: '/dashboard', icon: Shield },
    { name: 'Activity Logs', path: '/admin/logs', icon: Clipboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
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
  const [collapsed, setCollapsed] = useState(true);

  const navItems = navigationItems[currentPortal] || navigationItems['Employee Portal'];

  return (
    <aside
      className={cn(
        'h-screen bg-[#0c100f] border-r border-[#0c100f] text-blue-100 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2 ">
        <button onClick={() => setCollapsed(!collapsed)} className="text-sm text-[#87b6c6]">
          {collapsed ? <MoveRight /> : <MoveLeft />}

        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-2 text-blue-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isAdminPortal = currentPortal === 'Admin Dashboard';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-[#1d3243] text-white'
                    : 'text-[#87b6c6] hover:bg-[#284a59] hover:text-white'
                )
              }
            >
              <Icon className="w-5 h-5" />
              {!collapsed && (
                <span className="ml-3 flex-1 truncate">
                  {item.name}
                </span>
              )}
              {!collapsed && isAdminPortal && (
                <span className="ml-auto text-xs bg-[#1d3243] text-blue-100 px-1 py-0.5 rounded">
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
