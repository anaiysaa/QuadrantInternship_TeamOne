
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Feedback() {
  const [feedbackForm, setFeedbackForm] = useState({
    category: '',
    subject: '',
    message: '',
    anonymous: false,
    rating: 0
  });

  const myFeedback = [
    {
      id: 'FB001',
      category: 'Work Environment',
      subject: 'Office Temperature',
      status: 'Responded',
      submittedDate: '2024-02-05',
      rating: 3,
      response: 'Thank you for your feedback. We are working on adjusting the HVAC system.'
    },
    {
      id: 'FB002',
      category: 'Management',
      subject: 'Team Communication',
      status: 'Under Review',
      submittedDate: '2024-02-10',
      rating: 4,
      response: null
    },
    {
      id: 'FB003',
      category: 'Benefits',
      subject: 'Health Insurance Options',
      status: 'Resolved',
      submittedDate: '2024-01-28',
      rating: 2,
      response: 'We have added new health insurance options for the next enrollment period.'
    }
  ];

  const categories = [
    'Work Environment',
    'Management',
    'Benefits',
    'Career Development',
    'Compensation',
    'Team Collaboration',
    'Tools & Technology',
    'Company Culture',
    'Other'
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Under Review':
        return <Badge variant="outline" className="text-primary border-primary">Under Review</Badge>;
      case 'Responded':
        return <Badge variant="outline" className="text-warning border-warning">Responded</Badge>;
      case 'Resolved':
        return <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedbackForm);
    // Reset form
    setFeedbackForm({
      category: '',
      subject: '',
      message: '',
      anonymous: false,
      rating: 0
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-muted-foreground">Share your thoughts and help us improve</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Feedback</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{myFeedback.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{myFeedback.filter(f => f.status === 'Under Review').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Resolved</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{myFeedback.filter(f => f.status === 'Resolved').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Avg Rating</h3>
              </div>
              <p className="text-2xl font-bold mt-1">
                {(myFeedback.reduce((acc, f) => acc + f.rating, 0) / myFeedback.length).toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submit New Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <select
                    id="rating"
                    value={feedbackForm.rating}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value={0}>Select rating</option>
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your feedback"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide detailed feedback..."
                  className="w-full px-3 py-2 border border-input rounded-md min-h-[120px]"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={feedbackForm.anonymous}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, anonymous: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Submit anonymously
                </Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
                <Button type="submit">
                  Submit Feedback
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* My Feedback History */}
        <Card>
          <CardHeader>
            <CardTitle>My Feedback History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myFeedback.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.id}</TableCell>
                    <TableCell>{feedback.category}</TableCell>
                    <TableCell>{feedback.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{getRatingStars(feedback.rating)}</span>
                        <span className="text-sm text-muted-foreground">({feedback.rating}/5)</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell>{new Date(feedback.submittedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Responses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myFeedback.filter(f => f.response).map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{feedback.subject}</span>
                      <Badge className="ml-2" variant="outline">{feedback.category}</Badge>
                    </div>
                    {getStatusBadge(feedback.status)}
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{feedback.response}</p>
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
