import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CourseBrowser } from '@/components/lms/CourseBrowser';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff, ChartBar } from 'lucide-react';

export default function LMSDashboard() {
  const [showCourseBrowser, setShowCourseBrowser] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([
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
  ]);

  const [availableCourses, setAvailableCourses] = useState([
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
  ]);

  const { toast } = useToast();

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

  // Analytics data
  const learningProgressData = [
    { month: 'Jan', completed: 2, enrolled: 5, hours: 16 },
    { month: 'Feb', completed: 3, enrolled: 6, hours: 24 },
    { month: 'Mar', completed: 1, enrolled: 3, hours: 8 },
    { month: 'Apr', completed: 0, enrolled: 2, hours: 12 },
    { month: 'May', completed: 1, enrolled: 4, hours: 18 },
    { month: 'Jun', completed: 2, enrolled: 3, hours: 20 },
  ];

  const categoryData = [
    { name: 'Software', enrolled: 2, completed: 1, color: 'hsl(var(--primary))' },
    { name: 'Security', enrolled: 1, completed: 1, color: 'hsl(var(--destructive))' },
    { name: 'Management', enrolled: 1, completed: 0, color: 'hsl(var(--success))' },
    { name: 'Programming', enrolled: 0, completed: 0, color: 'hsl(var(--warning))' },
    { name: 'Marketing', enrolled: 0, completed: 0, color: 'hsl(var(--accent))' },
    { name: 'Leadership', enrolled: 0, completed: 0, color: 'hsl(var(--secondary))' },
  ].filter(item => item.enrolled > 0 || item.completed > 0);

  const statusData = [
    { name: 'Completed', value: enrolledCourses.filter(c => c.status === 'Completed').length, color: 'hsl(var(--success))' },
    { name: 'In Progress', value: enrolledCourses.filter(c => c.status === 'In Progress').length, color: 'hsl(var(--warning))' },
    { name: 'Not Started', value: enrolledCourses.filter(c => c.status === 'Not Started').length, color: 'hsl(var(--secondary))' },
  ].filter(item => item.value > 0);

  const achievementData = [
    { type: 'Learning', count: achievements.filter(a => a.title.includes('Learner')).length },
    { type: 'Security', count: achievements.filter(a => a.title.includes('Security')).length },
    { type: 'Collaboration', count: achievements.filter(a => a.title.includes('Team')).length },
  ];

  const handleContinueLearning = (course) => {
    toast({
      title: "Continuing Course",
      description: `Redirecting to ${course.title}...`,
    });
    console.log('Continue learning:', course);
    // In a real app, this would navigate to the course content
  };

  const handleDownloadCertificate = (course) => {
    toast({
      title: "Certificate Downloaded",
      description: `Certificate for ${course.title} has been downloaded.`,
    });
    console.log('Download certificate:', course);
    // In a real app, this would trigger a file download
  };

  const handleViewCertificate = (course) => {
    toast({
      title: "Viewing Certificate",
      description: `Opening certificate for ${course.title}...`,
    });
    console.log('View certificate:', course);
    // In a real app, this would open the certificate in a new window/modal
  };

  const handleEnrollNow = (course) => {
    // Move course from available to enrolled
    setAvailableCourses(prev => prev.filter(c => c.id !== course.id));
    setEnrolledCourses(prev => [...prev, {
      ...course,
      progress: 0,
      status: 'Not Started',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }]);
    
    toast({
      title: "Enrollment Successful",
      description: `You have been enrolled in ${course.title}!`,
    });
    console.log('Enroll in course:', course);
  };

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

  if (showCourseBrowser) {
    return (
      <DashboardLayout>
        <CourseBrowser onBack={() => setShowCourseBrowser(false)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Learning Management System</h1>
            <p className="text-muted-foreground">Enhance your skills with our training programs</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2"
            >
              {showAnalytics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
            </Button>
            <Button onClick={() => setShowCourseBrowser(true)}>Browse All Courses</Button>
          </div>
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

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChartBar className="w-5 h-5" />
                  <span>Learning Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Learning Progress Trend */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Learning Progress Over Time</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={learningProgressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={2}
                          name="Completed"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="enrolled" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Enrolled"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Course Status Distribution */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Course Status Distribution</h4>
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
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Learning by Category */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Learning by Category</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar 
                          dataKey="enrolled" 
                          fill="hsl(var(--primary))" 
                          name="Enrolled"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar 
                          dataKey="completed" 
                          fill="hsl(var(--success))" 
                          name="Completed"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Achievement Types */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Achievement Distribution</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={achievementData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          type="number" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="type" 
                          width={80}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--accent))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Learning Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-accent/30 rounded-lg border">
                    <h4 className="font-medium mb-2">Completion Rate</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span className="font-medium">
                          {((enrolledCourses.filter(c => c.status === 'Completed').length / enrolledCourses.length) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={(enrolledCourses.filter(c => c.status === 'Completed').length / enrolledCourses.length) * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg border">
                    <h4 className="font-medium mb-2">Learning Streak</h4>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">7 days</p>
                      <p className="text-sm text-muted-foreground">Current streak</p>
                      <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
                    </div>
                  </div>

                  <div className="p-4 bg-success/10 rounded-lg border">
                    <h4 className="font-medium mb-2">Average Rating</h4>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">4.7 ⭐</p>
                      <p className="text-sm text-muted-foreground">Course ratings</p>
                      <p className="text-xs text-muted-foreground">Excellent choices!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                        <Button variant="outline" size="sm" onClick={() => handleViewCertificate(course)}>
                          View Certificate
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleContinueLearning(course)}
                      >
                        Continue Learning
                      </Button>
                      {course.status === 'Completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadCertificate(course)}
                        >
                          Download Certificate
                        </Button>
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
                      <Button size="sm" onClick={() => handleEnrollNow(course)}>
                        Enroll Now
                      </Button>
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
