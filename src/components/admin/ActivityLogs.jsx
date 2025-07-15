
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Search, Download, Filter } from 'lucide-react';

export function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const logs = [
    { id: '1', timestamp: '2024-01-15 14:30:25', user: 'admin@company.com', action: 'User Role Changed', details: 'Changed john.doe role to HR', type: 'admin', severity: 'medium' },
    { id: '2', timestamp: '2024-01-15 14:25:12', user: 'sarah.hr@company.com', action: 'Leave Request Approved', details: 'Approved leave request #LR-2024-001', type: 'hr', severity: 'low' },
    { id: '3', timestamp: '2024-01-15 14:20:45', user: 'admin@company.com', action: 'Portal Settings Updated', details: 'Modified Employee Portal theme', type: 'admin', severity: 'medium' },
    { id: '4', timestamp: '2024-01-15 14:15:33', user: 'mike.it@company.com', action: 'Asset Assigned', details: 'Assigned laptop LP-001 to John Doe', type: 'it', severity: 'low' },
    { id: '5', timestamp: '2024-01-15 14:10:18', user: 'john.employee@company.com', action: 'Login Attempt', details: 'Successful login from 192.168.1.100', type: 'user', severity: 'low' },
    { id: '6', timestamp: '2024-01-15 14:05:42', user: 'admin@company.com', action: 'User Account Created', details: 'Created new user account for jane.smith@company.com', type: 'admin', severity: 'high' },
    { id: '7', timestamp: '2024-01-15 14:00:15', user: 'sarah.hr@company.com', action: 'Employee Data Updated', details: 'Updated employee #EMP-001 contact information', type: 'hr', severity: 'medium' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high': return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      default: return <Badge className="bg-green-100 text-green-800">Low</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'admin': return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'hr': return <Badge className="bg-blue-100 text-blue-800">HR</Badge>;
      case 'it': return <Badge className="bg-green-100 text-green-800">IT</Badge>;
      default: return <Badge className="bg-purple-100 text-purple-800">User</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Logs
        </CardTitle>
        <CardDescription>
          Monitor and audit all system activities and user actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="admin">Admin Actions</SelectItem>
              <SelectItem value="hr">HR Actions</SelectItem>
              <SelectItem value="it">IT Actions</SelectItem>
              <SelectItem value="user">User Actions</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl font-bold text-red-600">12</div>
            <div className="text-sm text-muted-foreground">Admin Actions</div>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-sm text-muted-foreground">HR Actions</div>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-sm text-muted-foreground">IT Actions</div>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">25</div>
            <div className="text-sm text-muted-foreground">User Actions</div>
          </div>
        </div>

        {/* Logs Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                <TableCell className="text-sm">{log.user}</TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>{getTypeBadge(log.type)}</TableCell>
                <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {log.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
