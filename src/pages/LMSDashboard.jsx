
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

export default function LMSDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced Excel Training',
      category: 'Software',
      progress: 75,
      duration: '8 hours',
      instructor: 'Sarah Johnson',
      status: 'In Progress',
      dueDate: '2024-03-15',
      description: 'Master advanced Excel functions, pivot tables, and data analysis techniques.'
    },
    {
      id: 2,
      title: 'Cybersecurity Fundamentals',
      category: 'Security',
      progress: 100,
      duration: '6 hours',
      instructor: 'Mike Chen',
      status: 'Completed',
      completedDate: '2024-02-10',
      description: 'Essential cybersecurity knowledge for all employees.'
    },
    {
      id: 3,
      title: 'Project Management Basics',
      category: 'Management',
      progress: 30,
      duration: '12 hours',
      instructor: 'Emily Davis',
      status: 'In Progress',
      dueDate: '2024-04-01',
      description: 'Learn fundamental project management principles and methodologies.'
    }
  ];

  const availableCourses = [
    {
      id: 4,
      title: 'Python Programming for Beginners',
      category: 'Programming',
      duration: '20 hours',
      instructor: 'Alex Rodriguez',
      rating: 4.8,
      enrolled: 234,
      description: 'Start your programming journey with Python fundamentals.'
    },
    {
      id: 5,
      title: 'Digital Marketing Strategies',
      category: 'Marketing',
      duration: '15 hours',
      instructor: 'Lisa Thompson',
      rating: 4.6,
      enrolled: 189,
      description: 'Learn modern digital marketing techniques and tools.'
    },
    {
      id: 6,
      title: 'Leadership Development',
      category: 'Leadership',
      duration: '10 hours',
      instructor: 'David Wilson',
      rating: 4.9,
      enrolled: 156,
      description: 'Develop essential leadership skills for career advancement.'
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Quick Learner',
      description: 'Completed 3 courses in one month',
      icon: '🏆',
      date: '2024-02-15'
    },
    {
      id: 2,
      title: 'Security Champion',
      description: 'Completed cybersecurity training',
      icon: '🛡️',
      date: '2024-02-10'
    },
    {
      id: 3,
      title: 'Team Player',
      description: 'Participated in group learning activities',
      icon: '🤝',
      date: '2024-01-20'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="text-warning border-warning">In Progress</Badge>;
      case 'Not Started':
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Software': return 'bg-primary';
      case 'Security': return 'bg-destructive';
      case 'Management': return 'bg-success';
      case 'Programming': return 'bg-warning';
      case 'Marketing': return 'bg-accent';
      case 'Leadership': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  const stats = [
    { title: 'Courses Enrolled', value: enrolledCourses.length, color: 'bg-primary' },
    { title: 'Courses Completed', value: enrolledCourses.filter(c => c.status === 'Completed').length, color: 'bg-success' },
    { title: 'Total Hours', value: '26h', color: 'bg-warning' },
    { title: 'Certificates', value: '2', color: 'bg-accent' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Learning Management System</h1>
            <p className="text-muted-foreground">Enhance your skills with our training programs</p>
          </div>
          <Button>Browse All Courses</Button>
        </div>

        {/* Stats */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{course.title}</h3>
                      {getStatusBadge(course.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(course.category)}`}></div>
                        <span>{course.category}</span>
                      </div>
                      <span>Duration: {course.duration}</span>
                      <span>Instructor: {course.instructor}</span>
                    </div>
                    {course.status === 'In Progress' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Due: {course.dueDate}
                        </p>
                      </div>
                    )}
                    {course.status === 'Completed' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-success">Completed on {course.completedDate}</span>
                        <Button variant="outline" size="sm">View Certificate</Button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mt-3">
                      <Button variant="outline" size="sm">Continue Learning</Button>
                      {course.status === 'Completed' && (
                        <Button variant="outline" size="sm">Download Certificate</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableCourses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{course.title}</h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">⭐</span>
                        <span className="text-sm">{course.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(course.category)}`}></div>
                        <span>{course.category}</span>
                      </div>
                      <span>Duration: {course.duration}</span>
                      <span>Enrolled: {course.enrolled}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Instructor: {course.instructor}
                      </span>
                      <Button size="sm">Enroll Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
