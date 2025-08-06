import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export function ITDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [firstName, setFirstName] = useState("THERE");

  useEffect(() => {
    if (!user?.employeeId) return;

    fetch(`/api/it-dashboard?employeeId=${user.employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        if (data.firstName) setFirstName(data.firstName);
      })
      .catch((err) => console.error("Failed to load IT dashboard:", err));
  }, [user?.employeeId]);


  if (!data) return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* 🔹 Welcome */}
      <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-4">
        <p className="text-primary font-medium text-lg">👋 Welcome back, {firstName}!</p>
        <p className="text-muted-foreground text-sm">Here’s an overview of IT operations today.</p>
      </div>

      {/* 🔹 Metrics */}
      <h1 className="text-2xl font-bold">IT Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Total Inventory Items</p><h2 className="text-2xl font-bold">{data.totalInventory}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Total Assigned</p><h2 className="text-2xl font-bold">{data.totalAssigned}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Total Available</p><h2 className="text-2xl font-bold">{data.totalAvailable}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Total IT Assets</p><h2 className="text-2xl font-bold">{data.totalAssets}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Total IT Tickets</p><h2 className="text-2xl font-bold">{data.totalTickets}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Open Tickets</p><h2 className="text-2xl font-bold">{data.openTickets}</h2></CardContent></Card>
      </div>

      {/* 🔹 Tickets by Department */}
      <Card>
        <CardHeader><CardTitle>Tickets by Department</CardTitle></CardHeader>
        <CardContent>
          {data.ticketsByDepartment.length === 0 ? (
            <p className="text-muted-foreground">No ticket data available.</p>
          ) : (
            data.ticketsByDepartment.map((item, index) => (
              <div key={item.department || index} className="flex items-center justify-between py-1">
                <span>{item.department}</span>
                <Badge>{item.count}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 🔹 Recent Troubleshooting Docs */}
      <Card>
        <CardHeader><CardTitle>Recent Troubleshooting Docs</CardTitle></CardHeader>
        <CardContent>
          {data.recentDocs.length === 0 ? (
            <p className="text-muted-foreground">No recent docs available.</p>
          ) : (
            data.recentDocs.map((doc, idx) => (
              <div key={`${doc.title}-${idx}`} className="mb-3">
                <p className="font-medium">{doc.title || "Untitled"}</p>
                <p className="text-sm text-muted-foreground">{doc.category || "Uncategorized"}</p>
                <p className="text-xs text-gray-500">{doc.dateUploaded || "N/A"}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
