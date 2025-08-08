import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Feedback() {
  const [feedbackForm, setFeedbackForm] = useState({
    category: "",
    subject: "",
    message: "",
    anonymous: false,
    rating: 0,
    womenOnly: false,
  });

  const [recipient, setRecipient] = useState("");
  const [employees, setEmployees] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [gender, setGender] = useState(""); // good
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const employeeId = user?.employeeId;
  
  const categories = [
    "Work Environment",
    "Management",
    "Benefits",
    "Career Development",
    "Compensation",
    "Team Collaboration",
    "Tools & Technology",
    "Company Culture",
    "Other",
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Under Review":
        return (
          <Badge variant="outline" className="text-primary border-primary">Under Review</Badge>
        );
      case "Responded":
        return (
          <Badge variant="outline" className="text-warning border-warning">Responded</Badge>
        );
      case "Resolved":
        return (
          <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRatingStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  const fetchFeedback = () => {
    setLoading(true);
    fetch(`/api/feedback?employeeId=${employeeId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setMyFeedback(data))
      .catch((err) => console.error("Error fetching feedback:", err))
      .finally(() => setLoading(false));
  };

  const fetchEmployees = () => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error fetching employees:", err));
  };

  const fetchEmployeeInfo = () => {
    fetch(`/api/employees/${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setGender(data.Gender || ""); // 👈 Adjust field name if necessary
      })
      .catch((err) => console.error("Error fetching employee info:", err));
  };
  useEffect(() => {
    if (!employeeId) return;
  
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/resume/employees/${employeeId}`);
        const data = await res.json();
        setGender(data.gender);
      } catch (err) {
        console.error("Failed to fetch employee data:", err);
      }
    };
  
    fetchEmployee();
    fetchFeedback(); // ✅ Add this line here
  }, [employeeId]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...feedbackForm,
      employeeId,
      recipientGroup: recipient || null,
    };

    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        setFeedbackForm({
          category: "",
          subject: "",
          message: "",
          anonymous: false,
          rating: 0,
          womenOnly: false,
        });
        setRecipient("");
        fetchFeedback();
      })
      .catch((err) => console.error("Error submitting feedback:", err));
  };
  console.log("Gender loaded:", gender);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-muted-foreground">
            Share your thoughts and help us improve
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Feedback</h3>
              </div>
              <p className="text-2xl font-bold mt-1">{myFeedback.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              </div>
              <p className="text-2xl font-bold mt-1">
                {myFeedback.filter((f) => f.status === "Under Review").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Resolved</h3>
              </div>
              <p className="text-2xl font-bold mt-1">
                {myFeedback.filter((f) => f.status === "Resolved").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h3 className="text-sm font-medium text-muted-foreground">Avg Rating</h3>
              </div>
              <p className="text-2xl font-bold mt-1">
                {myFeedback.length > 0
                  ? (myFeedback.reduce((acc, f) => acc + f.rating, 0) / myFeedback.length).toFixed(1)
                  : "0.0"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submit New Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={feedbackForm.category}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <select
                    id="rating"
                    value={feedbackForm.rating}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, rating: parseInt(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value={0}>Select rating</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={feedbackForm.subject}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="Brief description of your feedback"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={feedbackForm.message}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Please provide detailed feedback..."
                  className="w-full px-3 py-2 border border-input rounded-md min-h-[120px]"
                  required
                />
              </div>

              
              {/* Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={feedbackForm.anonymous}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({ ...prev, anonymous: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="anonymous" className="text-sm">Submit anonymously</Label>
                </div>

                {gender?.toUpperCase?.() === "F" && (
              <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="womenOnly"
      checked={feedbackForm.womenOnly}
      onChange={(e) =>
        setFeedbackForm((prev) => ({ ...prev, womenOnly: e.target.checked }))
      }
      className="rounded"
    />
    <Label htmlFor="womenOnly" className="text-sm">
      Submit to Women-Only Group
    </Label>
  </div>
)}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline">Save Draft</Button>
                <Button type="submit">Submit Feedback</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* My Feedback History */}
        <Card>
          <CardHeader>
            <CardTitle>My Feedback History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feedback ID</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Women Only</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
            
                {myFeedback
  .filter((feedback) => (!feedback.isWomenOnly) || gender?.toUpperCase?.() === "F")
  .flatMap((feedback) => {
    const mainRow = (
      <TableRow key={feedback.id}>
        <TableCell>{feedback.id}</TableCell>
        <TableCell>{feedback.anonymous ? "Anonymous" : feedback.employeeId}</TableCell>
        <TableCell>{feedback.recipientGroup || "—"}</TableCell>
        <TableCell>{feedback.category}</TableCell>
        <TableCell>{feedback.subject}</TableCell>
        <TableCell className="max-w-[360px] whitespace-pre-line break-words">
          {feedback.message || "—"}
        </TableCell>
        <TableCell>{getRatingStars(feedback.rating)} ({feedback.rating}/5)</TableCell>
        <TableCell>{getStatusBadge(feedback.status)}</TableCell>
        <TableCell>
          {feedback.submittedDate ? new Date(feedback.submittedDate).toLocaleDateString() : ""}
        </TableCell>
        <TableCell>{feedback.isWomenOnly ? "Yes" : "No"}</TableCell>
      </TableRow>
    );

    const responseRow =
      feedback.status === "Responded" && feedback.response ? (
        <TableRow key={`resp-${feedback.id}`}>
          <TableCell colSpan={10} className="bg-muted text-sm text-muted-foreground italic">
            <strong>HR Response:</strong> {feedback.response}
          </TableCell>
        </TableRow>
      ) : null;

    // Return an array so we avoid React.Fragment entirely
    return responseRow ? [mainRow, responseRow] : [mainRow];
  })}

                      
    </TableBody>

              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}