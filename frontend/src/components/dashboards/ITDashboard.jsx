import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    // ... keep existing code (priority color logic)
  };

  const handleTaskAction = (task) => {
    // ... keep existing code (task action handling)
  };

  const handleQuickAction = (action) => {
    // ... keep existing code (quick action handling)
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
            {currentTasks.filter((t) => t.status !== "Completed").length} Active
            Tasks
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

      {/* IT Stats */}
      {/* ... keep existing code (IT stats, critical tickets, asset alerts, quick actions, etc.) */}
    </div>
  );
}
