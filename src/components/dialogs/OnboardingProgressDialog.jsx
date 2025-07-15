
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function OnboardingProgressDialog({ open, onOpenChange }) {
  const departmentData = [
    { name: 'Engineering', completed: 85, inProgress: 15, notStarted: 0 },
    { name: 'Sales', completed: 60, inProgress: 30, notStarted: 10 },
    { name: 'Marketing', completed: 90, inProgress: 10, notStarted: 0 },
    { name: 'HR', completed: 95, inProgress: 5, notStarted: 0 },
    { name: 'Design', completed: 70, inProgress: 25, notStarted: 5 },
  ];

  const monthlyData = [
    { month: 'Jan', newHires: 12, completed: 10 },
    { month: 'Feb', newHires: 15, completed: 14 },
    { month: 'Mar', newHires: 18, completed: 16 },
    { month: 'Apr', newHires: 22, completed: 20 },
    { month: 'May', newHires: 20, completed: 19 },
    { month: 'Jun', newHires: 25, completed: 23 },
  ];

  const statusData = [
    { name: 'Completed', value: 65, color: '#22c55e' },
    { name: 'In Progress', value: 25, color: '#3b82f6' },
    { name: 'Not Started', value: 10, color: '#6b7280' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboarding Progress Analytics</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">Avg Days to Complete</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">Active Onboardings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">Satisfaction Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progress by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                  <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                  <Bar dataKey="notStarted" stackId="a" fill="#6b7280" name="Not Started" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newHires" stroke="#3b82f6" name="New Hires" />
                    <Line type="monotone" dataKey="completed" stroke="#22c55e" name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
