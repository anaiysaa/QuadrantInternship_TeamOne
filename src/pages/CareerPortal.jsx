
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function CareerPortal() {
  const [searchTerm, setSearchTerm] = useState('');

  const jobOpenings = [
    {
      id: 'JP001',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      level: 'Senior',
      description: 'Join our engineering team to build cutting-edge web applications using React and TypeScript.',
      requirements: ['5+ years React experience', 'TypeScript proficiency', 'Team leadership skills'],
      postedDate: '2024-02-01'
    },
    {
      id: 'JP002',
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      level: 'Mid-level',
      description: 'Drive product strategy and work with cross-functional teams to deliver exceptional user experiences.',
      requirements: ['3+ years PM experience', 'Analytics background', 'User research skills'],
      postedDate: '2024-02-05'
    },
    {
      id: 'JP003',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Mid-level',
      description: 'Create beautiful and intuitive user interfaces that delight our customers.',
      requirements: ['Portfolio of design work', 'Figma expertise', 'User testing experience'],
      postedDate: '2024-02-03'
    },
    {
      id: 'JP004',
      title: 'Sales Development Representative',
      department: 'Sales',
      location: 'Chicago, IL',
      type: 'Full-time',
      level: 'Entry-level',
      description: 'Generate new business opportunities and build relationships with potential clients.',
      requirements: ['Strong communication skills', 'CRM experience preferred', 'Goal-oriented mindset'],
      postedDate: '2024-01-28'
    }
  ];

  const myApplications = [
    {
      id: 'APP001',
      jobTitle: 'Senior Frontend Developer',
      jobId: 'JP001',
      status: 'Interview Scheduled',
      appliedDate: '2024-02-08',
      stage: 'Technical Interview - Feb 20, 2024'
    },
    {
      id: 'APP002',
      jobTitle: 'Product Manager',
      jobId: 'JP002',
      status: 'Under Review',
      appliedDate: '2024-02-10',
      stage: 'Application Review'
    }
  ];

  const filteredJobs = jobOpenings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Interview Scheduled':
        return <Badge variant="outline" className="text-warning border-warning">Interview Scheduled</Badge>;
      case 'Under Review':
        return <Badge variant="outline" className="text-primary border-primary">Under Review</Badge>;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Career Portal</h1>
          <p className="text-muted-foreground">Explore career opportunities and manage your applications</p>
        </div>

        {/* My Applications */}
        {myApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{application.jobTitle}</span>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applied: {new Date(application.appliedDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{application.stage}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Find Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Advanced Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Openings */}
        <Card>
          <CardHeader>
            <CardTitle>Available Positions ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getDepartmentColor(job.department)}`}></div>
                          <span>{job.department}</span>
                        </div>
                        <span>📍 {job.location}</span>
                        <Badge variant="outline">{job.type}</Badge>
                        <Badge variant="secondary">{job.level}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button>Apply Now</Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Posted: {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{job.description}</p>
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      Save Job
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                      <Button size="sm">
                        Apply Now
                      </Button>
                    </div>
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
