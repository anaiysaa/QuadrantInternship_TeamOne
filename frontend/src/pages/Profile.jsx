import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EditProfileDialog } from "@/components/dialogs/EditProfileDialog";
import { EditSkillsDialog } from "@/components/dialogs/EditSkillsDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EditProfessionalDialog } from "@/components/dialogs/EditProfessionalDialog";
import { EditEducationDialog } from "@/components/dialogs/EditEducationDialog";

export default function Profile() {
  const { user } = useAuth();
  const employeeId = user?.employeeId;

  const [activeTab, setActiveTab] = useState("personal");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editSkillsOpen, setEditSkillsOpen] = useState(false);
  const { toast } = useToast();

  // Employee state
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [editProfessionalOpen, setEditProfessionalOpen] = useState(false);
  const [editEducationOpen, setEditEducationOpen] = useState(false);
  
  
  // Fetch employee data
  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/resume/employees/${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setEmployee(data);
        setLoading(false);
      })
      .catch((err) => {
        toast({
          title: "Failed to load employee",
          description: err.message,
          variant: "destructive",
        });
        setLoading(false);
      });
  }, [employeeId, toast]);
  
  // 🔹 Fetch assigned assets
useEffect(() => {
  if (!employeeId) return;

  fetch(`/resume/employees/${employeeId}/assets`)
    .then((res) => res.json())
    .then((data) => setAssets(data.assets || []))
    .catch((err) => console.error("Error fetching assets:", err));
}, [employeeId]);

  // Resume upload handler
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
  
    try {
      const response = await fetch("/resume/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        toast({
          title: "Resume uploaded!",
          description: "Resume uploaded and parsed successfully.",
          variant: "success",
        });
        // Refresh employee data
        fetch(`/resume/employees/${employeeId}`)
          .then((res) => res.json())
          .then((data) => setEmployee(data));
      } else {
        toast({
          title: "Upload failed.",
          description: "Resume upload failed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred during upload.",
        variant: "destructive",
      });
    }
  };




  // Tabs
  const tabs = [
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "professional", label: "Professional Info", icon: "🎓" },
    { id: "skills", label: "Skills", icon: "🎯" },
    { id: "certifications", label: "Certifications", icon: "🏆" },
    { id: "education", label: "Education", icon: "📚" }, 
    { id: "assets", label: "Assigned Assets", icon: "💻" },

  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!employee) return <div className="p-8">Employee not found</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">My Profile</h1>
  <div className="flex gap-4">
    <label
      htmlFor="resume-upload"
      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition"
      style={{ marginBottom: 0 }}
    >
      Upload Resume
      <input
        id="resume-upload"
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleResumeUpload}
      />
    </label>
  </div>
</div>


        <div className="grid gap-6 md:grid-cols-3">
          {/* Left: Profile Overview */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={employee.photoUrl} alt={employee.name} />
                  <AvatarFallback className="text-xl">{getInitials(employee.name)}</AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{employee.name}</h3>
                  <p className="text-muted-foreground">{employee.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge>{employee.role}</Badge>
                    <Badge>{employee.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-sm">{employee.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{employee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manager</label>
                  <p className="text-sm">{employee.managerName || "Not assigned"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                  <p className="text-sm">{employee.joinDate || employee.hireDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Tabs */}
          <Card className="md:col-span-2">
            <CardHeader>
            <div className="flex flex-wrap gap-4 border-b overflow-x-auto">
            {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* PERSONAL TAB */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-sm mt-1">{employee.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm mt-1">{employee.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm mt-1">{employee.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-sm mt-1">{employee.campus || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Hire</label>
                      <p className="text-sm mt-1">{employee.hireDate || employee.joinDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p className="text-sm mt-1">{employee.gender || "Not provided"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Home Address</label>
                    <div className="text-sm mt-1 space-y-1">
                      <p>{employee.address || "Not provided"}</p>
                    </div>
                    <div className="mt-4">
                      <Button onClick={() => setEditProfileOpen(true)}>Edit</Button>
                    </div>
                  </div>
                  {/* Add bio or other fields as needed */}
                </div>
              )}

              {/* PROFESSIONAL TAB */}
              {activeTab === "professional" && (
                
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Department</label>
        <p className="text-sm mt-1">{employee.department}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Role</label>
        <p className="text-sm mt-1">{employee.role}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Manager</label>
        <p className="text-sm mt-1">{employee.managerName || "Not assigned"}</p>
      </div>
      
      <div>
        <label className="text-sm font-medium text-muted-foreground">Employment Status</label>
        <p className="text-sm mt-1">{employee.status || "Not provided"}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Paid Leaves Left</label>
        <p className="text-sm mt-1">{employee.paidLeavesLeft ?? "Not provided"}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Years in Company</label>
        <p className="text-sm mt-1">{employee.yearsInCompany ?? "Not provided"}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Team ID</label>
        <p className="text-sm mt-1">{employee.teamId ?? "Not provided"}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Trainings Done</label>
        <p className="text-sm mt-1">{employee.trainingsDone ?? "Not provided"}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Trainings Left</label>
        <p className="text-sm mt-1">{employee.trainingsLeft ?? "Not provided"}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Applied Jobs</label>
        <p className="text-sm mt-1">
          {employee.appliedJobs
            ? Array.isArray(employee.appliedJobs)
              ? employee.appliedJobs.join(", ")
              : employee.appliedJobs
            : "None"}
        </p>
      </div>
      <div className="mt-4">
        <Button onClick={() => setEditProfessionalOpen(true)}>Edit</Button>
      </div>
    </div>
  </div>
)}


              {/* SKILLS TAB */}
              {activeTab === "skills" && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">My Skills</h3>
    {employee.skills && employee.skills.length > 0 ? (
  <div className="flex flex-wrap gap-2">
    {(() => {
      let skillsArray = [];

      if (Array.isArray(employee.skills)) {
        skillsArray = employee.skills;
      } else if (typeof employee.skills === "string") {
        try {
          skillsArray = employee.skills.trim().startsWith("[")
            ? JSON.parse(employee.skills)
            : employee.skills.split(",");
        } catch {
          skillsArray = employee.skills.split(",");
        }
      }

      return skillsArray.map((skill, idx) => (
        <span
          key={idx}
          className="px-4 py-1 rounded-full bg-white border border-black text-black text-base font-medium shadow-sm"
        >
          {typeof skill === "string" ? skill.trim() : String(skill)}
        </span>
      ));
    })()}
  </div>
) : (
  <p>No skills listed.</p>
)}
<div className="mt-4">
<Button onClick={() => setEditSkillsOpen(true)}>Edit</Button>
</div>
  </div>
)}
  

              {/* CERTIFICATIONS TAB */}
              {activeTab === "certifications" && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Certifications</h3>
    {employee.certifications ? (
      <div className="flex flex-wrap gap-2">
        {(() => {
  let certs = [];
  if (employee.certifications) {
    try {
      certs = typeof employee.certifications === "string" 
        ? JSON.parse(employee.certifications) 
        : employee.certifications;
    } catch {
      certs = [];
    }
  }

  return certs.map((cert, idx) => (
    <span
      key={idx}
      className="px-4 py-1 rounded-full bg-white border border-black text-black text-base font-medium shadow-sm"
    >
      {cert.certificationName || String(cert)}
    </span>
  ));
})()}

      </div>
    ) : (
      <p>No certifications listed.</p>
    )}
  </div>
)}

{/* ASSETS TAB */}
{activeTab === "assets" && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Assigned Assets</h3>
    {assets.length === 0 ? (
      <p className="text-muted-foreground">No assets assigned.</p>
    ) : (
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 border-b">
            <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-muted-foreground">
              <div>Asset ID</div>
              <div>Type & Model</div>
              <div>Serial Number</div>
              <div>Status</div>
            </div>
          </div>
          <div className="divide-y">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="grid grid-cols-4 gap-4 p-4 text-sm hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{asset.assetId}</p>
                  <p className="text-xs text-muted-foreground">
                    Assigned: {asset.assignedDate}
                  </p>
                </div>
                <div>
                  <p className="font-medium">{asset.type}</p>
                  <p className="text-muted-foreground">
                    {asset.brand} {asset.model}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {asset.serialNumber}
                  </p>
                </div>
                <div>
                  <Badge
                    className={
                      asset.status === "Active"
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }
                  >
                    {asset.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
)}

{activeTab === "education" && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Education</h3>
    {employee.educationDegree || employee.educationField || employee.educationInstitution || employee.educationYear ? (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Degree</label>
          <p className="text-sm mt-1">{employee.educationDegree || "Not provided"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Field of Study</label>
          <p className="text-sm mt-1">{employee.educationField || "Not provided"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Institution</label>
          <p className="text-sm mt-1">{employee.educationInstitution || "Not provided"}</p>
        </div>
        <div className="mt-4">
          <Button onClick={() => setEditEducationOpen(true)}>Edit</Button>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Year</label>
          <p className="text-sm mt-1">{employee.educationYear || "Not provided"}</p>
        </div>
      </div>
    ) : (
      <p>No education info listed.</p>
    )}
  </div>
)}

</CardContent>
</Card>
</div>
        {/* Dialogs */}
        <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} employeeId={employeeId} onUpdated={() => window.location.reload()} />
<EditProfessionalDialog open={editProfessionalOpen} onOpenChange={setEditProfessionalOpen} employeeId={employeeId} onUpdated={() => window.location.reload()} />
<EditSkillsDialog open={editSkillsOpen} onOpenChange={setEditSkillsOpen} employeeId={employeeId} onUpdated={() => window.location.reload()} />
<EditEducationDialog open={editEducationOpen} onOpenChange={setEditEducationOpen} employeeId={employeeId} onUpdated={() => window.location.reload()} />

      </div>
</DashboardLayout>
);
}