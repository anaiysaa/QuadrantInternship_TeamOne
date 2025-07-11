import { useState, useEffect } from "react";
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
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/it_tickets")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched raw ticket data from backend:", data); // ✅ debug log
        const formatted = data.map((t) => {
          const severityVal = parseInt(t.Severity ?? t.severity ?? 4);
          let severityText = "Low";
          if (severityVal === 1) severityText = "Critical";
          else if (severityVal === 2) severityText = "High";
          else if (severityVal === 3) severityText = "Medium";

          return {
            id: t.TicketID ?? t.ticket_id ?? "N/A",
            title: t.Title ?? t.title ?? "No Title",
            employee: `ID ${t.EmployeeID ?? t.employee_id ?? "Unknown"}`,
            department: t.Department ?? t.department ?? "N/A",
            category: t.Category ?? t.category ?? "General",
            severity: severityText,
            status: t.Status ?? t.status ?? "Open",
            submittedDate: t.SubmittedDate ?? t.submitted_date ?? new Date().toISOString(),
          };
        });
        setTickets(formatted);
      })
      .catch((err) => console.error("Error fetching tickets:", err));
  }, []);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "High":
        return <Badge variant="outline" className="text-destructive border-destructive">High</Badge>;
      case "Medium":
        return <Badge variant="outline" className="text-warning border-warning">Medium</Badge>;
      case "Low":
        return <Badge variant="outline" className="text-success border-success">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <Badge variant="outline" className="text-primary border-primary">Open</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="text-warning border-warning">In Progress</Badge>;
      case "Assigned":
        return <Badge variant="outline" className="text-accent border-accent">Assigned</Badge>;
      case "Resolved":
        return <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTickets = tickets
    .filter((ticket) =>
      (filterSeverity === "all" || ticket.severity === filterSeverity) &&
      (ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.submittedDate) - new Date(a.submittedDate);
      } else if (sortBy === "oldest") {
        return new Date(a.submittedDate) - new Date(b.submittedDate);
      }
      return 0;
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Queue</h1>
            <p className="text-muted-foreground">Manage support tickets from employees</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export Report</Button>
            <Button>Create Ticket</Button>
          </div>
        </div>

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
                    <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                    <TableCell><p className="font-medium">{ticket.title}</p></TableCell>
                    <TableCell>{ticket.employee}</TableCell>
                    <TableCell>{ticket.department}</TableCell>
                    <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                    <TableCell>{getSeverityBadge(ticket.severity)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm">
                      {ticket.submittedDate ? new Date(ticket.submittedDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="default">Assign</Button>
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
