import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Briefcase,
  CalendarDays,
  Monitor,
  Megaphone,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const employeeId = user?.employeeId;

  const [name, setName] = useState("there");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    dateJoined: "",
    managerName: "",
  });
  const [stats, setStats] = useState({
    feedbackCount: 0,
    jobApplications: 0,
    leaveRequests: 0,
    itTickets: 0,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!employeeId) return;

    fetch(`/api/employee-dashboard?employeeId=${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setName(data.name.split(" ")[0]);
        if (data.profile) setProfile(data.profile);
        if (data.stats) setStats(data.stats);
        if (data.announcements) setAnnouncements(data.announcements);
      })
      .catch((err) => console.error("Error loading dashboard:", err))
      .finally(() => setIsLoading(false));
  }, [employeeId]);

  const statCards = [
    {
      label: "My Feedback",
      value: stats.feedbackCount,
      icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />,
      route: "/feedback",
    },
    {
      label: "Job Applications",
      value: stats.jobApplications,
      icon: <Briefcase className="w-5 h-5 text-muted-foreground" />,
      route: "/career",
    },
    {
      label: "Leave Requests",
      value: stats.leaveRequests,
      icon: <CalendarDays className="w-5 h-5 text-muted-foreground" />,
      route: "/leave",
    },
    {
      label: "IT Tickets",
      value: stats.itTickets,
      icon: <Monitor className="w-5 h-5 text-muted-foreground" />,
      route: "/tickets",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 🔹 Welcome Banner */}
      <div className="bg-[#5a9cab]/25 border border-primary rounded-lg p-4 mb-4">
        <p className="text-primary font-medium text-lg">
          Welcome back, {name}!
        </p>
        <p className="text-muted-foreground text-sm">
          Here's a quick look at your latest stats and updates.
        </p>
      </div>

      {/* 🔹 Stats */}
      <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-lg" />
            ))
          : statCards.map((card, index) => (
              <Card
                key={index}
                onClick={() => navigate(card.route)}
                className="cursor-pointer hover:shadow-md transition"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                  <h2 className="text-2xl font-bold">{card.value}</h2>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* 🔹 Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" /> Latest Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-28 w-full rounded-md" />
          ) : announcements.length === 0 ? (
            <p className="text-muted-foreground">No announcements yet.</p>
          ) : (
            <ul className="space-y-4">
              {announcements.map((a) => (
                <li key={a.id} className="border-b pb-2">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-gray-600">{a.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(a.createdDate))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 🔹 Profile Summary */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span role="img" aria-label="user"></span> Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Name:</strong> {profile.name}</div>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Role:</strong> {profile.role}</div>
          <div><strong>Department:</strong> {profile.department}</div>
          <div>
            <strong>Date Joined:</strong>{" "}
            {profile.dateJoined
              ? new Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                }).format(new Date(profile.dateJoined))
              : "N/A"}
          </div>
          <div><strong>Manager:</strong> {profile.managerName || "N/A"}</div>
        </CardContent>
      </Card>

    </div>
  );
}
