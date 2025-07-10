
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
  const navigate = useNavigate();
  const { toast } = useToast();

  // ... keep existing code (jobPostings and applications arrays, and all helper functions)
  const jobPostings = [
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
      hiringManager: 'Sarah Johnson'
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
      hiringManager: 'Mike Wilson'
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
      hiringManager: 'Lisa Brown'
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
      hiringManager: 'Tom Wilson'
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
      hiringManager: 'Alex Brown'
    }
  ];

  const applications = [
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
  ];

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
    toast({
      title: "Job Templates",
      description: "Opening job template management interface...",
    });
  };

  const handlePostNewJob = () => {
    toast({
      title: "Post New Job",
      description: "Opening new job posting form...",
    });
  };

  const handleEdit = (jobId) => {
    toast({
      title: "Edit Job",
      description: `Opening edit form for job ${jobId}`,
    });
  };

  const handleViewApps = (jobId) => {
    toast({
      title: "View Applications",
      description: `Opening applications list for job ${jobId}`,
    });
  };

  const handleReview = (appId) => {
    toast({
      title: "Review Application",
      description: `Opening application review for ${appId}`,
    });
  };

  const handleSchedule = (appId) => {
    toast({
      title: "Schedule Interview",
      description: `Opening interview scheduler for ${appId}`,
    });
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
                        <Button size="sm" variant="outline" onClick={() => handleEdit(job.id)}>Edit</Button>
                        <Button size="sm" variant="default" onClick={() => handleViewApps(job.id)}>View Apps</Button>
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
                        <Button size="sm" variant="outline" onClick={() => handleReview(app.id)}>Review</Button>
                        <Button size="sm" variant="default" onClick={() => handleSchedule(app.id)}>Schedule</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
