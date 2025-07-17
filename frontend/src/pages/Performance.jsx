import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RequestPerformanceReviewDialog } from '@/components/dialogs/RequestPerformanceReviewDialog';

export default function Performance() {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);

  const quarterlyData = [
    {
      quarter: 'Q1',
      year: currentYear,
      goals: 8,
      completed: 6,
      rating: 4.2,
      status: 'completed'
    },
    {
      quarter: 'Q2',
      year: currentYear,
      goals: 7,
      completed: 5,
      rating: 3.8,
      status: 'completed'
    },
    {
      quarter: 'Q3',
      year: currentYear,
      goals: 9,
      completed: 7,
      rating: 4.0,
      status: currentQuarter === 3 ? 'in-progress' : 'completed'
    },
    {
      quarter: 'Q4',
      year: currentYear,
      goals: 6,
      completed: 2,
      rating: null,
      status: currentQuarter === 4 ? 'in-progress' : 'upcoming'
    }
  ];

  const skillsProgress = [
    { skill: 'Technical Skills', progress: 85, target: 90 },
    { skill: 'Communication', progress: 78, target: 80 },
    { skill: 'Leadership', progress: 65, target: 75 },
    { skill: 'Problem Solving', progress: 88, target: 85 },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Hub</h1>
            <p className="text-muted-foreground">Track your performance, goals, and growth throughout the year</p>
          </div>
          <RequestPerformanceReviewDialog>
            <Button>Request Performance Review</Button>
          </RequestPerformanceReviewDialog>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Overall Rating</h3>
              </div>
              <p className="text-2xl font-bold mt-1">4.0/5.0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Goals Completed</h3>
              </div>
              <p className="text-2xl font-bold mt-1">20/30</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Quarter</h3>
              </div>
              <p className="text-2xl font-bold mt-1">Q{currentQuarter} {currentYear}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Next Review</h3>
              </div>
              <p className="text-sm font-medium mt-1">March 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Quarterly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Performance - {currentYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quarterlyData.map((quarter) => (
                <div key={`${quarter.quarter}-${quarter.year}`} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{quarter.quarter} {quarter.year}</h3>
                    {getStatusBadge(quarter.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Goals</span>
                      <span>{quarter.completed}/{quarter.goals}</span>
                    </div>
                    <Progress value={(quarter.completed / quarter.goals) * 100} className="h-2" />
                    {quarter.rating && (
                      <div className="flex justify-between text-sm">
                        <span>Rating</span>
                        <span className="font-medium">{quarter.rating}/5.0</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Development */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {skillsProgress.map((skill) => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.skill}</span>
                    <span className="text-sm text-muted-foreground">
                      {skill.progress}% / {skill.target}% target
                    </span>
                  </div>
                  <Progress value={skill.progress} className="h-3" />
                  {skill.progress >= skill.target && (
                    <p className="text-sm text-success">🎯 Target achieved!</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Current Quarter Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <span className="font-medium">Complete React certification</span>
                  <p className="text-sm text-muted-foreground">Deadline: End of Q{currentQuarter}</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <span className="font-medium">Mentor 2 junior developers</span>
                  <p className="text-sm text-muted-foreground">Progress: 1/2 completed</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <span className="font-medium">Lead project improvement initiative</span>
                  <p className="text-sm text-muted-foreground">Status: Planning phase</p>
                </div>
                <Badge variant="outline">Not Started</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
