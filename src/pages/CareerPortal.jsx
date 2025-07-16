import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { JobDetailsDialog } from "@/components/dialogs/JobDetailsDialog";
import { ApplicationDetailsDialog } from "@/components/dialogs/ApplicationDetailsDialog";
import { JobApplicationDialog } from "@/components/dialogs/JobApplicationDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CareerPortal() {
  /* ─────────────────────────── state ─────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showJobApplication, setShowJobApplication] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());

  const { toast } = useToast();
  const { user } = useAuth();

  /* ─────────────────────── mock profile data ─────────────────── */
  const userSkills = user?.skills || [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Project Management",
    "Team Leadership",
    "Agile",
    "SQL",
  ];

  /* ───────────── mock course db (truncated for brevity) ───────── */
  const courseDatabase = {
    TypeScript: [
      {
        name: "TypeScript Fundamentals",
        provider: "Udemy",
        url: "https://www.udemy.com/course/typescript-fundamentals",
        duration: "8 hours",
        level: "Beginner",
      },
      {
        name: "Advanced TypeScript",
        provider: "Pluralsight",
        url: "https://www.pluralsight.com/courses/advanced-typescript",
        duration: "5 hours",
        level: "Intermediate",
      },
    ],
    HTML: [
      {
        name: "HTML5 and CSS3",
        provider: "Coursera",
        url: "https://www.coursera.org/learn/html5-css3",
        duration: "12 hours",
        level: "Beginner",
      },
    ],
    CSS: [
      {
        name: "CSS Flexbox and Grid",
        provider: "LinkedIn Learning",
        url: "https://www.linkedin.com/learning/css-flexbox-and-grid",
        duration: "6 hours",
        level: "Intermediate",
      },
    ],
    Analytics: [
      {
        name: "Data Analytics for Managers",
        provider: "edX",
        url: "https://www.edx.org/course/data-analytics-for-managers",
        duration: "10 weeks",
        level: "Intermediate",
      },
    ],
    /* … add remaining skills as needed … */
  };

  /* ───────────────────────── job openings ────────────────────── */
  const jobOpenings = [
    {
      id: "JP001",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      level: "Senior",
      description:
        "Join our engineering team to build cutting-edge web applications using React and TypeScript.",
      requirements: [
        "5+ years React experience",
        "TypeScript proficiency",
        "Team leadership skills",
      ],
      skills: [
        "React",
        "TypeScript",
        "JavaScript",
        "HTML",
        "CSS",
        "Team Leadership",
      ],
      postedDate: "2024-02-01",
    },
    {
      id: "JP002",
      title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "Full-time",
      level: "Mid-level",
      description:
        "Drive product strategy and work with cross-functional teams to deliver exceptional user experiences.",
      requirements: [
        "3+ years PM experience",
        "Analytics background",
        "User research skills",
      ],
      skills: [
        "Project Management",
        "Analytics",
        "User Research",
        "Agile",
        "Communication",
      ],
      postedDate: "2024-02-05",
    },
    {
      id: "JP003",
      title: "UX/UI Designer",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-time",
      level: "Mid-level",
      description:
        "Create beautiful and intuitive user interfaces that delight our customers.",
      requirements: [
        "Portfolio of design work",
        "Figma expertise",
        "User testing experience",
      ],
      skills: [
        "Figma",
        "User Testing",
        "UI Design",
        "UX Research",
        "Prototyping",
      ],
      postedDate: "2024-02-03",
    },
    {
      id: "JP004",
      title: "Sales Development Representative",
      department: "Sales",
      location: "Chicago, IL",
      type: "Full-time",
      level: "Entry-level",
      description:
        "Generate new business opportunities and build relationships with potential clients.",
      requirements: [
        "Strong communication skills",
        "CRM experience preferred",
        "Goal-oriented mindset",
      ],
      skills: ["Communication", "CRM", "Sales", "Customer Relationship"],
      postedDate: "2024-01-28",
    },
  ];

  /* ─────────────────────── my applications ───────────────────── */
  const myApplications = [
    {
      id: "APP001",
      jobTitle: "Senior Frontend Developer",
      jobId: "JP001",
      status: "Interview Scheduled",
      appliedDate: "2024-02-08",
      stage: "Technical Interview – Feb 20 2024",
    },
    {
      id: "APP002",
      jobTitle: "Product Manager",
      jobId: "JP002",
      status: "Under Review",
      appliedDate: "2024-02-10",
      stage: "Application Review",
    },
  ];

  /* ───────────────────────── helpers ─────────────────────────── */
  const filteredJobs = jobOpenings.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Interview Scheduled":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Interview Scheduled
          </Badge>
        );
      case "Under Review":
        return (
          <Badge variant="outline" className="text-primary border-primary">
            Under Review
          </Badge>
        );
      case "Offer Extended":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground"
          >
            Offer Extended
          </Badge>
        );
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case "Engineering":
        return "bg-primary";
      case "Product":
        return "bg-success";
      case "Design":
        return "bg-warning";
      case "Sales":
        return "bg-destructive";
      case "Marketing":
        return "bg-accent";
      default:
        return "bg-secondary";
    }
  };

  /* ──────────────────────── actions ──────────────────────────── */
  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleApplyNow = (job) => {
    setSelectedJob(job);
    setShowJobApplication(true);
  };

  const handleLearnMore = (job) => {
    toast({
      title: "Learn More",
      description: `Opening information about ${job.title} and our company culture.`,
    });
  };

  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleSaveJob = (job) => {
    const next = new Set(savedJobs);
    if (next.has(job.id)) {
      next.delete(job.id);
      toast({ title: "Job Unsaved", description: `${job.title} removed.` });
    } else {
      next.add(job.id);
      toast({ title: "Job Saved", description: `${job.title} saved.` });
    }
    setSavedJobs(next);
  };

  /* ─────────────────────────── UI ────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* header */}
        <div>
          <h1 className="text-2xl font-bold">Career Portal</h1>
          <p className="text-muted-foreground">
            Explore career opportunities and manage your applications
          </p>
        </div>

        {/* my applications */}
        {myApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.jobTitle}</span>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applied:{" "}
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{app.stage}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplicationDetails(app)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* search */}
        <Card>
          <CardHeader>
            <CardTitle>Find Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search by title, department, or location…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Advanced Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* job list */}
        <Card>
          <CardHeader>
            <CardTitle>Available Positions ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const missingSkills = job.skills.filter(
                  (s) => !userSkills.includes(s)
                );

                return (
                  <div key={job.id} className="border rounded-lg p-4">
                    {/* ─── top row ─── */}
                    <div className="flex justify-between">
                      {/* job meta */}
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${getDepartmentColor(
                                job.department
                              )}`}
                            />
                            <span>{job.department}</span>
                          </div>
                          <span>📍 {job.location}</span>
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="secondary">{job.level}</Badge>
                        </div>
                      </div>

                      {/* recommended courses */}
                      {missingSkills.length > 0 && (
                        <div className="text-sm text-muted-foreground ml-6">
                          <p className="font-medium">Recommended Courses:</p>
                          {missingSkills.map((skill) => (
                            <div key={skill} className="mt-1">
                              <p className="font-medium">{skill}</p>
                              <ul className="list-disc list-inside ml-4">
                                {courseDatabase[skill]?.map((course) => (
                                  <li key={course.url}>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <a
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline"
                                          >
                                            {course.name}
                                          </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Provider: {course.provider}
                                            <br />
                                            Duration: {course.duration}
                                            <br />
                                            Level: {course.level}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* description */}
                    <p className="text-sm text-muted-foreground mt-2">
                      {job.description}
                    </p>

                    {/* requirements */}
                    <div className="mt-2">
                      <h4 className="font-medium text-sm">Requirements:</h4>
                      <ul className="list-disc list-inside ml-4 text-sm">
                        {job.requirements.map((req) => (
                          <li key={req}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* skills */}
                    <div className="mt-2">
                      <h4 className="font-medium text-sm">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {job.skills.map((skill) => {
                          const hasSkill = userSkills.includes(skill);
                          return (
                            <TooltipProvider key={skill}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant="outline"
                                    className={`text-sm ${
                                      hasSkill
                                        ? "bg-success/20 border-success text-success-foreground"
                                        : "bg-muted/50 border-muted text-muted-foreground opacity-70"
                                    }`}
                                  >
                                    {skill}
                                  </Badge>
                                </TooltipTrigger>
                                {!hasSkill && (
                                  <TooltipContent>
                                    <p>
                                      Learn {skill}!{" "}
                                      <a
                                        href={`https://www.example.com/learn/${skill
                                          .toLowerCase()
                                          .replace(/\s+/g, "-")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline"
                                      >
                                        Explore Resources
                                      </a>
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center justify-between mt-3 border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveJob(job)}
                        className={
                          savedJobs.has(job.id)
                            ? "bg-primary/10 border-primary"
                            : ""
                        }
                      >
                        {savedJobs.has(job.id) ? "Saved" : "Save Job"}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLearnMore(job)}
                        >
                          Learn More
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(job)}
                        >
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleApplyNow(job)}>
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* dialogs */}
      <JobDetailsDialog
        job={selectedJob}
        open={showJobDetails}
        onOpenChange={setShowJobDetails}
      />
      <ApplicationDetailsDialog
        application={selectedApplication}
        open={showApplicationDetails}
        onOpenChange={setShowApplicationDetails}
      />
      <JobApplicationDialog
        job={selectedJob}
        open={showJobApplication}
        onOpenChange={setShowJobApplication}
      />
    </DashboardLayout>
  );
}
