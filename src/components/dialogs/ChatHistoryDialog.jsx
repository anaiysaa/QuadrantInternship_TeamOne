
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Clock, User, MessageSquare } from 'lucide-react';

export function ChatHistoryDialog({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const chatHistory = [
    {
      id: 'hist-001',
      employee: 'John Doe',
      department: 'Engineering',
      issue: 'Login problems',
      status: 'Resolved',
      startTime: '2024-02-12T09:30:00',
      endTime: '2024-02-12T10:15:00',
      duration: '45 min',
      priority: 'High',
      lastMessage: 'Thank you, the issue is resolved now.'
    },
    {
      id: 'hist-002',
      employee: 'Sarah Johnson',
      department: 'Sales',
      issue: 'Printer not working',
      status: 'Resolved',
      startTime: '2024-02-11T14:20:00',
      endTime: '2024-02-11T14:45:00',
      duration: '25 min',
      priority: 'Medium',
      lastMessage: 'Perfect, printer is working again.'
    },
    {
      id: 'hist-003',
      employee: 'Mike Wilson',
      department: 'Marketing',
      issue: 'Software installation',
      status: 'Escalated',
      startTime: '2024-02-11T11:00:00',
      endTime: '2024-02-11T11:30:00',
      duration: '30 min',
      priority: 'Low',
      lastMessage: 'Escalated to senior tech team.'
    },
    {
      id: 'hist-004',
      employee: 'Lisa Brown',
      department: 'Design',
      issue: 'Network connectivity',
      status: 'Resolved',
      startTime: '2024-02-10T16:15:00',
      endTime: '2024-02-10T16:40:00',
      duration: '25 min',
      priority: 'High',
      lastMessage: 'Network issue fixed, connection stable.'
    }
  ];

  const filteredChats = chatHistory.filter(chat => {
    const matchesSearch = chat.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || chat.status.toLowerCase() === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <Badge variant="outline" className="text-success border-success">Resolved</Badge>;
      case 'Escalated':
        return <Badge variant="outline" className="text-warning border-warning">Escalated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-success border-success">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Chat History</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, issue, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('resolved')}
              >
                Resolved
              </Button>
              <Button
                variant={selectedFilter === 'escalated' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('escalated')}
              >
                Escalated
              </Button>
            </div>
          </div>

          {/* Chat History List */}
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{chat.employee}</p>
                        <p className="text-sm text-muted-foreground">{chat.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(chat.priority)}
                      {getStatusBadge(chat.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Issue</p>
                      <p className="text-sm">{chat.issue}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm">{chat.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>"{chat.lastMessage}"</span>
                    </div>
                    <span>{new Date(chat.startTime).toLocaleDateString()} {new Date(chat.startTime).toLocaleTimeString()}</span>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Full Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredChats.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No chat history found matching your criteria.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
