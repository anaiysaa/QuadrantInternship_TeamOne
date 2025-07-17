import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { JobDetailsDialog } from "@/components/dialogs/JobDetailsDialog";
import { ApplicationDetailsDialog } from "@/components/dialogs/ApplicationDetailsDialog";
import { JobApplicationDialog } from "@/components/dialogs/JobApplicationDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  BookOpen,
} from "lucide-react";

export default function CareerPortal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showJobApplication, setShowJobApplication] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const { toast } = useToast();

  // Mock user skills - in real app this would come from user profile
  const userSkills = [
    "React",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "Figma",
    "User research",
    "Analytics",
    "Communication skills",
  ];

  // Mock course database - in real app this would come from LMS or external APIs
  const courseDatabase = {
    "Node.js": [
      {
        id: "node-1",
        title: "Node.js: The Complete Guide",
        platform: "Udemy",
        duration: "40 hours",
        link: "https://udemy.com/nodejs-complete",
        description: "Master Node.js by building real-world applications",
      },
      {
        id: "node-2",
        title: "Node.js Fundamentals",
        platform: "LinkedIn Learning",
        duration: "3 hours",
        link: "https://linkedin.com/learning/nodejs",
        description: "Learn the basics of Node.js development",
      },
    ],
    "Team leadership": [
      {
        id: "lead-1",
        title: "Leadership and Team Management",
        platform: "Coursera",
        duration: "6 weeks",
        link: "https://coursera.org/leadership",
        description: "Develop essential leadership skills",
      },
    ],
    Git: [
      {
        id: "git-1",
        title: "Git Version Control",
        platform: "Internal LMS",
        duration: "2 hours",
        link: "/lms/git-course",
        description: "Master Git for version control",
      },
    ],
    "Product strategy": [
      {
        id: "strategy-1",
        title: "Product Strategy and Roadmap",
        platform: "Coursera",
        duration: "4 weeks",
        link: "https://coursera.org/product-strategy",
        description: "Learn strategic product management",
      },
    ],
    "Data analysis": [
      {
        id: "data-1",
        title: "Data Analysis with Excel",
        platform: "LinkedIn Learning",
        duration: "5 hours",
        link: "https://linkedin.com/learning/data-analysis",
        description: "Analyze data effectively with Excel",
      },
    ],
    "Roadmap planning": [
      {
        id: "roadmap-1",
        title: "Product Roadmap Planning",
        platform: "Udemy",
        duration: "8 hours",
        link: "https://udemy.com/roadmap-planning",
        description: "Create effective product roadmaps",
      },
    ],
    "Adobe Creative Suite": [
      {
        id: "adobe-1",
        title: "Adobe Creative Suite Masterclass",
        platform: "Udemy",
        duration: "25 hours",
        link: "https://udemy.com/adobe-suite",
        description: "Master Photoshop, Illustrator, and InDesign",
      },
    ],
    Prototyping: [
      {
        id: "proto-1",
        title: "Digital Prototyping Fundamentals",
        platform: "Internal LMS",
        duration: "3 hours",
        link: "/lms/prototyping",
        description: "Learn prototyping best practices",
      },
    ],
    "Design systems": [
      {
        id: "design-1",
        title: "Building Design Systems",
        platform: "LinkedIn Learning",
        duration: "4 hours",
        link: "https://linkedin.com/learning/design-systems",
        description: "Create scalable design systems",
      },
    ],
    "Usability testing": [
      {
        id: "usability-1",
        title: "UX Research and Usability Testing",
        platform: "Coursera",
        duration: "3 weeks",
        link: "https://coursera.org/usability-testing",
        description: "Conduct effective usability tests",
      },
    ],
    "CRM software": [
      {
        id: "crm-1",
        title: "Salesforce Fundamentals",
        platform: "Salesforce Trailhead",
        duration: "10 hours",
        link: "https://trailhead.salesforce.com",
        description: "Learn Salesforce CRM basics",
      },
    ],
    "Sales prospecting": [
      {
        id: "prospect-1",
        title: "Modern Sales Prospecting",
        platform: "LinkedIn Learning",
        duration: "2 hours",
        link: "https://linkedin.com/learning/sales-prospecting",
        description: "Master digital prospecting techniques",
      },
    ],
    "Lead generation": [
      {
        id: "lead-1",
        title: "Lead Generation Strategies",
        platform: "Udemy",
        duration: "6 hours",
        link: "https://udemy.com/lead-generation",
        description: "Generate quality leads effectively",
      },
    ],
    "Customer relations": [
      {
        id: "customer-1",
        title: "Customer Relationship Management",
        platform: "Internal LMS",
        duration: "4 hours",
        link: "/lms/customer-relations",
        description: "Build strong customer relationships",
      },
    ],
    "Goal orientation": [
      {
        id: "goal-1",
        title: "Goal Setting and Achievement",
        platform: "LinkedIn Learning",
        duration: "1.5 hours",
        link: "https://linkedin.com/learning/goal-setting",
        description: "Set and achieve professional goals",
      },
    ],
  };

  // ... keep existing code (jobOpenings, myApplications, filteredJobs arrays)

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
        "Node.js",
        "Team leadership",
        "Git",
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
        "Product strategy",
        "Analytics",
        "User research",
        "Data analysis",
        "Communication skills",
        "Roadmap planning",
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
        "Adobe Creative Suite",
        "User research",
        "Prototyping",
        "Design systems",
        "Usability testing",
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
      skills: [
        "Communication skills",
        "CRM software",
        "Sales prospecting",
        "Lead generation",
        "Customer relations",
        "Goal orientation",
      ],
      postedDate: "2024-01-28",
    },
  ];

  const myApplications = [
    {
      id: "APP001",
      jobTitle: "Senior Frontend Developer",
      jobId: "JP001",
      status: "Interview Scheduled",
      appliedDate: "2024-02-08",
      stage: "Technical Interview - Feb 20, 2024",
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

  const filteredJobs = jobOpenings.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... keep existing code (calculateSkillMatch, getMatchStatusColor, getMatchStatusText functions)

  const calculateSkillMatch = (jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return 0;

    const matchingSkills = jobSkills.filter((skill) =>
      userSkills.some(
        (userSkill) =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    return Math.round((matchingSkills.length / jobSkills.length) * 100);
  };

  const getMatchStatusColor = (percentage) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getMatchStatusText = (percentage) => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Partial Match";
    return "Skills Gap";
  };

  const getMissingSkills = (jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return [];

    return jobSkills.filter(
      (skill) =>
        !userSkills.some(
          (userSkill) =>
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
        )
    );
  };

  const getRecommendedCourses = (missingSkills) => {
    const courses = [];
    missingSkills.forEach((skill) => {
      if (courseDatabase[skill]) {
        courses.push(
          ...courseDatabase[skill].map((course) => ({
            ...course,
            skill,
          }))
        );
      }
    });
    return courses;
  };

  const toggleCoursesExpanded = (jobId) => {
    const newExpanded = new Set(expandedCourses);
    if (expandedCourses.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleEnrollCourse = (course, jobTitle) => {
    const courseKey = `${course.id}-${jobTitle}`;
    const newEnrolled = new Set(enrolledCourses);

    if (!enrolledCourses.has(courseKey)) {
      newEnrolled.add(courseKey);
      setEnrolledCourses(newEnrolled);

      toast({
        title: "Course Enrollment Tracked",
        description: `Your interest in "${course.title}" has been recorded for upskilling metrics.`,
      });

      // Simulate opening course link
      if (course.platform === "Internal LMS") {
        toast({
          title: "Redirecting to Internal LMS",
          description: `Opening ${course.title} in our learning management system.`,
        });
      } else {
        window.open(course.link, "_blank");
      }
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "Coursera":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Udemy":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "LinkedIn Learning":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Internal LMS":
        return "bg-green-50 text-green-700 border-green-200";
      case "Salesforce Trailhead":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ... keep existing code (all handler functions like handleViewDetails, handleApplyNow, etc.)

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleApplyNow = (job) => {
    setSelectedJob(job);
    setShowJobApplication(true);
  };

  const handleLearnMore = (job) => {
    // Show detailed company and role information
    toast({
      title: "Learn More",
      description: `Opening detailed information about ${job.title} and our company culture, benefits, and growth opportunities.`,
    });

    // In a real app, this could open a company page or detailed job description
    setTimeout(() => {
      toast({
        title: "Company Information",
        description:
          "We're a fast-growing tech company with competitive benefits, flexible work arrangements, and amazing growth opportunities. Our team values innovation, collaboration, and work-life balance.",
      });
    }, 1500);
  };

  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleSaveJob = (job) => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(job.id)) {
      newSavedJobs.delete(job.id);
      toast({
        title: "Job Unsaved",
        description: `${job.title} has been removed from your saved jobs.`,
      });
    } else {
      newSavedJobs.add(job.id);
      toast({
        title: "Job Saved",
        description: `${job.title} has been saved to your favorites.`,
      });
    }
    setSavedJobs(newSavedJobs);
  };

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

  const getSkillBadgeVariant = (skill) => {
    const normalizedSkill = skill.toLowerCase();
    const hasSkill = userSkills.some(
      (userSkill) =>
        userSkill.toLowerCase().includes(normalizedSkill) ||
        normalizedSkill.includes(userSkill.toLowerCase())
    );

    return hasSkill ? "default" : "secondary";
  };

  const getSkillBadgeClass = (skill) => {
    const normalizedSkill = skill.toLowerCase();
    const hasSkill = userSkills.some(
      (userSkill) =>
        userSkill.toLowerCase().includes(normalizedSkill) ||
        normalizedSkill.includes(userSkill.toLowerCase())
    );

    return hasSkill
      ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
      : "bg-muted text-muted-foreground hover:bg-muted/80";
  };

  const getLearningResource = (skill) => {
    const resources = {
      React: "Learn React on React.dev",
      TypeScript: "TypeScript Handbook",
      JavaScript: "MDN JavaScript Guide",
      "Node.js": "Node.js Documentation",
      Figma: "Figma Academy",
      Analytics: "Google Analytics Academy",
      "Product strategy": "Product Management courses",
      "Design systems": "Design Systems Handbook",
      "CRM software": "Salesforce Trailhead",
      "Sales prospecting": "Sales Training Resources",
    };

    return resources[skill] || `Learn ${skill} online`;
  };

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Career Portal</h1>
            <p className="text-muted-foreground">
              Explore career opportunities and manage your applications
            </p>
          </div>

          {/* ... keep existing code (My Applications section) */}
          {myApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {application.jobTitle}
                          </span>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Applied:{" "}
                          {new Date(
                            application.appliedDate
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm">{application.stage}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewApplicationDetails(application)
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ... keep existing code (Search section) */}
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
                {filteredJobs.map((job) => {
                  const matchPercentage = calculateSkillMatch(job.skills);
                  const missingSkills = getMissingSkills(job.skills);
                  const recommendedCourses =
                    getRecommendedCourses(missingSkills);
                  const isCoursesExpanded = expandedCourses.has(job.id);

                  return (
                    <div key={job.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getDepartmentColor(
                                  job.department
                                )}`}
                              ></div>
                              <span>{job.department}</span>
                            </div>
                            <span>📍 {job.location}</span>
                            <Badge variant="outline">{job.type}</Badge>
                            <Badge variant="secondary">{job.level}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button onClick={() => handleApplyNow(job)}>
                            Apply Now
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Posted:{" "}
                            {new Date(job.postedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {job.description}
                      </p>

                      {/* ... keep existing code (Skill Match Indicator and Required Skills sections) */}
                      <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Skill Match</h4>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-medium ${getMatchStatusColor(
                                matchPercentage
                              )}`}
                            >
                              {getMatchStatusText(matchPercentage)}
                            </span>
                            <span className="text-sm font-bold">
                              {matchPercentage}%
                            </span>
                          </div>
                        </div>
                        <Progress value={matchPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on {job.skills ? job.skills.length : 0} required
                          skills
                        </p>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-3">Required Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => {
                              const hasSkill = userSkills.some(
                                (userSkill) =>
                                  userSkill
                                    .toLowerCase()
                                    .includes(skill.toLowerCase()) ||
                                  skill
                                    .toLowerCase()
                                    .includes(userSkill.toLowerCase())
                              );

                              if (hasSkill) {
                                return (
                                  <Badge
                                    key={index}
                                    variant={getSkillBadgeVariant(skill)}
                                    className={getSkillBadgeClass(skill)}
                                  >
                                    {skill}
                                  </Badge>
                                );
                              }

                              return (
                                <Tooltip key={index}>
                                  <TooltipTrigger>
                                    <Badge
                                      variant={getSkillBadgeVariant(skill)}
                                      className={getSkillBadgeClass(skill)}
                                    >
                                      {skill}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getLearningResource(skill)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommended Courses Section */}
                      {recommendedCourses.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <h4 className="font-medium">
                                Recommended Courses
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {recommendedCourses.length} course
                                {recommendedCourses.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCoursesExpanded(job.id)}
                              className="h-8 w-8 p-0"
                            >
                              {isCoursesExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            Boost your skills in: {missingSkills.join(", ")}
                          </p>

                          {isCoursesExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {recommendedCourses.map((course, index) => {
                                const courseKey = `${course.id}-${job.title}`;
                                const isEnrolled =
                                  enrolledCourses.has(courseKey);

                                return (
                                  <div
                                    key={index}
                                    className="border rounded-lg p-4 bg-background"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-sm mb-1">
                                          {course.title}
                                        </h5>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {course.description}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${getPlatformColor(
                                            course.platform
                                          )}`}
                                        >
                                          {course.platform}
                                        </Badge>
                                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span>{course.duration}</span>
                                        </div>
                                      </div>

                                      <Button
                                        size="sm"
                                        variant={
                                          isEnrolled ? "outline" : "default"
                                        }
                                        onClick={() =>
                                          handleEnrollCourse(course, job.title)
                                        }
                                        className="h-8 text-xs"
                                        disabled={isEnrolled}
                                      >
                                        {isEnrolled ? (
                                          "Enrolled"
                                        ) : (
                                          <>
                                            Enroll Now
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                          </>
                                        )}
                                      </Button>
                                    </div>

                                    <div className="mt-2 pt-2 border-t">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        For: {course.skill}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ... keep existing code (Requirements section and action buttons) */}
                      <div>
                        <h4 className="font-medium mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
                        <div className="flex space-x-2">
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

        {/* ... keep existing code (all dialogs) */}
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
    </TooltipProvider>
  );
}
