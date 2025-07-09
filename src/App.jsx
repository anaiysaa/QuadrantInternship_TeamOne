import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import LeaveManagement from "./pages/LeaveManagement";
import Timesheet from "./pages/Timesheet";
import CareerPortal from "./pages/CareerPortal";
import Feedback from "./pages/Feedback";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/leave" element={
              <ProtectedRoute>
                <LeaveManagement />
              </ProtectedRoute>
            } />
            <Route path="/timesheet" element={
              <ProtectedRoute>
                <Timesheet />
              </ProtectedRoute>
            } />
            <Route path="/career" element={
              <ProtectedRoute>
                <CareerPortal />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } />
            
            {/* HR Routes */}
            <Route path="/hr/leave-requests" element={
              <ProtectedRoute>
                <HRLeaveRequests />
              </ProtectedRoute>
            } />
            <Route path="/hr/timesheets" element={
              <ProtectedRoute>
                <HRTimesheets />
              </ProtectedRoute>
            } />
            <Route path="/hr/employees" element={
              <ProtectedRoute>
                <EmployeeDirectory />
              </ProtectedRoute>
            } />
            <Route path="/hr/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/hr/tickets" element={
              <ProtectedRoute>
                <HRTickets />
              </ProtectedRoute>
            } />
            <Route path="/hr/feedback" element={
              <ProtectedRoute>
                <HRFeedbackCenter />
              </ProtectedRoute>
            } />
            <Route path="/hr/career" element={
              <ProtectedRoute>
                <HRCareerPortal />
              </ProtectedRoute>
            } />
            <Route path="/hr/payroll" element={
              <ProtectedRoute>
                <Payroll />
              </ProtectedRoute>
            } />
            <Route path="/hr/org-chart" element={
              <ProtectedRoute>
                <OrgChart />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;