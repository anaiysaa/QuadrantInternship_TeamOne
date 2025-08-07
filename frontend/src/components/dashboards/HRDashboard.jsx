// ... imports unchanged
import { useEffect, useState } from "react";
import {
  MessageSquare, Flag, CalendarDays, Users, UserPlus, Gift,
  FolderOpen, Building2, Hourglass, Star
} from "lucide-react";
import {
  Card, CardContent
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function HRDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState("THERE");

  const TENURE_COLORS = ["#4ade80", "#facc15", "#fb923c", "#f87171"];

  const getTenureData = (tenureObj) =>
    Object.entries(tenureObj || {}).map(([label, value]) => ({ name: label, value }));

  useEffect(() => {
    if (!user?.employeeId) return;

    fetch(`/api/hr-dashboard?employeeId=${user.employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        if (data.firstName) setFirstName(data.firstName);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading HR dashboard:", err);
        setIsLoading(false);
      });
  }, [user?.employeeId]);

  const filterUpcomingThisWeek = (anniversaries) => {
    const today = dayjs();
    const nextWeek = today.add(7, "day");

    return anniversaries
      .map((a) => ({ ...a, parsedDate: dayjs(a.dateJoined) }))
      .filter((a) => {
        const thisYearAnniv = a.parsedDate.year(today.year());
        return thisYearAnniv.isAfter(today) && thisYearAnniv.isBefore(nextWeek);
      })
      .sort((a, b) => dayjs(a.dateJoined).isAfter(dayjs(b.dateJoined)) ? 1 : -1);
  };

  const statCards = stats && [
    {
      label: "Total Feedback", value: stats.totalFeedback,
      icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Pending Feedback", value: stats.pendingFeedback,
      icon: <Flag className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Leave Requests", value: stats.leaveRequests,
      icon: <CalendarDays className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Employees", value: stats.employeeCount,
      icon: <Users className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "New Hires This Month", value: stats.newHires,
      icon: <UserPlus className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Upcoming Anniversaries",
      value: filterUpcomingThisWeek(stats.upcomingAnniversaries || []).length,
      icon: <Gift className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Open HR Tickets", value: stats.openHrTickets,
      icon: <FolderOpen className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Departments", value: stats.departmentBreakdown?.length || 0,
      icon: <Building2 className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Pending Approvals", value: stats.pendingApprovals,
      icon: <Hourglass className="w-5 h-5 text-muted-foreground" />,
    },
    {
      label: "Avg Feedback Rating", value: stats.averageRating,
      icon: <Star className="w-5 h-5 text-muted-foreground" />,
    },
  ];

  const upcomingAnniversaries = stats
    ? filterUpcomingThisWeek(stats.upcomingAnniversaries || [])
    : [];

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome */}
      <div>
        <div className="bg-blue-50 border border-blue-500 rounded-lg p-4 mb-4">
          <p className="text-blue-600 font-semibold text-lg">
            👋 Welcome back, {firstName}!
          </p>
          <p className="text-muted-foreground text-sm">
            Here's a quick look at your latest stats and updates.
          </p>
        </div>
        <p className="text-muted-foreground mt-1">
          Here’s what’s going on with your team this week.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {isLoading
          ? Array.from({ length: 10 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-xl" />
            ))
          : statCards.map((card, index) => (
              <Card key={index} className="hover:shadow-sm transition rounded-xl">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full">{card.icon}</div>
                    <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                  </div>
                  <h2 className="text-2xl font-semibold">{card.value}</h2>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Work Anniversaries */}
      {upcomingAnniversaries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">🎉 Work Anniversaries This Week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAnniversaries.map((item, idx) => (
              <Card key={idx} className="border rounded-xl hover:shadow-sm transition">
                <CardContent className="p-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Joined on {item.dateJoined}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      {!isLoading && stats.recentFeedback?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">📝 Recent Feedback</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentFeedback.slice(0, 6).map((fb, idx) => (
              <Card key={idx} className="rounded-xl">
                <CardContent className="p-4 space-y-1">
                  <p className="text-sm font-medium">{fb.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    Rating: {fb.rating} | {fb.category}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tenure Breakdown */}
      {!isLoading && stats.tenureBreakdown && (
        <div className="mt-10 space-y-2">
          <h2 className="text-xl font-semibold">📊 Tenure Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats.tenureBreakdown).map(([range, count]) => (
              <Card key={range} className="rounded-xl text-center py-4">
                <CardContent>
                  <p className="text-sm text-muted-foreground">{range}</p>
                  <h3 className="text-2xl font-semibold">{count}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getTenureData(stats.tenureBreakdown)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {getTenureData(stats.tenureBreakdown).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TENURE_COLORS[index % TENURE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Leave Requests */}
      {!isLoading && stats.recentLeaveRequests?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">🏖️ Recent Leave Requests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentLeaveRequests.slice(0, 6).map((req, idx) => (
              <Card key={idx} className="rounded-xl">
                <CardContent className="p-4 space-y-1">
                  <p className="text-sm font-medium">{req.employeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {req.leaveType} from {req.startDate} to {req.endDate}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
