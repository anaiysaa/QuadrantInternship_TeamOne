
import { useEffect, useState } from "react";
import axios from "axios";
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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  BookOpen,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext"; // ✅ Moved to top

export default function CareerPortal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobMatches, setJobMatches] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showJobApplication, setShowJobApplication] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const { toast } = useToast();

  const { user } = useAuth(); // ✅ useAuth to get logged-in user
  const employeeId = user?.employeeId;

  useEffect(() => {
    if (!employeeId) return;
  
    axios
      .get(`/job/job-matches/${employeeId}`)
      .then((res) => {
        setJobMatches(res.data.matches || []);
        setEmployeeInfo(res.data.employee || {});
      })
      .catch((err) => {
        console.error("Error fetching job matches", err);
        toast({
          title: "Error",
          description: "Failed to load job matches from server.",
          variant: "destructive",
        });
      });
  }, [employeeId]);
  
  const toggleCoursesExpanded = (jobId) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(jobId)) newExpanded.delete(jobId);
    else newExpanded.add(jobId);
    setExpandedCourses(newExpanded);
  };

  const handleEnrollCourse = (course, jobTitle) => {
    const courseKey = `${course.name}-${jobTitle}`;
    if (enrolledCourses.has(courseKey)) return;

    const updated = new Set(enrolledCourses);
    updated.add(courseKey);
    setEnrolledCourses(updated);

    toast({
      title: "Enrolled",
      description: `You’ve shown interest in "${course.name}"`,
    });

    if (course.url.startsWith("http")) {
      window.open(course.url, "_blank");
    }
  };

  const getMatchStatusText = (percent) => {
    if (percent >= 80) return "Excellent Match";
    if (percent >= 60) return "Good Match";
    if (percent >= 40) return "Partial Match";
    return "Skills Gap";
  };

  const getMatchStatusColor = (percent) => {
    if (percent >= 80) return "text-success";
    if (percent >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Career Portal</h1>
          <p className="text-muted-foreground">
            Welcome {employeeInfo?.name || "Employee"}! Browse job matches below.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Matched Jobs ({jobMatches.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {jobMatches.map((job) => {
                const matchPercentage = job.match_percent;
                const missingSkills = job.skills_missing;
                const recommendedCourses = job.recommended_courses || [];
                const isCoursesExpanded = expandedCourses.has(job.job_id);

                return (
                  <div key={job.job_id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Required Degree: {job.degree_required}
                        </p>
                      </div>
                      <Button onClick={() => setShowJobApplication(true)}>Apply Now</Button>
                    </div>

                    {/* Skill Match */}
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">Skill Match</span>
                      <span className="text-sm font-bold">{matchPercentage}%</span>
                    </div>

                    <Progress value={matchPercentage} className="h-2" />

                    {/* Skills Missing & Courses */}
                    {recommendedCourses.length > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-2 items-center">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-medium">Recommended Courses</h4>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleCoursesExpanded(job.job_id)}
                          >
                            {isCoursesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          Missing skills: {missingSkills.join(", ")}
                        </p>

                        {isCoursesExpanded && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendedCourses.map((course, i) => (
                              <div key={i} className="border rounded-lg p-4">
                                <h5 className="font-medium text-sm">{course.name}</h5>
                                <p className="text-xs text-muted-foreground">{course.skill}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => handleEnrollCourse(course, job.title)}
                                >
                                  Enroll Now <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Dialogs */}
          <JobDetailsDialog job={selectedJob} open={showJobDetails} onOpenChange={setShowJobDetails} />
          <JobApplicationDialog job={selectedJob} open={showJobApplication} onOpenChange={setShowJobApplication} />
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}