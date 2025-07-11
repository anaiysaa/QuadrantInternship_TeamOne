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

export default function ITAssetManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const assets = [
    {
      id: "AST-001",
      employee: "John Doe",
      department: "Engineering",
      assetType: "Laptop",
      brand: "Dell",
      model: "XPS 15",
      serialNumber: "DL123456789",
      assignedDate: "2024-01-15",
      status: "Active",
      condition: "Good",
      location: "Office - Desk 24",
    },
    {
      id: "AST-002",
      employee: "John Doe",
      department: "Engineering",
      assetType: "Monitor",
      brand: "LG",
      model: "27UL850-W",
      serialNumber: "LG987654321",
      assignedDate: "2024-01-15",
      status: "Active",
      condition: "Excellent",
      location: "Office - Desk 24",
    },
    {
      id: "AST-003",
      employee: "John Doe",
      department: "Engineering",
      assetType: "Keyboard",
      brand: "Logitech",
      model: "MX Keys",
      serialNumber: "LT456789123",
      assignedDate: "2024-01-15",
      status: "Active",
      condition: "Good",
      location: "Office - Desk 24",
    },
    {
      id: "AST-004",
      employee: "John Doe",
      department: "Engineering",
      assetType: "Mouse",
      brand: "Logitech",
      model: "MX Master 3",
      serialNumber: "LT789123456",
      assignedDate: "2024-01-15",
      status: "Active",
      condition: "Good",
      location: "Office - Desk 24",
    },
    {
      id: "AST-005",
      employee: "Sarah Johnson",
      department: "Sales",
      assetType: "Desktop",
      brand: "HP",
      model: "EliteDesk 800",
      serialNumber: "HP123456789",
      assignedDate: "2024-01-20",
      status: "Active",
      condition: "Excellent",
      location: "Office - Desk 12",
    },
    {
      id: "AST-006",
      employee: "Sarah Johnson",
      department: "Sales",
      assetType: "Chair",
      brand: "Herman Miller",
      model: "Aeron",
      serialNumber: "HM987654321",
      assignedDate: "2024-01-20",
      status: "Active",
      condition: "Good",
      location: "Office - Desk 12",
    },
    {
      id: "AST-007",
      employee: "Sarah Johnson",
      department: "Sales",
      assetType: "Desk",
      brand: "IKEA",
      model: "BEKANT",
      serialNumber: "IK456789123",
      assignedDate: "2024-01-20",
      status: "Active",
      condition: "Good",
      location: "Office - Position 12",
    },
    {
      id: "AST-008",
      employee: "Lisa Brown",
      department: "Design",
      assetType: "Laptop",
      brand: "MacBook Pro",
      model: "16-inch M3",
      serialNumber: "AP789123456",
      assignedDate: "2024-02-01",
      status: "Active",
      condition: "Excellent",
      location: "Remote Work",
    },
    {
      id: "AST-009",
      employee: "Lisa Brown",
      department: "Design",
      assetType: "Graphics Tablet",
      brand: "Wacom",
      model: "Intuos Pro",
      serialNumber: "WC123456789",
      assignedDate: "2024-02-01",
      status: "Active",
      condition: "Excellent",
      location: "Remote Work",
    },
    {
      id: "AST-010",
      employee: "Mike Wilson",
      department: "Operations",
      assetType: "Laptop",
      brand: "Lenovo",
      model: "ThinkPad X1",
      serialNumber: "LV987654321",
      assignedDate: "2024-01-25",
      status: "Maintenance",
      condition: "Fair",
      location: "IT Department",
    },
    {
      id: "AST-011",
      employee: "Mike Wilson",
      department: "Operations",
      assetType: "Headset",
      brand: "Jabra",
      model: "Evolve 75",
      serialNumber: "JB456789123",
      assignedDate: "2024-01-25",
      status: "Active",
      condition: "Good",
      location: "Office - Desk 8",
    },
    {
      id: "AST-012",
      employee: "Emma Davis",
      department: "Finance",
      assetType: "Desktop",
      brand: "Dell",
      model: "OptiPlex 7090",
      serialNumber: "DL789123456",
      assignedDate: "2024-01-30",
      status: "Active",
      condition: "Excellent",
      location: "Office - Desk 18",
    },
    {
      id: "AST-013",
      employee: "Emma Davis",
      department: "Finance",
      assetType: "Monitor",
      brand: "Samsung",
      model: "U28E590D",
      serialNumber: "SM123456789",
      assignedDate: "2024-01-30",
      status: "Active",
      condition: "Good",
      location: "Office - Desk 18",
    },
    {
      id: "AST-014",
      employee: "Emma Davis",
      department: "Finance",
      assetType: "Webcam",
      brand: "Logitech",
      model: "C920",
      serialNumber: "LT987654321",
      assignedDate: "2024-01-30",
      status: "Active",
      condition: "Good",
      location: "Office - Desk 18",
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
      case "Maintenance":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Maintenance
          </Badge>
        );
      case "Retired":
        return <Badge variant="secondary">Retired</Badge>;
      case "Lost":
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case "Excellent":
        return (
          <Badge variant="outline" className="text-success border-success">
            Excellent
          </Badge>
        );
      case "Good":
        return (
          <Badge variant="outline" className="text-primary border-primary">
            Good
          </Badge>
        );
      case "Fair":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Fair
          </Badge>
        );
      case "Poor":
        return (
          <Badge
            variant="outline"
            className="text-destructive border-destructive"
          >
            Poor
          </Badge>
        );
      default:
        return <Badge variant="secondary">{condition}</Badge>;
    }
  };

  const filteredAssets = assets.filter(
    (asset) =>
      (filterCategory === "all" || asset.assetType === filterCategory) &&
      (asset.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const assetCategories = [...new Set(assets.map((asset) => asset.assetType))];
  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.status === "Active").length;
  const maintenanceAssets = assets.filter(
    (a) => a.status === "Maintenance"
  ).length;
  const employeesWithAssets = [...new Set(assets.map((a) => a.employee))]
    .length;

  const stats = [
    { title: "Total Assets", value: totalAssets, color: "bg-primary" },
    { title: "Active Assets", value: activeAssets, color: "bg-success" },
    { title: "In Maintenance", value: maintenanceAssets, color: "bg-warning" },
    { title: "Employees", value: employeesWithAssets, color: "bg-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Asset Management</h1>
            <p className="text-muted-foreground">
              Track devices and equipment assigned to employees
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export Assets</Button>
            <Button>Add Asset</Button>
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
            <CardTitle>Filter Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by employee, asset type, brand, model, or serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                {assetCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Assets ({filteredAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Asset Type</TableHead>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-sm">
                      {asset.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {asset.employee}
                    </TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.assetType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.brand}</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.model}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {asset.serialNumber}
                    </TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                    <TableCell className="text-sm">{asset.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="default">
                          Transfer
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
