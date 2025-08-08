import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FeedbackDetailsDialog } from '@/components/dialogs/FeedbackDetailsDialog';
import { FeedbackResponseDialog } from '@/components/dialogs/FeedbackResponseDialog';
import { SurveyDialog } from '@/components/dialogs/SurveyDialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HRFeedbackCenter() {
  const { user } = useAuth();
  const employeeId = user?.employeeId;
  const isWoman = user?.gender?.toUpperCase?.() === 'F'; // ✅ Use "F" from DB

  const [feedbackData, setFeedbackData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);
  const [showFeedbackResponse, setShowFeedbackResponse] = useState(false);
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback/all`);
      const data = await res.json();

      // ✅ Show all feedback; women-only only to women
      const visible = data.filter((f) => {
        if (f.isWomenOnly) return isWoman;
        return true;
      });

      setFeedbackData(visible);
    } catch (error) {
      console.error('❌ Failed to load feedback:', error);
      toast({ title: 'Error', description: 'Could not load feedback.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchFeedback();
  }, [employeeId]);

  const filteredFeedback = feedbackData.filter((feedback) =>
    feedback.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
      case 'Under Review':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Under Review</Badge>;
      case 'Responded':
        return <Badge variant="secondary">Responded</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const getRatingStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackDetails(true);
  };

  const handleRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackResponse(true);
  };

  const stats = [
    { title: 'Total Feedback', value: feedbackData.length, color: 'bg-primary' },
    {
      title: 'Pending Review',
      value: feedbackData.filter(f => f.status !== 'Responded').length,
      color: 'bg-yellow-500',
    },
    {
      title: 'Responded',
      value: feedbackData.filter(f => f.status === 'Responded').length,
      color: 'bg-green-600',
    },
    {
      title: 'Avg Rating',
      value: (feedbackData.reduce((acc, f) => acc + (f.rating || 0), 0) / (feedbackData.length || 1)).toFixed(1),
      color: 'bg-accent',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Feedback Center</h1>
            <p className="text-muted-foreground">Review employee feedback</p>
          </div>
          <Button onClick={() => setShowSurveyDialog(true)}>Send Survey</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                  <h3 className="text-sm text-muted-foreground">{stat.title}</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card>
          <CardHeader><CardTitle>Search Feedback</CardTitle></CardHeader>
          <CardContent>
            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </CardContent>
        </Card>

        {/* Pending Feedback */}
        <Card>
          <CardHeader><CardTitle>Pending Feedback</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading feedback...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feedback ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Recipient Group</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.filter(f => f.status !== 'Responded').map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>{feedback.id}</TableCell>
                      <TableCell>{feedback.anonymous ? 'Anonymous' : 'Named'}</TableCell>
                      <TableCell>{feedback.category}</TableCell>
                      <TableCell>{getRatingStars(feedback.rating)}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell>{new Date(feedback.submittedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {feedback.isWomenOnly
                          ? <Badge variant="outline" className="text-pink-600 border-pink-600">Women-Only</Badge>
                          : <Badge variant="secondary">All</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(feedback)}>View</Button>
                          <Button size="sm" onClick={() => handleRespond(feedback)}>Respond</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Responded Feedback */}
        <Card>
          <CardHeader><CardTitle>Responded Feedback</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feedback ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Recipient Group</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.filter(f => f.status === 'Responded').map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.id}</TableCell>
                    <TableCell>{feedback.anonymous ? 'Anonymous' : 'Named'}</TableCell>
                    <TableCell>{feedback.category}</TableCell>
                    <TableCell>{getRatingStars(feedback.rating)}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell>{new Date(feedback.submittedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {feedback.isWomenOnly
                        ? <Badge variant="outline" className="text-pink-600 border-pink-600">Women-Only</Badge>
                        : <Badge variant="secondary">All</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleView(feedback)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
        onOpenChange={(open) => {
          setShowFeedbackResponse(open);
          if (!open) fetchFeedback(); // Refresh after responding
        }}
      />
      <SurveyDialog open={showSurveyDialog} onOpenChange={setShowSurveyDialog} />
    </DashboardLayout>
  );
}
