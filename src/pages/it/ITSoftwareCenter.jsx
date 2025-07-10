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

export default function ITSoftwareCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const softwareLicenses = [
    {
      id: "SW-001",
      name: "Microsoft Office 365",
      vendor: "Microsoft",
      category: "Productivity",
      licenseType: "Subscription",
      totalLicenses: 250,
      usedLicenses: 235,
      availableLicenses: 15,
      expiryDate: "2024-12-31",
      costPerLicense: 12.5,
      totalCost: 3125,
      status: "Active",
      manager: "IT Department",
      notes: "Enterprise plan with advanced features",
    },
    {
      id: "SW-002",
      name: "Adobe Creative Suite",
      vendor: "Adobe",
      category: "Creative",
      licenseType: "Subscription",
      totalLicenses: 25,
      usedLicenses: 22,
      availableLicenses: 3,
      expiryDate: "2024-08-15",
      costPerLicense: 52.99,
      totalCost: 1324.75,
      status: "Active",
      manager: "Design Team",
      notes: "Creative Cloud for Teams",
    },
    {
      id: "SW-003",
      name: "Slack Business+",
      vendor: "Slack",
      category: "Communication",
      licenseType: "Subscription",
      totalLicenses: 200,
      usedLicenses: 185,
      availableLicenses: 15,
      expiryDate: "2024-06-30",
      costPerLicense: 12.5,
      totalCost: 2500,
      status: "Expiring Soon",
      manager: "IT Department",
      notes: "Company-wide communication platform",
    },
    {
      id: "SW-004",
      name: "Zoom Pro",
      vendor: "Zoom",
      category: "Communication",
      licenseType: "Subscription",
      totalLicenses: 100,
      usedLicenses: 85,
      availableLicenses: 15,
      expiryDate: "2024-09-20",
      costPerLicense: 14.99,
      totalCost: 1499,
      status: "Active",
      manager: "IT Department",
      notes: "Video conferencing for all teams",
    },
    {
      id: "SW-005",
      name: "Figma Professional",
      vendor: "Figma",
      category: "Design",
      licenseType: "Subscription",
      totalLicenses: 15,
      usedLicenses: 12,
      availableLicenses: 3,
      expiryDate: "2024-11-10",
      costPerLicense: 12.0,
      totalCost: 180,
      status: "Active",
      manager: "Design Team",
      notes: "Design collaboration tool",
    },
    {
      id: "SW-006",
      name: "Jira Software",
      vendor: "Atlassian",
      category: "Development",
      licenseType: "Subscription",
      totalLicenses: 50,
      usedLicenses: 45,
      availableLicenses: 5,
      expiryDate: "2024-07-25",
      costPerLicense: 7.5,
      totalCost: 375,
      status: "Active",
      manager: "Engineering Team",
      notes: "Project management for development",
    },
    {
      id: "SW-007",
      name: "Confluence",
      vendor: "Atlassian",
      category: "Collaboration",
      licenseType: "Subscription",
      totalLicenses: 50,
      usedLicenses: 38,
      availableLicenses: 12,
      expiryDate: "2024-07-25",
      costPerLicense: 5.5,
      totalCost: 275,
      status: "Active",
      manager: "Engineering Team",
      notes: "Team documentation and collaboration",
    },
    {
      id: "SW-008",
      name: "Salesforce Professional",
      vendor: "Salesforce",
      category: "CRM",
      licenseType: "Subscription",
      totalLicenses: 30,
      usedLicenses: 28,
      availableLicenses: 2,
      expiryDate: "2024-10-15",
      costPerLicense: 75.0,
      totalCost: 2250,
      status: "Active",
      manager: "Sales Team",
      notes: "Customer relationship management",
    },
    {
      id: "SW-009",
      name: "QuickBooks Enterprise",
      vendor: "Intuit",
      category: "Finance",
      licenseType: "Annual",
      totalLicenses: 5,
      usedLicenses: 5,
      availableLicenses: 0,
      expiryDate: "2024-04-30",
      costPerLicense: 200.0,
      totalCost: 1000,
      status: "Expiring Soon",
      manager: "Finance Team",
      notes: "Accounting and financial management",
    },
    {
      id: "SW-010",
      name: "Norton Antivirus",
      vendor: "Norton",
      category: "Security",
      licenseType: "Annual",
      totalLicenses: 300,
      usedLicenses: 280,
      availableLicenses: 20,
      expiryDate: "2024-12-01",
      costPerLicense: 4.99,
      totalCost: 1497,
      status: "Active",
      manager: "IT Department",
      notes: "Endpoint protection for all devices",
    },
    {
      id: "SW-011",
      name: "GitHub Enterprise",
      vendor: "GitHub",
      category: "Development",
      licenseType: "Subscription",
      totalLicenses: 40,
      usedLicenses: 35,
      availableLicenses: 5,
      expiryDate: "2024-08-30",
      costPerLicense: 21.0,
      totalCost: 840,
      status: "Active",
      manager: "Engineering Team",
      notes: "Code repository and collaboration",
    },
    {
      id: "SW-012",
      name: "Tableau Creator",
      vendor: "Tableau",
      category: "Analytics",
      licenseType: "Annual",
      totalLicenses: 10,
      usedLicenses: 8,
      availableLicenses: 2,
      expiryDate: "2024-05-15",
      costPerLicense: 70.0,
      totalCost: 700,
      status: "Expiring Soon",
      manager: "Data Team",
      notes: "Business intelligence and analytics",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge
            variant="default"
            className="bg-success text-success-foreground"
          >
            Active
          </Badge>
        );
      case "Expiring Soon":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Expiring Soon
          </Badge>
        );
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUsageBadge = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90)
      return <Badge variant="destructive">High Usage</Badge>;
    if (percentage >= 70)
      return (
        <Badge variant="outline" className="text-warning border-warning">
          Medium Usage
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-success border-success">
        Low Usage
      </Badge>
    );
  };

  const filteredSoftware = softwareLicenses.filter(
    (software) =>
      (filterStatus === "all" || software.status === filterStatus) &&
      (software.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        software.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        software.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalLicenses = softwareLicenses.reduce(
    (sum, software) => sum + software.totalLicenses,
    0
  );
  const totalUsed = softwareLicenses.reduce(
    (sum, software) => sum + software.usedLicenses,
    0
  );
  const totalCost = softwareLicenses.reduce(
    (sum, software) => sum + software.totalCost,
    0
  );
  const expiringSoon = softwareLicenses.filter(
    (s) => s.status === "Expiring Soon"
  ).length;

  const stats = [
    { title: "Total Licenses", value: totalLicenses, color: "bg-primary" },
    { title: "Used Licenses", value: totalUsed, color: "bg-success" },
    {
      title: "Monthly Cost",
      value: `$${totalCost.toLocaleString()}`,
      color: "bg-accent",
    },
    { title: "Expiring Soon", value: expiringSoon, color: "bg-destructive" },
  ];

  const categories = [...new Set(softwareLicenses.map((s) => s.category))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Software Center</h1>
            <p className="text-muted-foreground">
              Manage software licenses and subscriptions
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">License Report</Button>
            <Button>Add License</Button>
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
            <CardTitle>Filter Software</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by software name, vendor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Software Licenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Software Licenses ({filteredSoftware.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Software</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>License Type</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSoftware.map((software) => (
                  <TableRow key={software.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{software.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {software.vendor}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{software.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {software.licenseType}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {software.usedLicenses} / {software.totalLicenses}
                        </p>
                        {getUsageBadge(
                          software.usedLicenses,
                          software.totalLicenses
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {software.availableLicenses}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(software.expiryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${software.totalCost}
                    </TableCell>
                    <TableCell>{getStatusBadge(software.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                        <Button size="sm" variant="default">
                          Renew
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* License Utilization by Category */}
        <Card>
          <CardHeader>
            <CardTitle>License Utilization by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryLicenses = softwareLicenses.filter(
                  (s) => s.category === category
                );
                const totalInCategory = categoryLicenses.reduce(
                  (sum, s) => sum + s.totalLicenses,
                  0
                );
                const usedInCategory = categoryLicenses.reduce(
                  (sum, s) => sum + s.usedLicenses,
                  0
                );
                const costInCategory = categoryLicenses.reduce(
                  (sum, s) => sum + s.totalCost,
                  0
                );

                return (
                  <div key={category} className="p-4 bg-accent rounded-lg">
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Licenses:</span>
                        <span className="font-medium">{totalInCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used:</span>
                        <span className="font-medium">{usedInCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilization:</span>
                        <span className="font-medium">
                          {((usedInCategory / totalInCategory) * 100).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span className="font-medium">${costInCategory}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
