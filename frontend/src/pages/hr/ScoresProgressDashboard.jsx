import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, Trophy, Award, GraduationCap } from 'lucide-react';

// Mock data
const azureCertificationData = [
  { id: 1, employeeName: 'John Smith', department: 'IT', course: 'AZ-104: Azure Administrator', testDate: '2024-01-15', score: 85, status: 'Pass', maxScore: 100 },
  { id: 2, employeeName: 'Sarah Johnson', department: 'DevOps', course: 'AZ-400: DevOps Engineer', testDate: '2024-01-20', score: 72, status: 'Pass', maxScore: 100 },
  { id: 3, employeeName: 'Mike Wilson', department: 'IT', course: 'AZ-104: Azure Administrator', testDate: '2024-01-25', score: 58, status: 'Fail', maxScore: 100 },
  { id: 4, employeeName: 'Emily Davis', department: 'Cloud', course: 'AZ-900: Azure Fundamentals', testDate: '2024-02-01', score: 92, status: 'Pass', maxScore: 100 },
  { id: 5, employeeName: 'Alex Brown', department: 'DevOps', course: 'AZ-400: DevOps Engineer', testDate: '2024-02-05', score: 79, status: 'Pass', maxScore: 100 }
];

const onboardingTrainingData = [
  { id: 1, employeeName: 'Jessica Lee', department: 'Marketing', course: 'Company Orientation', score: 95, status: 'Complete', dateCompleted: '2024-01-10' },
  { id: 2, employeeName: 'David Kim', department: 'Sales', course: 'HR Policies Training', score: 88, status: 'Complete', dateCompleted: '2024-01-12' },
  { id: 3, employeeName: 'Lisa Wang', department: 'Finance', course: 'Security Awareness', score: 91, status: 'Complete', dateCompleted: '2024-01-15' },
  { id: 4, employeeName: 'Robert Chen', department: 'IT', course: 'Company Orientation', score: 76, status: 'In Progress', dateCompleted: null },
  { id: 5, employeeName: 'Maria Garcia', department: 'HR', course: 'Compliance Training', score: 97, status: 'Complete', dateCompleted: '2024-01-18' }
];

const quizLeaderboardData = [
  { id: 1, employeeName: 'Emma Thompson', department: 'IT', quizName: 'Cloud Security Quiz', score: 98, maxScore: 100, date: '2024-02-01' },
  { id: 2, employeeName: 'James Rodriguez', department: 'DevOps', quizName: 'DevOps Best Practices', score: 95, maxScore: 100, date: '2024-02-02' },
  { id: 3, employeeName: 'Olivia Martinez', department: 'IT', quizName: 'Cloud Security Quiz', score: 92, maxScore: 100, date: '2024-02-01' },
  { id: 4, employeeName: 'William Taylor', department: 'Sales', quizName: 'Company Knowledge', score: 89, maxScore: 100, date: '2024-02-03' },
  { id: 5, employeeName: 'Sophia Anderson', department: 'Marketing', quizName: 'Marketing Fundamentals', score: 87, maxScore: 100, date: '2024-02-04' }
].sort((a, b) => b.score - a.score);

export function ScoresProgressDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  // const [dateFilter, setDateFilter] = useState('all'); // (unused) remove or implement

  // Get unique departments for filter
  const departments = ['all', ...new Set([
    ...azureCertificationData.map(item => item.department),
    ...onboardingTrainingData.map(item => item.department),
    ...quizLeaderboardData.map(item => item.department)
  ])];

  // Filter functions
  const filterData = (data) => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.course && item.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.quizName && item.quizName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  };

  // Proper CSV with interpolation + basic escaping for quotes/commas/newlines
  const downloadCSV = (data, filename) => {
    if (!data?.length) return;

    const escapeCSV = (val) => {
      const s = String(val ?? '');
      // Escape double quotes by doubling them, wrap in quotes if contains special chars
      const needsQuotes = /[",\n]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(field => escapeCSV(row[field])).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    if (status === 'Pass') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pass</Badge>;
    if (status === 'Fail') return <Badge variant="destructive">Fail</Badge>;
    if (status === 'Complete') return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Complete</Badge>;
    if (status === 'In Progress') return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getScoreColor = (score, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Scores & Progress Dashboard</h1>
            <p className="text-muted-foreground">Track employee learning progress and assessment scores</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees, courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Azure Certifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{azureCertificationData.filter(item => item.status === 'Pass').length}</div>
              <p className="text-xs text-muted-foreground">
                {azureCertificationData.filter(item => item.status === 'Pass').length} passed out of {azureCertificationData.length} total
              </p>
              <Progress value={(azureCertificationData.filter(item => item.status === 'Pass').length / azureCertificationData.length) * 100} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Complete</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingTrainingData.filter(item => item.status === 'Complete').length}</div>
              <p className="text-xs text-muted-foreground">
                {onboardingTrainingData.filter(item => item.status === 'Complete').length} completed out of {onboardingTrainingData.length} total
              </p>
              <Progress value={(onboardingTrainingData.filter(item => item.status === 'Complete').length / onboardingTrainingData.length) * 100} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(quizLeaderboardData.reduce((acc, item) => acc + item.score, 0) / quizLeaderboardData.length)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across {quizLeaderboardData.length} quiz attempts
              </p>
              <Progress value={Math.round(quizLeaderboardData.reduce((acc, item) => acc + item.score, 0) / quizLeaderboardData.length)} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="azure" className="space-y-4">
          <TabsList>
            <TabsTrigger value="azure">Azure Certifications</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding Training</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="azure" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Azure Certification Test Scores</CardTitle>
                    <CardDescription>Employee performance on Azure certification exams</CardDescription>
                  </div>
                  <Button onClick={() => downloadCSV(filterData(azureCertificationData), 'azure-certification-scores.csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Test Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(azureCertificationData).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.employeeName}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.course}</TableCell>
                        <TableCell>{new Date(item.testDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getScoreColor(item.score, item.maxScore)}`}>
                              {item.score}/{item.maxScore}
                            </span>
                            <Progress value={(item.score / item.maxScore) * 100} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Onboarding Training Scores</CardTitle>
                    <CardDescription>Employee progress on onboarding courses</CardDescription>
                  </div>
                  <Button onClick={() => downloadCSV(filterData(onboardingTrainingData), 'onboarding-training-scores.csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(onboardingTrainingData).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.employeeName}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.course}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getScoreColor(item.score)}`}>
                              {item.score}%
                            </span>
                            <Progress value={item.score} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.dateCompleted ? new Date(item.dateCompleted).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Interactive Quiz Leaderboard</CardTitle>
                    <CardDescription>Top performing employees on interactive quizzes</CardDescription>
                  </div>
                  <Button onClick={() => downloadCSV(filterData(quizLeaderboardData), 'quiz-leaderboard.csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Quiz Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(quizLeaderboardData).map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            <span className="font-semibold">#{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.employeeName}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.quizName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getScoreColor(item.score, item.maxScore)}`}>
                              {item.score}/{item.maxScore}
                            </span>
                            <Progress value={(item.score / item.maxScore) * 100} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
