
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

export function EditResumeDialog({ open, onOpenChange, resumeData, onSave }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    summary: resumeData?.summary || '',
    experience: resumeData?.experience || [],
    education: resumeData?.education || [],
    skills: resumeData?.skills || []
  });
  const [newSkill, setNewSkill] = useState('');

  const handleSave = () => {
    onSave(formData);
    toast({
      title: "Resume Updated",
      description: "Your resume has been saved successfully.",
    });
    onOpenChange(false);
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', period: '', description: '' }]
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Professional Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Enter your professional summary"
              rows={4}
            />
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Button onClick={addExperience} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>
            
            {formData.experience.map((exp, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Experience {index + 1}</h4>
                  <Button 
                    onClick={() => removeExperience(index)}
                    size="sm" 
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      placeholder="Senior Software Developer"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div>
                  <Label>Period</Label>
                  <Input
                    value={exp.period}
                    onChange={(e) => updateExperience(index, 'period', e.target.value)}
                    placeholder="2022 - Present"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    placeholder="Describe your role and achievements"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Education</h3>
              <Button onClick={addEducation} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Education {index + 1}</h4>
                  <Button 
                    onClick={() => removeEducation(index)}
                    size="sm" 
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div>
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="University Name"
                    />
                  </div>
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    placeholder="2019"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skills</h3>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                  <Button
                    onClick={() => removeSkill(skill)}
                    size="sm"
                    variant="ghost"
                    className="ml-2 h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Resume
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
