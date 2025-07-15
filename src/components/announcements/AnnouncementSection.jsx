
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, ExternalLink, Pin } from 'lucide-react';

export function AnnouncementSection() {
  const announcements = [
    {
      id: 1,
      title: 'Holiday Office Closure',
      content: 'The office will be closed from December 25th - January 2nd. Remote work policies remain in effect.',
      type: 'important',
      date: '2024-12-15',
      isPinned: true,
      author: 'HR Department',
      category: 'Policy'
    },
    {
      id: 2,
      title: 'New Employee Benefits Package',
      content: 'Enhanced healthcare coverage and wellness programs are now available. Review your options in the HR portal.',
      type: 'announcement',
      date: '2024-12-10',
      isPinned: false,
      author: 'Benefits Team',
      category: 'Benefits',
      hasLink: true
    },
    {
      id: 3,
      title: 'Quarterly All-Hands Meeting',
      content: 'Join us for the Q4 review and Q1 planning session on December 20th at 2:00 PM in the main conference room.',
      type: 'event',
      date: '2024-12-08',
      isPinned: false,
      author: 'Executive Team',
      category: 'Meeting'
    },
    {
      id: 4,
      title: 'Security Update Required',
      content: 'Please update your passwords and enable two-factor authentication by December 18th.',
      type: 'urgent',
      date: '2024-12-05',
      isPinned: true,
      author: 'IT Security',
      category: 'Security'
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'important': return 'bg-warning text-warning-foreground';
      case 'event': return 'bg-primary text-primary-foreground';
      case 'announcement': 
      default: return 'bg-accent text-accent-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return <Bell className="w-4 h-4" />;
      case 'important': return <Pin className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  // Sort announcements: pinned first, then by date (newest first)
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span className="font-medium">Latest Updates</span>
        </div>
        <Badge variant="outline">{announcements.length} Active</Badge>
      </div>
      
      {sortedAnnouncements.slice(0, 4).map((announcement) => (
        <div 
          key={announcement.id} 
          className={`p-4 rounded-lg border transition-colors hover:bg-accent/50 ${
            announcement.isPinned ? 'bg-accent/30 border-primary/20' : 'bg-background'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {announcement.isPinned && (
                <Pin className="w-4 h-4 text-primary" />
              )}
              <Badge className={getTypeColor(announcement.type)} size="sm">
                {getTypeIcon(announcement.type)}
                <span className="ml-1 capitalize">{announcement.type}</span>
              </Badge>
              <Badge variant="outline" size="sm">{announcement.category}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(announcement.date).toLocaleDateString()}
            </span>
          </div>
          
          <h4 className="font-medium mb-2">{announcement.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              By {announcement.author}
            </span>
            <div className="flex space-x-2">
              {announcement.hasLink && (
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Learn More
                </Button>
              )}
              <Button size="sm" variant="ghost">View Details</Button>
            </div>
          </div>
        </div>
      ))}
      
      {announcements.length > 4 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm">
            View All Announcements ({announcements.length - 4} more)
          </Button>
        </div>
      )}
    </div>
  );
}
