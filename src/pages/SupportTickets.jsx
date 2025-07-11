import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SupportTickets() {
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const tickets = [
    {
      id: "ST-001",
      title: "Laptop running slowly",
      category: "Hardware",
      priority: "Medium",
      status: "In Progress",
      createdDate: "2024-02-10",
      lastUpdate: "2024-02-12",
      assignedTo: "IT Support",
      description: "My laptop has been running very slowly for the past week.",
    },
    {
      id: "ST-002",
      title: "Cannot access email",
      category: "Software",
      priority: "High",
      status: "Open",
      createdDate: "2024-02-11",
      lastUpdate: "2024-02-11",
      assignedTo: "Unassigned",
      description: "Unable to login to my email account since this morning.",
    },
    {
      id: "ST-003",
      title: "Printer not working",
      category: "Hardware",
      priority: "Low",
      status: "Resolved",
      createdDate: "2024-02-08",
      lastUpdate: "2024-02-09",
      assignedTo: "IT Support",
      description: "Office printer shows paper jam error constantly.",
    },
  ];

  const handleCreateTicket = () => {
    console.log("Creating ticket:", newTicket);
    // Reset form
    setNewTicket({ title: "", description: "", category: "", priority: "" });
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      setChatMessages([
        ...chatMessages,
        { sender: "user", message: chatInput },
      ]);
      setChatInput("");

      // Simulate bot response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            message:
              "Thanks for your message! I understand you need help with your issue. Let me create a support ticket for you. Can you please provide more details about the problem?",
          },
        ]);
      }, 1000);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">High</Badge>;
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
        return <Badge variant="secondary">{priority}</Badge>;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground">
              Create and track your IT support requests
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Chat with Bot</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>IT Support Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-background">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <p>👋 Hello! I'm your IT support assistant.</p>
                        <p>How can I help you today?</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              msg.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.sender === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleChatSubmit()
                      }
                    />
                    <Button onClick={handleChatSubmit}>Send</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Ticket</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Support Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newTicket.title}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, title: e.target.value })
                      }
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value) =>
                        setNewTicket({ ...newTicket, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="account">Account Access</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) =>
                        setNewTicket({ ...newTicket, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          description: e.target.value,
                        })
                      }
                      placeholder="Detailed description of the issue"
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleCreateTicket} className="w-full">
                    Create Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* My Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>My Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm">
                      {ticket.createdDate}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
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
