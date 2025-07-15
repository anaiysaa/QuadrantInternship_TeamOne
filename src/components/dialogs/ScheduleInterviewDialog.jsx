
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Users, Video } from 'lucide-react';

export function ScheduleInterviewDialog({ application, open, onOpenChange, onSchedule }) {
  const { toast } = useToast();
  const [interviewData, setInterviewData] = useState({
    type: 'video',
    date: '',
    time: '',
    duration: '60',
    interviewers: '',
    location: '',
    agenda: '',
    notes: ''
  });

  const handleSchedule = () => {
    const scheduledInterview = {
      ...application,
      interview: interviewData,
      status: 'Interview Scheduled',
      stage: `${interviewData.type === 'video' ? 'Video' : 'In-person'} Interview - ${new Date(interviewData.date).toLocaleDateString()}`
    };
    
    onSchedule(scheduledInterview);
    toast({
      title: "Interview Scheduled",
      description: `Interview scheduled for ${application.candidateName} on ${new Date(interviewData.date).toLocaleDateString()} at ${interviewData.time}.`,
    });
    onOpenChange(false);
  };

  const handleInputChange = (field, value) => {
    setInterviewData(prev => ({ ...prev, [field]: value }));
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview - {application.candidateName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold">{application.candidateName}</h3>
            <p className="text-sm text-muted-foreground">{application.email}</p>
            <p className="text-sm text-muted-foreground">Position: {application.jobTitle}</p>
          </div>

          {/* Interview Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Interview Type</Label>
              <Select value={interviewData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4" />
                      <span>Video Call</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center space-x-2">
                      <span>📞</span>
                      <span>Phone Call</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-person">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>In-Person</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={interviewData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="interviewers">Interviewers (email addresses, comma separated)</Label>
              <Input
                id="interviewers"
                value={interviewData.interviewers}
                onChange={(e) => handleInputChange('interviewers', e.target.value)}
                placeholder="john@company.com, sarah@company.com"
              />
            </div>

            {(interviewData.type === 'in-person' || interviewData.type === 'video') && (
              <div>
                <Label htmlFor="location">
                  {interviewData.type === 'video' ? 'Meeting Link/Platform' : 'Location'}
                </Label>
                <Input
                  id="location"
                  value={interviewData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={
                    interviewData.type === 'video' 
                      ? 'https://zoom.us/j/... or Google Meet link'
                      : 'Conference Room A, 2nd Floor'
                  }
                />
              </div>
            )}

            <div>
              <Label htmlFor="agenda">Interview Agenda</Label>
              <Textarea
                id="agenda"
                rows={3}
                value={interviewData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                placeholder="- Introduction (5 min)&#10;- Technical discussion (30 min)&#10;- Q&A (15 min)&#10;- Next steps (10 min)"
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={interviewData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions or notes for the interview..."
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Interview Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{interviewData.date && new Date(interviewData.date).toLocaleDateString()} at {interviewData.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{interviewData.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                {interviewData.type === 'video' && <Video className="w-4 h-4" />}
                {interviewData.type === 'in-person' && <Users className="w-4 h-4" />}
                <span className="capitalize">{interviewData.type.replace('-', ' ')} interview</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!interviewData.date || !interviewData.time}>
            Schedule Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
