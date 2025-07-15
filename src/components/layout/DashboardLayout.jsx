
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AIChatWidget } from '../chat/AIChatWidget';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout({ children }) {
  const { user, currentPortal } = useAuth();

  // Only show AI chat widget for Employee Portal
  const showChatWidget = currentPortal === 'Employee Portal';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* AI Chat Widget - Only available on Employee Portal */}
      {showChatWidget && <AIChatWidget />}
    </div>
  );
}
