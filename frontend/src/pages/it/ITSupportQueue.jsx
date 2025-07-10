import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ITSupportQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("severity");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const tickets = [
    {
      id: "IT-001",
      title: "Server down - Production",
      employee: "Engineering Team",
      department: "Engineering",
      severity: "Critical",
      status: "Open",
      priority: 1,
      submittedDate: "2024-02-12T09:15:00",
      description: "Production server is completely unresponsive",
      category: "Infrastructure",
    },
    {
      id: "IT-002",
      title: "Network connectivity issues",
      employee: "Sarah Johnson",
      department: "Sales",
      severity: "High",
      status: "In Progress",
      priority: 2,
      submittedDate: "2024-02-12T10:30:00",
      description: "Unable to connect to company VPN",
      category: "Network",
    },
    {
      id: "IT-003",
      title: "Email server slow",
      employee: "Marketing Team",
      department: "Marketing",
      severity: "High",
      status: "Open",
      priority: 2,
      submittedDate: "2024-02-12T11:45:00",
      description: "Email delivery delays of 10+ minutes",
      category: "Email",
    },
    {
      id: "IT-004",
      title: "Laptop not turning on",
      employee: "John Doe",
      department: "HR",
      severity: "Medium",
      status: "Assigned",
      priority: 3,
      submittedDate: "2024-02-12T08:20:00",
      description: "Device completely unresponsive, no power lights",
      category: "Hardware",
    },
    {
      id: "IT-005",
      title: "Software license expired",
      employee: "Lisa Brown",
      department: "Design",
      severity: "Medium",
      status: "Open",
      priority: 3,
      submittedDate: "2024-02-11T16:30:00",
      description: "Adobe Creative Suite license needs renewal",
      category: "Software",
    },
    {
      id: "IT-006",
      title: "Printer not working",
      employee: "Mike Wilson",
      department: "Operations",
      severity: "Low",
      status: "Open",
      priority: 4,
      submittedDate: "2024-02-11T14:15:00",
      description: "Office printer shows paper jam error",
      category: "Hardware",
    },
    {
      id: "IT-007",
      title: "Password reset request",
      employee: "Emma Davis",
      department: "Finance",
      severity: "Low",
      status: "Resolved",
      priority: 4,
      submittedDate: "2024-02-11T12:00:00",
      description: "Cannot remember login password",
      category: "Access",
    },
  ];

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "High":
        return (
          <Badge
            variant="outline"
            className="text-destructive border-destructive"
          >
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="outline" className="text-success border-success">
            Low
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return (
          <Badge variant="outline" className="text-primary border-primary">
            Open
          </Badge>
        );
      case "In Progress":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            In Progress
          </Badge>
        );
      case "Assigned":
        return (
          <Badge variant="outline" className="text-accent border-accent">
            Assigned
          </Badge>
        );
      case "Resolved":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground"
          >
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTickets = tickets
    .filter(
      (ticket) =>
        (filterSeverity === "all" || ticket.severity === filterSeverity) &&
        (ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "severity") {
        return a.priority - b.priority;
      } else if (sortBy === "newest") {
        return new Date(b.submittedDate) - new Date(a.submittedDate);
      } else if (sortBy === "oldest") {
        return new Date(a.submittedDate) - new Date(b.submittedDate);
      }
      return 0;
    });

  const stats = [
    { title: "Total Tickets", value: tickets.length, color: "bg-primary" },
    {
      title: "Critical/High",
      value: tickets.filter((t) => ["Critical", "High"].includes(t.severity))
        .length,
      color: "bg-destructive",
    },
    {
      title: "In Progress",
      value: tickets.filter((t) => t.status === "In Progress").length,
      color: "bg-warning",
    },
    {
      title: "Resolved Today",
      value: tickets.filter((t) => t.status === "Resolved").length,
      color: "bg-success",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Queue</h1>
            <p className="text-muted-foreground">
              Manage support tickets from employees
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export Report</Button>
            <Button>Create Ticket</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search tickets, employees, or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="severity">Sort by Severity</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.employee}</TableCell>
                    <TableCell>{ticket.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell>{getSeverityBadge(ticket.severity)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(ticket.submittedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm" variant="default">
                          Assign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
