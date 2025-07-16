import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import { EditProfileDialog } from '@/components/dialogs/EditProfileDialog';
import { EditSkillsDialog } from '@/components/dialogs/EditSkillsDialog';
import { EditResumeDialog } from '@/components/dialogs/EditResumeDialog';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editSkillsOpen, setEditSkillsOpen] = useState(false);
  const [editResumeOpen, setEditResumeOpen] = useState(false);
  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'hr': return 'bg-success text-success-foreground';
      case 'it': return 'bg-warning text-warning-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Not provided';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const extendedUser = {
    ...user,
    nationality: user?.nationality || 'United States',
    gender: user?.gender || 'Male',
    birthDate: user?.birthDate || '1990-05-15',
    status: user?.status || 'active',
    hireType: user?.hireType || 'Full-time',
    education: user?.education || {
      level: 'Bachelor\'s Degree',
      degree: 'Computer Science',
      institution: 'State University',
      graduationYear: '2019',
      gpa: '3.8'
    },
    address: user?.address || {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States'
    }
  };

  const certifications = [
    {
      id: 1,
      name: 'Cybersecurity Fundamentals',
      issuer: 'Company LMS',
      date: '2024-02-10',
      status: 'Active',
      credentialId: 'CSF-2024-001'
    },
    {
      id: 2,
      name: 'Advanced Excel Training',
      issuer: 'Company LMS',
      date: '2024-01-15',
      status: 'Active',
      credentialId: 'AET-2024-002'
    },
    {
      id: 3,
      name: 'Project Management Basics',
      issuer: 'Company LMS',
      date: '2023-12-20',
      status: 'Active',
      credentialId: 'PMB-2023-045'
    }
  ];

  const [resumeData, setResumeData] = useState({
    summary: "Dedicated professional with 5+ years of experience in software development and team leadership. Skilled in multiple programming languages and frameworks.",
    experience: [
      {
        title: "Senior Software Developer",
        company: "Current Company",
        period: "2022 - Present",
        description: "Lead development team of 5 engineers, architected microservices solutions, improved system performance by 40%"
      },
      {
        title: "Software Developer",
        company: "Previous Company",
        period: "2019 - 2022",
        description: "Developed full-stack applications, collaborated with cross-functional teams, mentored junior developers"
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "State University",
        year: "2019"
      }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Git"]
  });

  const userSkills = user?.skills || ["JavaScript", "React", "Node.js", "Python", "Project Management", "Team Leadership", "Agile", "SQL"];

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'professional', label: 'Professional Info', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '🎯' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
    { id: 'resume', label: 'Resume', icon: '📄' },
  ];

  const handleDownloadPDF = () => {
    const resumeContent = `
      RESUME - ${user?.name}
      
      PROFESSIONAL SUMMARY
      ${resumeData.summary}
      
      WORK EXPERIENCE
      ${resumeData.experience.map(exp => `
        ${exp.title} at ${exp.company} (${exp.period})
        ${exp.description}
      `).join('\n')}
      
      EDUCATION
      ${resumeData.education.map(edu => `
        ${edu.degree}
        ${edu.institution} - ${edu.year}
      `).join('\n')}
      
      SKILLS
      ${resumeData.skills.join(', ')}
    `;

    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name || 'resume'}_resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Resume Downloaded",
      description: "Your resume has been downloaded as a text file.",
    });
  };

  const handleUploadResume = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Basic file validation
      const validTypes = ['application/pdf', 'text/plain', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, TXT, or Word document.",
          variant: "destructive",
        });
        return;
      }

      // In a real application, you would handle the file upload to a server here
      // This is a mock implementation
      toast({
        title: "Resume Uploaded",
        description: `Successfully uploaded ${file.name}`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveResume = (updatedResumeData) => {
    setResumeData(updatedResumeData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xl">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge className={getRoleColor(user?.role || '')}>
                      {user?.role?.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(extendedUser.status)}>
                      {extendedUser.status?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-sm">{user?.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{user?.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manager</label>
                  <p className="text-sm">{user?.manager || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                  <p className="text-sm">{user?.joinDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type of Hire</label>
                  <p className="text-sm">{extendedUser.hireType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                  <p className="text-sm">{extendedUser.nationality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-sm">{extendedUser.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Age</label>
                  <p className="text-sm">{calculateAge(extendedUser.birthDate)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Quick Stats</h4>
                <div className="grid gap-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <span className="text-sm">Skills</span>
                    <span className="text-sm font-bold">{userSkills.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <span className="text-sm">Certifications</span>
                    <span className="text-sm font-bold">{certifications.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <span className="text-sm">Leave Balance</span>
                    <span className="text-sm font-bold">18 days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <span className="text-sm">Performance</span>
                    <span className="text-sm font-bold">95%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex space-x-4 border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-sm mt-1">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm mt-1">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm mt-1">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="text-sm mt-1">{user?.location || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p className="text-sm mt-1">{extendedUser.birthDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                      <p className="text-sm mt-1">{extendedUser.nationality}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Home Address</label>
                    <div className="text-sm mt-1 space-y-1">
                      <p>{extendedUser.address.street}</p>
                      <p>{extendedUser.address.city}, {extendedUser.address.state} {extendedUser.address.zipCode}</p>
                      <p>{extendedUser.address.country}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {user?.bio || 'No bio provided yet. Click edit to add your professional summary.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Education Level</label>
                      <p className="text-sm mt-1">{extendedUser.education.level}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Degree</label>
                      <p className="text-sm mt-1">{extendedUser.education.degree}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Institution</label>
                      <p className="text-sm mt-1">{extendedUser.education.institution}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                      <p className="text-sm mt-1">{extendedUser.education.graduationYear}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">GPA</label>
                      <p className="text-sm mt-1">{extendedUser.education.gpa}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Employment Status</label>
                      <Badge className={getStatusColor(extendedUser.status)}>
                        {extendedUser.status?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Work Information</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Position</label>
                        <p className="text-sm mt-1">{user?.role || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p className="text-sm mt-1">{user?.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Hire Type</label>
                        <p className="text-sm mt-1">{extendedUser.hireType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <p className="text-sm mt-1">{user?.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">My Skills</h3>
                    <Button onClick={() => setEditSkillsOpen(true)} size="sm">
                      Edit Skills
                    </Button>
                  </div>
                  
                  {userSkills.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No skills added yet.</p>
                      <Button onClick={() => setEditSkillsOpen(true)}>
                        Add Your First Skill
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-3">
                        <div className="flex flex-wrap gap-2">
                          {userSkills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>{userSkills.length}</strong> skills total
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'certifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">My Certifications</h3>
                    <Badge variant="outline">{certifications.length} Active</Badge>
                  </div>
                  <div className="grid gap-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{cert.name}</h4>
                          <Badge variant="default" className="bg-success text-success-foreground">
                            {cert.status}
                          </Badge>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Issued by:</span>
                            <span>{cert.issuer}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span>{cert.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Credential ID:</span>
                            <span className="font-mono">{cert.credentialId}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button variant="outline" size="sm">View Certificate</Button>
                          <Button variant="outline" size="sm">Download PDF</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resume' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">My Resume</h3>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleUploadResume}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current.click()}
                      >
                        Upload Resume
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditResumeOpen(true)}>
                        Edit Resume
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Professional Summary</h4>
                      <p className="text-sm text-muted-foreground">{resumeData.summary}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Work Experience</h4>
                      <div className="space-y-4">
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-medium">{exp.title}</h5>
                              <span className="text-sm text-muted-foreground">{exp.period}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                            <p className="text-sm">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Education</h4>
                      <div className="space-y-2">
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <EditProfileDialog 
          open={editProfileOpen} 
          onOpenChange={setEditProfileOpen} 
        />
        
        <EditSkillsDialog 
          open={editSkillsOpen} 
          onOpenChange={setEditSkillsOpen} 
        />

        <EditResumeDialog 
          open={editResumeOpen} 
          onOpenChange={setEditResumeOpen}
          resumeData={resumeData}
          onSave={handleSaveResume}
        />
      </div>
    </DashboardLayout>
  );
}