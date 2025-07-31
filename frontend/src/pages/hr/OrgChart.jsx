import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

// Helper: returns first and last initials (or just first if only one word)
const getInitials = (name = '') => {
  const words = name.trim().split(' ');
  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getDepartmentColor = (department) => {
  switch (department) {
    case 'Executive': return 'bg-purple-500';
    case 'Engineering': return 'bg-primary';
    case 'HR': return 'bg-success';
    case 'Marketing': return 'bg-warning';
    case 'Sales': return 'bg-destructive';
    default: return 'bg-secondary';
  }
};

// Build org tree from flat SQL data
function buildOrgTree(employees) {
  if (!employees || employees.length === 0) return null;
  const byId = {};
  employees.forEach(emp => byId[emp.id] = { ...emp, directReports: [] });
  let root = null;
  employees.forEach(emp => {
    if (emp.managerId && byId[emp.managerId]) {
      byId[emp.managerId].directReports.push(byId[emp.id]);
    } else if (!emp.managerId && (!root || emp.department === 'Executive')) {
      root = byId[emp.id];
    }
  });
  return root;
}

export default function OrgChart() {
  const [employees, setEmployees] = useState([]);
  const [orgTree, setOrgTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [collapsed, setCollapsed] = useState({}); // employeeId: bool

  // Fetch from backend SQL
  useEffect(() => {
    setLoading(true);
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load organization data');
        setLoading(false);
      });
  }, []);

  // Build org tree
  useEffect(() => {
    if (employees.length) setOrgTree(buildOrgTree(employees));
  }, [employees]);

  // Dynamic department list
  const departments = useMemo(() => {
    const set = new Set(employees.map(e => e.department));
    return ['All', ...Array.from(set)];
  }, [employees]);

  // All employees for search/filter
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      searchTerm === '' ||
      (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const isEmployeeHighlighted = (employee) => {
    if (searchTerm === '') return false;
    return (
      (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Team stats
  const stats = [
    { title: 'Total Employees', value: employees.length, color: 'bg-primary' },
    { title: 'Departments', value: departments.length - 1, color: 'bg-success' },
    { title: 'Managers', value: employees.filter(e => employees.some(f => f.managerId === e.id)).length, color: 'bg-warning' },
    { title: 'Direct Reports Avg', value: (employees.reduce((acc, e) => acc + employees.filter(f => f.managerId === e.id).length, 0) / (employees.filter(e => employees.some(f => f.managerId === e.id)).length || 1)).toFixed(1), color: 'bg-accent' },
  ];

  // Expand/collapse handler
  const handleToggle = (employeeId) => {
    setCollapsed(prev => ({ ...prev, [employeeId]: !prev[employeeId] }));
  };

  // Recursive node render
  const renderEmployeeNode = (employee, level = 0, isRoot = false) => {
    const isHighlighted = isEmployeeHighlighted(employee);
    const directReports = employee.directReports || [];

    return (
      <div className="flex flex-col items-center">
        {/* Employee Card */}
        <div className={`relative bg-card border rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
          isRoot ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 min-w-[280px]' :
          level === 1 ? 'border-accent bg-gradient-to-br from-accent/5 to-accent/10 min-w-[260px]' :
          'border-border bg-card min-w-[240px]'
        } ${isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
          <div className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Avatar Initials */}
              <Avatar className={`${isRoot ? 'w-16 h-16' : level === 1 ? 'w-14 h-14' : 'w-12 h-12'} border-2 border-background shadow-md ring-2 ring-primary/20 ${isHighlighted ? 'ring-yellow-400' : ''}`}>
                <AvatarFallback className={`${getDepartmentColor(employee.department)} text-white font-bold ${isRoot ? 'text-lg' : 'text-sm'}`}>
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>

              {/* Employee Info */}
              <div className="space-y-1">
                <h3 className={`font-bold text-foreground ${isRoot ? 'text-lg' : level === 1 ? 'text-base' : 'text-sm'} ${isHighlighted ? 'text-yellow-800 dark:text-yellow-200' : ''}`}>
                  {employee.name}
                </h3>
                <p className={`text-muted-foreground font-medium ${isRoot ? 'text-sm' : 'text-xs'}`}>
                  {employee.position}
                </p>
                <Badge
                  variant={isRoot ? 'default' : level === 1 ? 'secondary' : 'outline'}
                  className={`text-xs ${isHighlighted ? 'bg-yellow-200 text-yellow-800' : ''}`}
                >
                  {employee.department}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center justify-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center justify-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{employee.phone}</span>
                  </div>
                )}
              </div>

              {/* Reports Count */}
              {directReports.length > 0 && (
                <div className="flex items-center space-x-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  <span>{directReports.length} direct reports</span>
                </div>
              )}
            </div>
          </div>
          {/* Expand/collapse toggle */}
          {directReports.length > 0 && (
            <button
              className="absolute left-1/2 -translate-x-1/2 bottom-1 text-xs mt-2 bg-background border rounded-full px-2 py-1 shadow hover:bg-muted"
              onClick={() => handleToggle(employee.id)}
              aria-label={collapsed[employee.id] ? 'Expand reports' : 'Collapse reports'}
              type="button"
            >
              {collapsed[employee.id] ? <ChevronDown className="w-4 h-4 inline" /> : <ChevronUp className="w-4 h-4 inline" />}
              <span className="ml-1">{collapsed[employee.id] ? 'Expand' : 'Collapse'}</span>
            </button>
          )}
        </div>
        {/* Draw lines and children */}
        {directReports.length > 0 && !collapsed[employee.id] && (
          <div>
            {/* Vertical line down from card */}
            <div className="w-px h-6 mx-auto bg-gradient-to-b from-primary/50 to-primary/10"></div>
            {/* Horizontal lines to direct reports */}
            <div className="flex justify-center items-start gap-8 mt-0">
              {directReports.map((dr, i) => (
                <div key={dr.id} className="flex flex-col items-center">
                  {/* Child node */}
                  <div className="mt-1">{renderEmployeeNode(dr, level + 1, false)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="p-8 text-lg">Loading organization data...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Organization Chart</h1>
            <p className="text-muted-foreground">View company organization structure</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>Export Chart</Button>
            <Button onClick={() => setShowEditDialog(true)}>Edit Structure</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
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

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by name, title, department, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-muted-foreground">
                Found {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* Org Chart Visualization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Interactive Organization Chart</CardTitle>
              {searchTerm && (
                <div className="flex items-center space-x-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                  <span>Highlighted: Search Results</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto bg-gradient-to-br from-background to-muted/20 p-8">
            <div className="min-w-max flex justify-center">
              {/* Root of the tree */}
              {orgTree && renderEmployeeNode(orgTree, 0, true)}
            </div>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.filter(d => d !== 'All').map((dept, index) => {
            const deptEmps = employees.filter(e => e.department === dept);
            const head = deptEmps.find(e => !e.managerId || !deptEmps.find(f => f.id === e.managerId));
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getDepartmentColor(dept)}`}></div>
                    <span>{dept}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Head:</span>
                      <span className="text-sm font-medium">{head ? head.name : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Staff:</span>
                      <span className="text-sm font-medium">{deptEmps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Managers:</span>
                      <span className="text-sm font-medium">{deptEmps.filter(e => employees.some(f => f.managerId === e.id)).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
