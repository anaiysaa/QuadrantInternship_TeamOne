
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function PostJobDialog({ open, onOpenChange }) {
  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    level: '',
    description: '',
    requirements: '',
    hiringManager: ''
  });
  const [closingDate, setClosingDate] = useState();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const payload = {
    title: jobData.title,
    department: jobData.department,
    location: jobData.location,
    type: jobData.type,
    level: jobData.level, // not used in DB, but keeping for future
    description: jobData.description,
    mandatorySkills: jobData.requirements
  .split('\n')
  .filter(line => line.trim() !== '')
  .join(','),

    optionalSkills: '',
    certifications: '',
    hiringManager: jobData.hiringManager,
    closingDate: closingDate ? new Date(closingDate).toISOString() : null,
  };

  try {
    const res = await fetch('/api/post-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to post job');

    toast({
      title: "Job Posted",
      description: `${payload.title} has been posted successfully.`,
    });

    setJobData({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      level: '',
      description: '',
      requirements: '',
      hiringManager: ''
    });
    setClosingDate(undefined);
    onOpenChange(false);
  } catch (err) {
    toast({ title: 'Error', description: err.message });
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={jobData.title}
                onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-dept">Department</Label>
              <Select value={jobData.department} onValueChange={(value) => setJobData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-location">Location</Label>
              <Input
                id="job-location"
                value={jobData.location}
                onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Remote, New York, NY"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-type">Employment Type</Label>
              <Select value={jobData.type} onValueChange={(value) => setJobData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-level">Level</Label>
              <Select value={jobData.level} onValueChange={(value) => setJobData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry-level">Entry-level</SelectItem>
                  <SelectItem value="Mid-level">Mid-level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hiring-manager">Hiring Manager</Label>
              <Input
                id="hiring-manager"
                value={jobData.hiringManager}
                onChange={(e) => setJobData(prev => ({ ...prev, hiringManager: e.target.value }))}
                placeholder="e.g., Sarah Johnson"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Application Closing Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {closingDate ? format(closingDate, 'PPP') : 'Select closing date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={closingDate}
                    onSelect={setClosingDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-desc">Job Description</Label>
            <Textarea
              id="job-desc"
              value={jobData.description}
              onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed job description..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-req">Requirements</Label>
            <Textarea
              id="job-req"
              value={jobData.requirements}
              onChange={(e) => setJobData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Job requirements (one per line)..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
