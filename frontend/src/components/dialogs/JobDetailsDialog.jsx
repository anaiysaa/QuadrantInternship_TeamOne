import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function JobDetailsDialog({ job, open, onOpenChange }) {
  if (!job) return null;

  const mandatorySkills =
    job.mandatorySkills?.split(",").map((s) => s.trim()) || [];
  const optionalSkills =
    job.optionalSkills?.split(",").map((s) => s.trim()) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {job.title || job.JobTitle || "Job Details"}
          </DialogTitle>
          <Badge variant="secondary">
            {job.department || job.Department || "General"}
          </Badge>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Info */}
          <div>
            <h3 className="font-semibold">Position Details</h3>
            <p>
              <strong>Department:</strong>{" "}
              {job.department || job.Department || "N/A"}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {job.location || job.Location || "N/A"}
            </p>
            <p>
              <strong>Employment Type:</strong>{" "}
              {job.jobType || job.JobType || "N/A"}
            </p>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="font-semibold">Job Description</h3>
            <p className="text-sm text-muted-foreground">
              {job.jobDescription || job.JobDescription || "No description."}
            </p>
          </div>

          {/* Mandatory Skills */}
          <div>
            <h3 className="font-semibold">Mandatory Skills</h3>
            {mandatorySkills.length > 0 ? (
              <ul className="list-disc pl-5">
                {mandatorySkills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No mandatory skills listed.
              </p>
            )}
          </div>

          {/* Optional Skills */}
          <div>
            <h3 className="font-semibold">Optional Skills</h3>
            {optionalSkills.length > 0 ? (
              <ul className="list-disc pl-5">
                {optionalSkills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No optional skills listed.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
