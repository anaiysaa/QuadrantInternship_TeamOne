
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Onboarding() {
  const [searchTerm, setSearchTerm] = useState('');

  const onboardingCandidates = [
    {
      id: 'ON001',
      name: 'Jennifer Smith',
      position: 'Frontend Developer',
      department: 'Engineering',
      startDate: '2024-02-20',
      status: 'In Progress',
      progress: 65,
      manager: 'Sarah Johnson',
      email: 'jennifer.smith@company.com',
      tasks: {
        completed: 7,
        total: 12
      }
    },
    {
      id: 'ON002',
      name: 'David Chen',
      position: 'Product Manager',
      department: 'Product',
      startDate: '2024-02-15',
      status: 'Completed',
      progress: 100,
      manager: 'Mike Wilson',
      email: 'david.chen@company.com',
      tasks: {
        completed: 15,
        total: 15
      }
    },
    {
      id: 'ON003',
      name: 'Maria Rodriguez',
      position: 'UX Designer',
      department: 'Design',
      startDate: '2024-02-25',
      status: 'Not Started',
      progress: 0,
      manager: 'Lisa Brown',
      email: 'maria.rodriguez@company.com',
      tasks: {
        completed: 0,
        total: 10
      }
    },
    {
      id: 'ON004',
      name: 'Robert Taylor',
      position: 'Sales Manager',
      department: 'Sales',
      startDate: '2024-02-18',
      status: 'In Progress',
      progress: 40,
      manager: 'Tom Wilson',
      email: 'robert.taylor@company.com',
      tasks: {
        completed: 4,
        total: 11
      }
    },
    {
      id: 'ON005',
      name: 'Emily Johnson',
      position: 'Marketing Specialist',
      department: 'Marketing',
      startDate: '2024-03-01',
      status: 'Pending',
      progress: 0,
      manager: 'Alex Brown',
      email: 'emily.johnson@company.com',
      tasks: {
        completed: 0,
        total: 9
      }
    }
  ];

  const filteredCandidates = onboardingCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Started':
        return <Badge variant="outline" className="text-muted-foreground border-muted-foreground">Not Started</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-primary border-primary">In Progress</Badge>;
      case 'Completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Engineering': return 'bg-primary';
      case 'Product': return 'bg-success';
      case 'Design': return 'bg-warning';
      case 'Sales': return 'bg-destructive';
      case 'Marketing': return 'bg-accent';
      default: return 'bg-secondary';
    }
  };

  const stats = [
    { title: 'Total New Hires', value: onboardingCandidates.length, color: 'bg-primary' },
    { title: 'In Progress', value: onboardingCandidates.filter(c => c.status === 'In Progress').length, color: 'bg-warning' },
    { title: 'Completed', value: onboardingCandidates.filter(c => c.status === 'Completed').length, color: 'bg-success' },
    { title: 'Starting Soon', value: onboardingCandidates.filter(c => c.status === 'Pending' || c.status === 'Not Started').length, color: 'bg-accent' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Onboarding</h1>
            <p className="text-muted-foreground">Manage new employee onboarding</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Create Checklist</Button>
            <Button>Add New Hire</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search New Hires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by name, position, department, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Table */}
        <Card>
          <CardHeader>
            <CardTitle>All New Hires ({filteredCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getDepartmentColor(candidate.department)}`}></div>
                        <span>{candidate.department}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(candidate.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{candidate.progress}%</span>
                          <span className="text-muted-foreground">
                            {candidate.tasks.completed}/{candidate.tasks.total}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${candidate.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        {candidate.status !== 'Completed' && (
                          <Button size="sm" variant="default">Manage</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold mb-1">Onboarding Templates</h3>
              <p className="text-sm text-muted-foreground">Manage checklists and templates</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Progress Reports</h3>
              <p className="text-sm text-muted-foreground">View detailed progress analytics</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold mb-1">Settings</h3>
              <p className="text-sm text-muted-foreground">Configure onboarding process</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
