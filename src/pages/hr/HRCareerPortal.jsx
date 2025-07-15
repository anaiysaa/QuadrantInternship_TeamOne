import { useState } from 'react';
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

  const [jobPostings, setJobPostings] = useState([
    {
      id: 'JP001',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      level: 'Senior',
      status: 'Active',
      applicants: 24,
      postedDate: '2024-02-01',
      closingDate: '2024-03-01',
      hiringManager: 'Sarah Johnson',
      description: 'Join our engineering team to build cutting-edge web applications using React and TypeScript.',
      requirements: ['5+ years React experience', 'TypeScript proficiency', 'Team leadership skills']
    },
    {
      id: 'JP002',
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      level: 'Mid-level',
      status: 'Active',
      applicants: 18,
      postedDate: '2024-02-05',
      closingDate: '2024-03-05',
      hiringManager: 'Mike Wilson',
      description: 'Drive product strategy and work with cross-functional teams to deliver exceptional user experiences.',
      requirements: ['3+ years PM experience', 'Analytics background', 'User research skills']
    },
    {
      id: 'JP003',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Mid-level',
      status: 'Draft',
      applicants: 0,
      postedDate: null,
      closingDate: '2024-02-28',
      hiringManager: 'Lisa Brown',
      description: 'Create beautiful and intuitive user interfaces that delight our customers.',
      requirements: ['Portfolio of design work', 'Figma expertise', 'User testing experience']
    },
    {
      id: 'JP004',
      title: 'Sales Development Representative',
      department: 'Sales',
      location: 'Chicago, IL',
      type: 'Full-time',
      level: 'Entry-level',
      status: 'Active',
      applicants: 31,
      postedDate: '2024-01-28',
      closingDate: '2024-02-25',
      hiringManager: 'Tom Wilson',
      description: 'Generate new business opportunities and build relationships with potential clients.',
      requirements: ['Strong communication skills', 'CRM experience preferred', 'Goal-oriented mindset']
    },
    {
      id: 'JP005',
      title: 'Marketing Coordinator',
      department: 'Marketing',
      location: 'Remote',
      type: 'Part-time',
      level: 'Entry-level',
      status: 'Closed',
      applicants: 42,
      postedDate: '2024-01-15',
      closingDate: '2024-02-10',
      hiringManager: 'Alex Brown',
      description: 'Support marketing campaigns and coordinate promotional activities.',
      requirements: ['Bachelor\'s degree in Marketing', 'Social media experience', 'Creative mindset']
    }
  ]);

  const [applications, setApplications] = useState([
    {
      id: 'APP001',
      candidateName: 'Jennifer Smith',
      email: 'jennifer.smith@email.com',
      jobTitle: 'Senior Frontend Developer',
      jobId: 'JP001',
      status: 'Interview Scheduled',
      appliedDate: '2024-02-08',
      stage: 'Technical Interview',
      rating: 4
    },
    {
      id: 'APP002',
      candidateName: 'David Chen',
      email: 'david.chen@email.com',
      jobTitle: 'Product Manager',
      jobId: 'JP002',
      status: 'Under Review',
      appliedDate: '2024-02-10',
      stage: 'Application Review',
      rating: 3
    },
    {
      id: 'APP003',
      candidateName: 'Maria Rodriguez',
      email: 'maria.rodriguez@email.com',
      jobTitle: 'Senior Frontend Developer',
      jobId: 'JP001',
      status: 'Offer Extended',
      appliedDate: '2024-02-03',
      stage: 'Final Decision',
      rating: 5
    }
  ]);

  const navigate = useNavigate();
  const { toast } = useToast();

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
    { title: 'Total Applications', value: jobPostings.reduce((acc, job) => acc + job.applicants, 0), color: 'bg-primary' },
    { title: 'Interviews This Week', value: applications.filter(a => a.status === 'Interview Scheduled').length, color: 'bg-warning' },
    { title: 'Offers Extended', value: applications.filter(a => a.status === 'Offer Extended').length, color: 'bg-accent' },
  ];

  const handleJobTemplates = () => {
    setShowJobTemplates(true);
  };

  const handlePostNewJob = () => {
    setShowPostJob(true);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setShowEditJob(true);
  };

  const handleSaveJob = (updatedJob) => {
    setJobPostings(prevJobs =>
      prevJobs.map(j => j.id === updatedJob.id ? updatedJob : j)
    );
  };

  const handleViewApps = (job) => {
    setSelectedJob(job);
    setShowJobApplications(true);
  };

  const handleReview = (application) => {
    setSelectedApplication(application);
    setShowReviewApplication(true);
  };

  const handleSchedule = (application) => {
    setSelectedApplication(application);
    setShowScheduleInterview(true);
  };

  const handleApplicationStatusUpdate = (updatedApplication) => {
    setApplications(prevApps =>
      prevApps.map(app => 
        app.id === updatedApplication.id ? updatedApplication : app
      )
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

        {/* Job Postings Table */}
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
                    <TableCell className="text-sm">
                      {new Date(job.closingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(job)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleViewApps(job)}>
                          View Apps
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.candidateName}</p>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.jobTitle}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{app.stage}</TableCell>
                    <TableCell>{getApplicationStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-lg">{'★'.repeat(app.rating)}{'☆'.repeat(5 - app.rating)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleReview(app)}>
                          Review
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleSchedule(app)}>
                          Schedule
                        </Button>
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
      <JobTemplateDialog
        open={showJobTemplates}
        onOpenChange={setShowJobTemplates}
      />
      <PostJobDialog
        open={showPostJob}
        onOpenChange={setShowPostJob}
      />
      <JobApplicationsDialog
        job={selectedJob}
        open={showJobApplications}
        onOpenChange={setShowJobApplications}
      />
      <EditJobDialog
        job={selectedJob}
        open={showEditJob}
        onOpenChange={setShowEditJob}
        onSave={handleSaveJob}
      />
      <ReviewApplicationDialog
        application={selectedApplication}
        open={showReviewApplication}
        onOpenChange={setShowReviewApplication}
        onStatusUpdate={handleApplicationStatusUpdate}
      />
      <ScheduleInterviewDialog
        application={selectedApplication}
        open={showScheduleInterview}
        onOpenChange={setShowScheduleInterview}
        onSchedule={handleApplicationStatusUpdate}
      />
    </DashboardLayout>
  );
}
