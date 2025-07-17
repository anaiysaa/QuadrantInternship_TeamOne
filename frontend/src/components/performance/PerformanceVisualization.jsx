
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function PerformanceVisualization() {
  const quarterlyData = [
    { quarter: 'Q1 2024', score: 85, goals: 80, expectations: 88 },
    { quarter: 'Q2 2024', score: 92, goals: 90, expectations: 89 },
    { quarter: 'Q3 2024', score: 84, goals: 78, expectations: 86 },
    { quarter: 'Q4 2024', score: 0, goals: 38, expectations: 42 }
  ];

  const skillsData = [
    { skill: 'Technical', current: 88, target: 90 },
    { skill: 'Communication', current: 85, target: 85 },
    { skill: 'Leadership', current: 78, target: 85 },
    { skill: 'Innovation', current: 92, target: 80 }
  ];

  const goalProgressData = [
    { name: 'Completed', value: 35, color: '#22c55e' },
    { name: 'In Progress', value: 45, color: '#3b82f6' },
    { name: 'Not Started', value: 20, color: '#94a3b8' }
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#94a3b8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quarterly Performance Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Quarterly Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={quarterlyData.slice(0, 3)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Performance Score" />
              <Line type="monotone" dataKey="goals" stroke="#22c55e" strokeWidth={2} name="Goal Achievement" />
              <Line type="monotone" dataKey="expectations" stroke="#f59e0b" strokeWidth={2} name="Expectations Met" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills vs Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={skillsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="skill" width={80} />
              <Tooltip />
              <Bar dataKey="current" fill="#3b82f6" name="Current" />
              <Bar dataKey="target" fill="#22c55e" name="Target" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goal Progress Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={goalProgressData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {goalProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {goalProgressData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
