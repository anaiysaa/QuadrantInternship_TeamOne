import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

// 🟢 1. ADD THIS — Dummy data for IT tasks!
const currentTasks = [
  {
    id: 1,
    title: "Update Network Firewall",
    description: "Install the latest firmware update on all edge firewalls.",
    priority: "High",
    category: "Security",
    dueDate: "2024-07-30",
    status: "Not Started"
  },
  {
    id: 2,
    title: "Provision Laptops for New Hires",
    description: "Set up 5 new laptops with required company images.",
    priority: "Medium",
    category: "Hardware",
    dueDate: "2024-07-25",
    status: "In Progress"
  },
  {
    id: 3,
    title: "Migrate Email Server",
    description: "Complete mailbox migration to cloud before end of month.",
    priority: "High",
    category: "Infrastructure",
    dueDate: "2024-07-31",
    status: "Not Started"
  },
  {
    id: 4,
    title: "Update Internal Wiki",
    description: "Add documentation for the new IT support ticket process.",
    priority: "Low",
    category: "Documentation",
    dueDate: "2024-08-05",
    status: "Completed"
  },
  {
    id: 5,
    title: "Patch Print Server",
    description: "Apply security patch for CVE-2024-12345.",
    priority: "High",
    category: "Security",
    dueDate: "2024-07-28",
    status: "In Progress"
  }
  // ...add more as needed
];

export function ITDashboard() {
  const {user} = useAuth();
  const [showTasks, setShowTasks] = useState(true);
  const [currentTasks, setCurrentTasks] = useState([
    {
      id: 1,
      title: "Update Antivirus Definitions",
      priority: "High",
      category: "Security",
      description: "Update virus definitions on all workstations.",
      dueDate: "2024-07-30",
      status: "Not Started"
    },
    {
      id: 2,
      title: "Network Upgrade",
      priority: "Medium",
      category: "Infrastructure",
      description: "Upgrade office switches and routers.",
      dueDate: "2024-08-05",
      status: "In Progress"
    },
    {
      id: 3,
      title: "User Access Review",
      priority: "Low",
      category: "Audit",
      description: "Quarterly review of user permissions.",
      dueDate: "2024-08-15",
      status: "Not Started"
    } ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-muted";
    }
  };

  // Dummy handlers (replace as needed)
  const handleTaskAction = (task) => {
    alert(`Clicked action for: ${task.title}`);
  };

  const handleQuickAction = (action) => {
    alert(`Quick action: ${action}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-warning text-warning-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">IT Dashboard</h1>
        <p className="text-warning-foreground/80 mb-4">
          Welcome back, {user?.name} • Information Technology
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <span>Employee ID: {user?.employeeId}</span>
          <span>•</span>
          <span>Department: {user?.department}</span>
        </div>
      </div>

      {/* Current IT Tasks Section - now collapsible */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            Current IT Tasks & Priorities
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setShowTasks(!showTasks)}
            >
              {showTasks ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
          <Badge variant="outline">
            {currentTasks.filter((t) => t.status !== "Completed").length} Active Tasks
          </Badge>
        </CardHeader>

        {showTasks && (
          <CardContent>
            <div className="space-y-4">
              {currentTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge
                        className={getPriorityColor(task.priority)}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {task.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span>Status: {task.status}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {task.status === "Not Started" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTaskAction(task)}
                      >
                        Start
                      </Button>
                    )}
                    {task.status === "In Progress" && (
                      <Button size="sm" onClick={() => handleTaskAction(task)}>
                        Continue
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTaskAction(task)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* IT Stats and other sections go here */}
    </div>
  );
}
