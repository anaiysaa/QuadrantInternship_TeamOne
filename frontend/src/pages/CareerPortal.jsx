import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { JobDetailsDialog } from "@/components/dialogs/JobDetailsDialog";
import { JobApplicationDetailsDialog } from "@/components/dialogs/JobApplicationDetailsDialog";
import { JobApplicationDialog } from "@/components/dialogs/JobApplicationDialog";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

export default function CareerPortal() {
  const [jobMatches, setJobMatches] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [applications, setApplications] = useState([]);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);

  // New state for handling rescind confirmation
  const [showRescindConfirmation, setShowRescindConfirmation] = useState(false);
  const [applicationToRescind, setApplicationToRescind] = useState(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const employeeId = user?.employeeId;

  useEffect(() => {
    if (!employeeId) return;

    axios
      .get(`/job/job-matches/${employeeId}`)
      .then((res) => {
        setJobMatches(res.data.matches || []);
        setEmployeeInfo(res.data.employee || {});
      })
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load job matches",
          variant: "destructive",
        })
      );
  }, [employeeId]);

  useEffect(() => {
    if (!employeeId) return;

    axios
      .get(`/resume/applications/${employeeId}`)
      .then((res) => setApplications(res.data.applications || []))
      .catch(() => console.error("Error fetching applications"));
  }, [employeeId]);

  const handleApply = async (jobId) => {
    try {
      const res = await fetch("/resume/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, employeeId }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Application submitted", variant: "success" });
        window.location.reload();
      } else {
        toast({ title: "Failed to apply", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = async (jobId) => {
    try {
      const res = await fetch(`/resume/jobs/${jobId}`);
      const data = await res.json();
      setSelectedJob(data);
      setShowJobDetails(true);
    } catch (err) {
      console.error("Error fetching job details", err);
    }
  };

  const handleViewApplication = async (applicationId) => {
    try {
      setSelectedApplicationId(applicationId);
      setShowApplicationDetails(true);
    } catch (err) {
      console.error("Error opening application details", err);
    }
  };

  const handleRescindApplication = async (applicationId) => {
    try {
      const res = await fetch(`/api/job-applications/${applicationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success || res.ok) {
        toast({
          title: "Application rescinded",
          description: "Your application has been successfully withdrawn.",
          variant: "success",
        });
        const updatedApplications = applications.filter(
          (app) => app.applicationId !== applicationId
        );
        setApplications(updatedApplications);
      } else {
        toast({
          title: "Failed to rescind application",
          description: data.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error rescinding application:", err);
      toast({
        title: "Error",
        description: "Failed to rescind application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRescindClick = (app) => {
    setApplicationToRescind(app);
    setShowRescindConfirmation(true);
  };

  // ---- FIX: Toggle expand/collapse for recommended courses ----
  const toggleCoursesExpanded = (jobId) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Career Portal</h1>
          <p className="text-muted-foreground">
            Welcome {employeeInfo?.name || "Employee"}! Browse job matches below.
          </p>

          {/* My Applications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications.length === 0 && <p>No applications yet.</p>}
              {applications.map((app) => (
                <div
                  key={app.jobId}
                  className="flex justify-between items-center border p-4 rounded-lg"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{app.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Applied: {app.appliedDate || "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge>{app.status}</Badge>
                    {/* View Application Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleViewApplication(app.applicationId || app.jobId)}
                    >
                      View Application
                    </Button>
                    {/* Rescind Application Button */}
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRescindClick(app)}
                    >
                      Rescind
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Matched Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Matched Jobs ({jobMatches.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {jobMatches.map((job) => {
                const matchPercentage = job.match_percent;
                const missingSkills = job.skills_missing;
                const recommendedCourses = job.recommended_courses || [];
                const isExpanded = expandedCourses.has(job.job_id);

                return (
                  <div
                    key={job.job_id}
                    className="border rounded-lg p-6 flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            fetch(`/resume/jobs/${job.job_id}`)
                              .then((res) => res.json())
                              .then((data) => {
                                setSelectedJob({
                                  title: data.title,
                                  department: data.department,
                                  location: data.location,
                                  jobType: data.jobType,
                                  jobDescription: data.jobDescription,
                                  mandatorySkills: data.mandatorySkills,
                                  optionalSkills: data.optionalSkills,
                                });
                                setShowJobDetails(true);
                              })
                              .catch((err) =>
                                console.error("Error fetching application details:", err)
                              );
                          }}
                        >
                          View Details
                        </Button>

                        <Button onClick={() => handleApply(job.job_id)}>
                          Apply
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">Skill Match</span>
                      <span className="text-sm font-bold">{matchPercentage}%</span>
                    </div>

                    <Progress value={matchPercentage} className="h-2" />

                    {recommendedCourses.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-2 items-center">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-medium">
                              Recommended Courses
                            </h4>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleCoursesExpanded(job.job_id)}
                          >
                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </div>

                        {isExpanded && (
                          <div className="grid gap-4 md:grid-cols-2 transition-all duration-300 ease-in-out">
                            {recommendedCourses.map((course, i) => (
                              <div
                                key={i}
                                className="border rounded-lg p-4 shadow-sm bg-slate-50"
                              >
                                <h5 className="font-medium text-sm">
                                  {course.name}
                                </h5>
                                <p className="text-xs text-muted-foreground">
                                  {course.skill}
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() =>
                                    window.open(course.url, "_blank")
                                  }
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
          <JobDetailsDialog
            job={selectedJob}
            open={showJobDetails}
            onOpenChange={setShowJobDetails}
          />

          <JobApplicationDetailsDialog
            applicationId={selectedApplicationId}
            open={showApplicationDetails}
            onOpenChange={setShowApplicationDetails}
          />

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            open={showRescindConfirmation}
            onOpenChange={setShowRescindConfirmation}
            title="Are you sure?"
            description="Are you sure you want to rescind your application? This action cannot be undone."
            onConfirm={() => {
              if (applicationToRescind) {
                handleRescindApplication(applicationToRescind.applicationId);
                setShowRescindConfirmation(false);
              }
            }}
            onCancel={() => setShowRescindConfirmation(false)}
          />
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
