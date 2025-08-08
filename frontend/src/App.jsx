import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RouteProtection } from "@/components/RouteProtection";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import LeaveManagement from "./pages/LeaveManagement";
import Timesheet from "./pages/Timesheet";
import Performance from "./pages/Performance";
import CareerPortal from "./pages/CareerPortal";
import Feedback from "./pages/Feedback";
import Resources from "./pages/Resources";
import LMSDashboard from "./pages/LMSDashboard";
import SupportTickets from "./pages/SupportTickets";
import LiveChat from "./pages/LiveChat";
import NotFound from "./pages/NotFound";
import HRLeaveRequests from "./pages/hr/HRLeaveRequests";
import HRTimesheets from "./pages/hr/HRTimesheets";
import EmployeeDirectory from "./pages/hr/EmployeeDirectory";
import Onboarding from "./pages/hr/Onboarding";
import HRTickets from "./pages/hr/HRTickets";
import HRFeedbackCenter from "./pages/hr/HRFeedbackCenter";
import HRCareerPortal from "./pages/hr/HRCareerPortal";
import Payroll from "./pages/hr/Payroll";
import OrgChart from "./pages/hr/OrgChart";
import HRLiveChat from "./pages/hr/HRLiveChat";
import ITSupportQueue from "./pages/it/ITSupportQueue";
import ITAssetManagement from "./pages/it/ITAssetManagement";
import ITInventory from "./pages/it/ITInventory";
import ITLiveChat from "./pages/it/ITLiveChat";
import ITKnowledgeBase from "./pages/it/ITKnowledgeBase";
import ITSoftwareCenter from "./pages/it/ITSoftwareCenter";
import "./index.css";
import Content from "./pages/hr/HRContentManagement";
import QuizGame from "./pages/QuizGame";
import PublicQuizGame from "./pages/PublicQuizGame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteProtection>
            <Routes>
              <Route path="/public-quiz" element={<PublicQuizGame />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leave"
                element={
                  <ProtectedRoute>
                    <LeaveManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timesheet"
                element={
                  <ProtectedRoute>
                    <Timesheet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance"
                element={
                  <ProtectedRoute>
                    <Performance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career"
                element={
                  <ProtectedRoute>
                    <CareerPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lms"
                element={
                  <ProtectedRoute>
                    <LMSDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <SupportTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <Resources />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lms"
                element={
                  <ProtectedRoute>
                    <LMSDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/quiz-game" element={
                <ProtectedRoute>
                  <QuizGame />
                </ProtectedRoute>
              } />
              <Route
                path="/live-chat"
                element={
                  <ProtectedRoute>
                    <LiveChat />
                  </ProtectedRoute>
                }
              />

              {/* HR Routes */}
              <Route
                path="/hr/leave-requests"
                element={
                  <ProtectedRoute>
                    <HRLeaveRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/timesheets"
                element={
                  <ProtectedRoute>
                    <HRTimesheets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/employees"
                element={
                  <ProtectedRoute>
                    <EmployeeDirectory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/tickets"
                element={
                  <ProtectedRoute>
                    <HRTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/feedback"
                element={
                  <ProtectedRoute>
                    <HRFeedbackCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/career"
                element={
                  <ProtectedRoute>
                    <HRCareerPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/payroll"
                element={
                  <ProtectedRoute>
                    <Payroll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/org-chart"
                element={
                  <ProtectedRoute>
                    <OrgChart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/live-chat"
                element={
                  <ProtectedRoute>
                    <HRLiveChat />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hr/content"
                element={
                  <ProtectedRoute>
                    <Content />
                  </ProtectedRoute>
                }
              />

              {/* IT Routes */}
              <Route
                path="/it/support"
                element={
                  <ProtectedRoute>
                    <ITSupportQueue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/it/assets"
                element={
                  <ProtectedRoute>
                    <ITAssetManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/it/inventory"
                element={
                  <ProtectedRoute>
                    <ITInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/it/chat"
                element={
                  <ProtectedRoute>
                    <ITLiveChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/it/knowledge"
                element={
                  <ProtectedRoute>
                    <ITKnowledgeBase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/it/software"
                element={
                  <ProtectedRoute>
                    <ITSoftwareCenter />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/portals"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/access"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteProtection>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
