
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

export default function HRFeedbackCenter() {
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Feedback Center</h1>
            <p className="text-muted-foreground">Review employee feedback</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export Report</Button>
            <Button>Send Survey</Button>
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
              <Button variant="outline">Filter</Button>
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
                        <Button size="sm" variant="outline">View</Button>
                        {feedback.status !== 'Addressed' && (
                          <Button size="sm" variant="default">Respond</Button>
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
    </DashboardLayout>
  );
}
