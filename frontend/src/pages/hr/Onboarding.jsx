import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { AssignChecklistDialog } from "@/components/dialogs/AssignChecklistDialog";
import { CreateChecklistDialog } from '@/components/dialogs/CreateChecklistDialog';
import { AddNewHireDialog } from '@/components/dialogs/AddNewHireDialog';
import { ViewOnboardingDialog } from '@/components/dialogs/ViewOnboardingDialog';
import { ManageOnboardingDialog } from '@/components/dialogs/ManageOnboardingDialog';
import { OnboardingProgressDialog } from '@/components/dialogs/OnboardingProgressDialog';
import { OnboardingTemplatesDialog } from '@/components/dialogs/OnboardingTemplatesDialog';
import { OnboardingSettingsDialog } from '@/components/dialogs/OnboardingSettingsDialog';

export default function Onboarding() {
  const [searchTerm, setSearchTerm] = useState('');
  const [onboardingCandidates, setOnboardingCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog States
  const [showCreateChecklistDialog, setShowCreateChecklistDialog] = useState(false);
  const [showAddHireDialog, setShowAddHireDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Assign Checklist State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedHireId, setSelectedHireId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const { toast } = useToast();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/onboarding/newhires');
      if (!res.ok) throw new Error('Failed to fetch candidates');
      setOnboardingCandidates(await res.json());
    } catch (err) {
      toast({ title: 'Error', description: err.message });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = onboardingCandidates
    .filter(c => c.onboardingStatus !== 'Completed')
    .filter(c =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.onboardingStatus?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Started': return <Badge variant="outline">Not Started</Badge>;
      case 'Pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'In Progress': return <Badge variant="outline" className="text-blue-600 border-blue-600">In Progress</Badge>;
      case 'Completed': return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      default: return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  // ✅ Dashboard Stats
  const stats = [
    { title: 'Total New Hires', value: onboardingCandidates.length, color: 'bg-blue-500' },
    { title: 'In Progress', value: onboardingCandidates.filter(c => c.onboardingStatus === 'In Progress').length, color: 'bg-yellow-500' },
    { title: 'Completed', value: onboardingCandidates.filter(c => c.onboardingStatus === 'Completed').length, color: 'bg-green-500' },
    { title: 'Starting Soon', value: onboardingCandidates.filter(c => ['Pending', 'Not Started'].includes(c.onboardingStatus)).length, color: 'bg-purple-500' },
  ];

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (error) return <DashboardLayout><p>Error: {error}</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Onboarding</h1>
            <p className="text-muted-foreground">Manage new employee onboarding</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowAddHireDialog(true)}>Add New Hire</Button>
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ✅ Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search New Hires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by name, role, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ✅ Main Table */}
        <Card>
          <CardHeader>
            <CardTitle>All New Hires ({filteredCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checklist Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                      No new hires found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const completed = candidate.checklistTasksStatus?.filter(t => t.completed).length || 0;
                    const total = candidate.checklistTasksStatus?.length || 0;
                    const percent = total ? Math.round((completed / total) * 100) : 0;

                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </TableCell>
                        <TableCell>{candidate.role}</TableCell>
                        <TableCell>{candidate.department || "-"}</TableCell>
                        <TableCell>{candidate.dateJoined ? new Date(candidate.dateJoined).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{getStatusBadge(candidate.onboardingStatus)}</TableCell>
                        <TableCell>
                          {total > 0 ? `${completed}/${total} (${percent}%)` : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedCandidate(candidate); setShowViewDialog(true); }}>View</Button>
                            <Button size="sm" variant="default" onClick={() => { setSelectedCandidate(candidate); setShowManageDialog(true); }}>Manage</Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-white"
                              onClick={() => {
                                setSelectedHireId(candidate.id);
                                setAssignDialogOpen(true);
                              }}
                            >
                              Assign Checklist
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Assign Checklist Dialog */}
      <AssignChecklistDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        hireId={selectedHireId}
        onAssigned={fetchCandidates}
      />

      {/* Other Dialogs */}
      <CreateChecklistDialog open={showCreateChecklistDialog} onOpenChange={setShowCreateChecklistDialog} />
      <AddNewHireDialog open={showAddHireDialog} onOpenChange={setShowAddHireDialog} fetchCandidates={fetchCandidates} />
      <ViewOnboardingDialog open={showViewDialog} onOpenChange={setShowViewDialog} candidate={selectedCandidate} refreshCandidates={fetchCandidates} />
      <ManageOnboardingDialog open={showManageDialog} onOpenChange={setShowManageDialog} candidate={selectedCandidate} refreshCandidates={fetchCandidates} />
      <OnboardingProgressDialog open={showProgressDialog} onOpenChange={setShowProgressDialog} />
      <OnboardingTemplatesDialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog} />
      <OnboardingSettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </DashboardLayout>
  );
}
