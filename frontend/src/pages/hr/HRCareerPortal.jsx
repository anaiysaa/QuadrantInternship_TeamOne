import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { JobTemplateDialog } from '@/components/dialogs/JobTemplateDialog';
import { PostJobDialog } from '@/components/dialogs/PostJobDialog';
import { JobApplicationsDialog } from '@/components/dialogs/JobApplicationsDialog';
import { EditJobDialog } from '@/components/dialogs/EditJobDialog';
import { ReviewApplicationDialog } from '@/components/dialogs/ReviewApplicationDialog';
import { ScheduleInterviewDialog } from '@/components/dialogs/ScheduleInterviewDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HRCareerPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showJobTemplates, setShowJobTemplates] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showJobApplications, setShowJobApplications] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [showReviewApplication, setShowReviewApplication] = useState(false);
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);

  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/internal-jobs")
      .then(res => res.json())
      .then(data => setJobPostings(data))
      .catch(err => console.error("Failed to fetch jobs", err));
  }, []);

  useEffect(() => {
    fetch('/api/job-applications')
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(err => console.error("Failed to fetch applications:", err));
  }, []);

  const filteredPostings = jobPostings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'Draft':
        return <Badge variant="outline" className="text-warning border-warning">Draft</Badge>;
      case 'Closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'Paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'Under Review':
        return <Badge variant="outline" className="text-primary border-primary">Under Review</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="outline" className="text-warning border-warning">Interview Scheduled</Badge>;
      case 'Offer Extended':
        return <Badge variant="default" className="bg-success text-success-foreground">Offer Extended</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
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
    { title: 'Active Jobs', value: jobPostings.filter(j => j.status === 'Active').length, color: 'bg-success' },
    { title: 'Total Applications', value: applications.length, color: 'bg-primary' },
    { title: 'Interviews This Week', value: applications.filter(a => a.Status === 'Interview Scheduled').length, color: 'bg-warning' },
    { title: 'Offers Extended', value: applications.filter(a => a.Status === 'Offer Extended').length, color: 'bg-accent' },
  ];

  const handleJobTemplates = () => setShowJobTemplates(true);
  const handlePostNewJob = () => setShowPostJob(true);
  const handleEdit = (job) => { setSelectedJob(job); setShowEditJob(true); };
  const handleViewApps = (job) => { setSelectedJob(job); setShowJobApplications(true); };
  const handleReview = (application) => { setSelectedApplication(application); setShowReviewApplication(true); };
  const handleSchedule = (application) => { setSelectedApplication(application); setShowScheduleInterview(true); };

  const handleSaveJob = (updatedJob) => {
    setJobPostings(prevJobs =>
      prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j)
    );
  };

  const handleApplicationStatusUpdate = (updatedApplication) => {
    setApplications(prevApps =>
      prevApps.map(app => app.id === updatedApplication.id ? updatedApplication : app)
    );
  };

  const handleFilter = () => {
    toast({
      title: "Filter Applied",
      description: "Advanced filters have been applied to the job postings.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Career Portal</h1>
            <p className="text-muted-foreground">Manage career opportunities</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleJobTemplates}>Job Templates</Button>
            <Button onClick={handlePostNewJob}>Post New Job</Button>
          </div>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Search Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by title, department, location, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleFilter}>Filter</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Postings ({filteredPostings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Closing Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPostings.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getDepartmentColor(job.department)}`}></div>
                        <span>{job.department}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{job.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{job.applicants}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell className="text-sm">{new Date(job.closingDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(job)}>Edit</Button>
                        <Button size="sm" variant="default" onClick={() => handleViewApps(job)}>View Apps</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.ApplicationID}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.Name}</p>
                        <p className="text-sm text-muted-foreground">{app.Email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.JobTitle}</TableCell>
                    <TableCell>{new Date(app.ApplicationDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.Status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleReview(app)}>Review</Button>
                        <Button size="sm" variant="default" onClick={() => handleSchedule(app)}>Schedule</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <JobTemplateDialog open={showJobTemplates} onOpenChange={setShowJobTemplates} />
      <PostJobDialog open={showPostJob} onOpenChange={setShowPostJob} />
      <JobApplicationsDialog job={selectedJob} open={showJobApplications} onOpenChange={setShowJobApplications} />
      <EditJobDialog job={selectedJob} open={showEditJob} onOpenChange={setShowEditJob} onSave={handleSaveJob} />
      <ReviewApplicationDialog application={selectedApplication} open={showReviewApplication} onOpenChange={setShowReviewApplication} onStatusUpdate={handleApplicationStatusUpdate} />
      <ScheduleInterviewDialog application={selectedApplication} open={showScheduleInterview} onOpenChange={setShowScheduleInterview} onSchedule={handleApplicationStatusUpdate} />
    </DashboardLayout>
  );
}