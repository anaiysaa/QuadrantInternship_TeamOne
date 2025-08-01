import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function EditJobDialog({ job, open, onOpenChange, onSave }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    level: '',
    status: '',
    closingDate: '',
    hiringManager: '',
    description: '',
    requirements: '',
    optionalSkills: '',
    mandatorySkills: '',
    certifications: ''
  });

  const toMultilineText = (val) => {
    if (Array.isArray(val)) return val.join('\n');
    if (typeof val === 'string') return val;
    return '';
  };

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: job.department || '',
        location: job.location || '',
        type: job.type || '',
        level: job.level || '',
        status: job.status || '',
        closingDate: job.closingDate || '',
        hiringManager: job.hiringManager || '',
        description: job.description || '',
        requirements: toMultilineText(job.requirements),
        optionalSkills: toMultilineText(job.optionalSkills),
        mandatorySkills: toMultilineText(job.mandatorySkills),
        certifications: toMultilineText(job.certifications),
      });
    }
  }, [job]);

  const handleSave = () => {
    const updatedJob = {
      ...job,
      ...formData,
      requirements: formData.requirements.split('\n').map(s => s.trim()).filter(Boolean),
      optionalSkills: formData.optionalSkills.split('\n').map(s => s.trim()).filter(Boolean),
      mandatorySkills: formData.mandatorySkills.split('\n').map(s => s.trim()).filter(Boolean),
      certifications: formData.certifications
    };

    fetch(`/api/internal-jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update job');
        return res.json();
      })
      .then(() => {
        toast({
          title: 'Job Updated',
          description: `${formData.title} has been updated successfully.`
        });
        onSave(updatedJob);
        onOpenChange(false);
      })
      .catch(err => {
        toast({
          title: 'Update Failed',
          description: err.message
        });
      });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting - {job.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Employment Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry-level">Entry-level</SelectItem>
                  <SelectItem value="Mid-level">Mid-level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="closingDate">Closing Date</Label>
              <Input
                id="closingDate"
                type="date"
                value={formData.closingDate}
                onChange={(e) => handleInputChange('closingDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hiringManager">Hiring Manager</Label>
            <Input
              id="hiringManager"
              value={formData.hiringManager}
              onChange={(e) => handleInputChange('hiringManager', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter job description..."
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Enter requirements, one per line..."
            />
          </div>

          <div>
            <Label htmlFor="optionalSkills">Optional Skills (one per line)</Label>
            <Textarea
              id="optionalSkills"
              rows={3}
              value={formData.optionalSkills}
              onChange={(e) => handleInputChange('optionalSkills', e.target.value)}
              placeholder="Enter optional skills, one per line..."
            />
          </div>

          <div>
            <Label htmlFor="mandatorySkills">Mandatory Skills (one per line)</Label>
            <Textarea
              id="mandatorySkills"
              rows={3}
              value={formData.mandatorySkills}
              onChange={(e) => handleInputChange('mandatorySkills', e.target.value)}
              placeholder="Enter mandatory skills, one per line..."
            />
          </div>

          <div>
            <Label htmlFor="certifications">Recommended Certifications</Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              placeholder="E.g. Azure DevOps, PMP"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}