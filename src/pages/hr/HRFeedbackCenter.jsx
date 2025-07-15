import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FeedbackDetailsDialog } from '@/components/dialogs/FeedbackDetailsDialog';
import { FeedbackResponseDialog } from '@/components/dialogs/FeedbackResponseDialog';
import { SurveyDialog } from '@/components/dialogs/SurveyDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HRFeedbackCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);
  const [showFeedbackResponse, setShowFeedbackResponse] = useState(false);
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const feedbackData = [
    {
      id: 'FB001',
      type: 'Anonymous',
      category: 'Management',
      sentiment: 'Positive',
      rating: 4,
      submittedDate: '2024-02-10',
      department: 'Engineering',
      status: 'New',
      summary: 'Great leadership and clear communication from the team leads.',
      tags: ['leadership', 'communication']
    },
    {
      id: 'FB002',
      type: 'Named',
      employee: 'John Doe',
      category: 'Work Environment',
      sentiment: 'Negative',
      rating: 2,
      submittedDate: '2024-02-08',
      department: 'Marketing',
      status: 'Under Review',
      summary: 'Office noise levels are affecting productivity.',
      tags: ['workspace', 'productivity']
    },
    {
      id: 'FB003',
      type: 'Anonymous',
      category: 'Benefits',
      sentiment: 'Neutral',
      rating: 3,
      submittedDate: '2024-02-12',
      department: 'Sales',
      status: 'New',
      summary: 'Health insurance options could be improved.',
      tags: ['benefits', 'health']
    },
    {
      id: 'FB004',
      type: 'Named',
      employee: 'Sarah Johnson',
      category: 'Career Development',
      sentiment: 'Positive',
      rating: 5,
      submittedDate: '2024-02-05',
      department: 'Engineering',
      status: 'Addressed',
      summary: 'Excellent training opportunities and mentorship programs.',
      tags: ['training', 'mentorship', 'growth']
    },
    {
      id: 'FB005',
      type: 'Anonymous',
      category: 'Compensation',
      sentiment: 'Negative',
      rating: 2,
      submittedDate: '2024-02-09',
      department: 'Design',
      status: 'Under Review',
      summary: 'Salary not competitive with market rates.',
      tags: ['salary', 'compensation']
    }
  ];

  // Analytics data
  const feedbackTrendData = [
    { month: 'Jan', total: 15, positive: 8, neutral: 4, negative: 3 },
    { month: 'Feb', total: 22, positive: 12, neutral: 6, negative: 4 },
    { month: 'Mar', total: 18, positive: 10, neutral: 5, negative: 3 },
    { month: 'Apr', total: 25, positive: 14, neutral: 7, negative: 4 },
    { month: 'May', total: 20, positive: 11, neutral: 6, negative: 3 },
    { month: 'Jun', total: 28, positive: 16, neutral: 8, negative: 4 },
  ];

  const categoryDistributionData = [
    { name: 'Management', value: 35, color: '#3b82f6' },
    { name: 'Work Environment', value: 25, color: '#22c55e' },
    { name: 'Benefits', value: 20, color: '#f59e0b' },
    { name: 'Career Development', value: 15, color: '#ef4444' },
    { name: 'Compensation', value: 5, color: '#8b5cf6' },
  ];

  const departmentFeedbackData = [
    { department: 'Engineering', positive: 12, neutral: 6, negative: 3 },
    { department: 'Marketing', positive: 8, neutral: 4, negative: 2 },
    { department: 'Sales', positive: 10, neutral: 5, negative: 1 },
    { department: 'Design', positive: 6, neutral: 3, negative: 2 },
    { department: 'HR', positive: 4, neutral: 2, negative: 1 },
  ];

  const responseTimeData = [
    { category: 'Management', avgDays: 2.1 },
    { category: 'Work Environment', avgDays: 1.8 },
    { category: 'Benefits', avgDays: 3.2 },
    { category: 'Career Development', avgDays: 2.5 },
    { category: 'Compensation', avgDays: 4.1 },
  ];

  const filteredFeedback = feedbackData.filter(feedback =>
    feedback.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.sentiment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return <Badge variant="default" className="bg-success text-success-foreground">Positive</Badge>;
      case 'Neutral':
        return <Badge variant="outline" className="text-warning border-warning">Neutral</Badge>;
      case 'Negative':
        return <Badge variant="destructive">Negative</Badge>;
      default:
        return <Badge variant="secondary">{sentiment}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <Badge variant="outline" className="text-primary border-primary">New</Badge>;
      case 'Under Review':
        return <Badge variant="outline" className="text-warning border-warning">Under Review</Badge>;
      case 'Addressed':
        return <Badge variant="default" className="bg-success text-success-foreground">Addressed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Management': return 'bg-primary';
      case 'Work Environment': return 'bg-warning';
      case 'Benefits': return 'bg-success';
      case 'Career Development': return 'bg-accent';
      case 'Compensation': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const stats = [
    { title: 'Total Feedback', value: feedbackData.length, color: 'bg-primary' },
    { title: 'Positive', value: feedbackData.filter(f => f.sentiment === 'Positive').length, color: 'bg-success' },
    { title: 'Needs Attention', value: feedbackData.filter(f => f.sentiment === 'Negative').length, color: 'bg-destructive' },
    { title: 'Avg Rating', value: (feedbackData.reduce((acc, f) => acc + f.rating, 0) / feedbackData.length).toFixed(1), color: 'bg-accent' },
  ];

  const handleExportReport = () => {
    toast({
      title: "Export Report",
      description: "Feedback report is being exported...",
    });
  };

  const handleSendSurvey = () => {
    setShowSurveyDialog(true);
  };

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackDetails(true);
  };

  const handleRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackResponse(true);
  };

  const handleFilter = () => {
    toast({
      title: "Filter Applied",
      description: "Advanced filters have been applied to the feedback.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Feedback Center</h1>
            <p className="text-muted-foreground">Review employee feedback</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportReport}>Export Report</Button>
            <Button onClick={handleSendSurvey}>Send Survey</Button>
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

        {/* Analytics Toggle Button */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Feedback Analytics</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
          </CardHeader>
          {showAnalytics && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feedback Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feedback Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={feedbackTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="positive" stroke="#22c55e" name="Positive" />
                        <Line type="monotone" dataKey="neutral" stroke="#f59e0b" name="Neutral" />
                        <Line type="monotone" dataKey="negative" stroke="#ef4444" name="Negative" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Department Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feedback by Department</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={departmentFeedbackData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="positive" fill="#22c55e" name="Positive" />
                        <Bar dataKey="neutral" fill="#f59e0b" name="Neutral" />
                        <Bar dataKey="negative" fill="#ef4444" name="Negative" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Response Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Avg Response Time by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={responseTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} days`, 'Avg Response Time']} />
                        <Bar dataKey="avgDays" fill="#3b82f6" name="Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by category, sentiment, department, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleFilter}>Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Feedback ({filteredFeedback.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feedback ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.id}</TableCell>
                    <TableCell>
                      <div>
                        <p>{feedback.type}</p>
                        {feedback.employee && (
                          <p className="text-sm text-muted-foreground">{feedback.employee}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(feedback.category)}`}></div>
                        <span>{feedback.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSentimentBadge(feedback.sentiment)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{getRatingStars(feedback.rating)}</span>
                        <span className="text-sm text-muted-foreground">({feedback.rating}/5)</span>
                      </div>
                    </TableCell>
                    <TableCell>{feedback.department}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(feedback)}>View</Button>
                        {feedback.status !== 'Addressed' && (
                          <Button size="sm" variant="default" onClick={() => handleRespond(feedback)}>Respond</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Management', 'Work Environment', 'Benefits', 'Career Development'].map((category, index) => {
                const count = feedbackData.filter(f => f.category === category).length;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`}></div>
                      <span className="text-sm">{category}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">This Week</span>
                <Badge variant="outline" className="text-success border-success">+15% Positive</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Rate</span>
                <span className="text-sm font-medium">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">2.3 days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <FeedbackDetailsDialog
        feedback={selectedFeedback}
        open={showFeedbackDetails}
        onOpenChange={setShowFeedbackDetails}
      />
      <FeedbackResponseDialog
        feedback={selectedFeedback}
        open={showFeedbackResponse}
        onOpenChange={setShowFeedbackResponse}
      />
      <SurveyDialog
        open={showSurveyDialog}
        onOpenChange={setShowSurveyDialog}
      />
    </DashboardLayout>
  );
}
