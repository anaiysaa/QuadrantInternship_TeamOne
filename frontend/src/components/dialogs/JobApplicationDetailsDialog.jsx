import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function JobApplicationDetailsDialog({ applicationId, open, onOpenChange }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!applicationId || !open) return;
    fetch(`/resume/applications/details/${applicationId}`)
      .then((res) => res.json())
      .then((data) => setDetails(data))
      .catch((err) => console.error("Error fetching details:", err));
  }, [applicationId, open]);

  if (!details) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {details.title || "Job Details"}
          </DialogTitle>
          <Badge
            variant={
              details.status === "Interview Scheduled" ? "warning" : "secondary"
            }
          >
            {details.status || "Applied"}
          </Badge>
        </DialogHeader>

        <div className="space-y-5">
          {/* Applied Date */}
          <p className="text-sm text-muted-foreground">
            Applied: {details.appliedDate || "N/A"}
          </p>

          {/* Position Details */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Position Details</h3>
            <p><strong>Department:</strong> {details.department || "N/A"}</p>
            <p><strong>Location:</strong> {details.location || "N/A"}</p>
            <p><strong>Employment Type:</strong> {details.jobType || "N/A"}</p>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
            <p>{details.jobDescription || "No description provided."}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Mandatory Skills</h3>
            {details.mandatorySkills ? (
              <ul className="list-disc pl-5">
                {details.mandatorySkills.split(",").map((skill, idx) => (
                  <li key={idx}>{skill.trim()}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No mandatory skills listed.</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Optional Skills</h3>
            {details.optionalSkills ? (
              <ul className="list-disc pl-5">
                {details.optionalSkills.split(",").map((skill, idx) => (
                  <li key={idx}>{skill.trim()}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No optional skills listed.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
