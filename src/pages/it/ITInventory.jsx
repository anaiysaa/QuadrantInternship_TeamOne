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

export default function ITInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const inventory = [
    {
      id: "INV-001",
      category: "Laptop",
      brand: "Dell",
      model: "XPS 15",
      totalQuantity: 25,
      assigned: 20,
      available: 3,
      maintenance: 1,
      retired: 1,
      unitCost: 1299,
      location: "Storage Room A",
      lastUpdated: "2024-02-12",
    },
    {
      id: "INV-002",
      category: "Desktop",
      brand: "HP",
      model: "EliteDesk 800",
      totalQuantity: 15,
      assigned: 12,
      available: 2,
      maintenance: 1,
      retired: 0,
      unitCost: 899,
      location: "Storage Room A",
      lastUpdated: "2024-02-11",
    },
    {
      id: "INV-003",
      category: "Monitor",
      brand: "LG",
      model: "27UL850-W",
      totalQuantity: 35,
      assigned: 28,
      available: 5,
      maintenance: 2,
      retired: 0,
      unitCost: 449,
      location: "Storage Room B",
      lastUpdated: "2024-02-12",
    },
    {
      id: "INV-004",
      category: "Keyboard",
      brand: "Logitech",
      model: "MX Keys",
      totalQuantity: 50,
      assigned: 35,
      available: 12,
      maintenance: 2,
      retired: 1,
      unitCost: 99,
      location: "Storage Room C",
      lastUpdated: "2024-02-10",
    },
    {
      id: "INV-005",
      category: "Mouse",
      brand: "Logitech",
      model: "MX Master 3",
      totalQuantity: 50,
      assigned: 35,
      available: 13,
      maintenance: 1,
      retired: 1,
      unitCost: 79,
      location: "Storage Room C",
      lastUpdated: "2024-02-10",
    },
    {
      id: "INV-006",
      category: "Chair",
      brand: "Herman Miller",
      model: "Aeron",
      totalQuantity: 30,
      assigned: 25,
      available: 3,
      maintenance: 2,
      retired: 0,
      unitCost: 1395,
      location: "Furniture Storage",
      lastUpdated: "2024-02-09",
    },
    {
      id: "INV-007",
      category: "Desk",
      brand: "IKEA",
      model: "BEKANT",
      totalQuantity: 40,
      assigned: 35,
      available: 4,
      maintenance: 1,
      retired: 0,
      unitCost: 179,
      location: "Furniture Storage",
      lastUpdated: "2024-02-08",
    },
    {
      id: "INV-008",
      category: "Laptop",
      brand: "MacBook Pro",
      model: "16-inch M3",
      totalQuantity: 10,
      assigned: 8,
      available: 1,
      maintenance: 1,
      retired: 0,
      unitCost: 2499,
      location: "Secure Storage",
      lastUpdated: "2024-02-12",
    },
    {
      id: "INV-009",
      category: "Graphics Tablet",
      brand: "Wacom",
      model: "Intuos Pro",
      totalQuantity: 8,
      assigned: 5,
      available: 2,
      maintenance: 1,
      retired: 0,
      unitCost: 349,
      location: "Storage Room B",
      lastUpdated: "2024-02-11",
    },
    {
      id: "INV-010",
      category: "Headset",
      brand: "Jabra",
      model: "Evolve 75",
      totalQuantity: 25,
      assigned: 18,
      available: 5,
      maintenance: 2,
      retired: 0,
      unitCost: 279,
      location: "Storage Room C",
      lastUpdated: "2024-02-10",
    },
    {
      id: "INV-011",
      category: "Webcam",
      brand: "Logitech",
      model: "C920",
      totalQuantity: 20,
      assigned: 15,
      available: 4,
      maintenance: 1,
      retired: 0,
      unitCost: 69,
      location: "Storage Room C",
      lastUpdated: "2024-02-09",
    },
    {
      id: "INV-012",
      category: "Router",
      brand: "Cisco",
      model: "ISR 4331",
      totalQuantity: 5,
      assigned: 4,
      available: 1,
      maintenance: 0,
      retired: 0,
      unitCost: 2899,
      location: "Network Room",
      lastUpdated: "2024-02-12",
    },
  ];

  const getStatusSummary = (item) => {
    const statuses = [];
    if (item.available > 0) statuses.push(`${item.available} Available`);
    if (item.maintenance > 0) statuses.push(`${item.maintenance} Maintenance`);
    if (item.retired > 0) statuses.push(`${item.retired} Retired`);
    return statuses.join(", ");
  };

  const getStockLevel = (item) => {
    const availablePercentage = (item.available / item.totalQuantity) * 100;
    if (availablePercentage <= 10) return "Low";
    if (availablePercentage <= 30) return "Medium";
    return "Good";
  };

  const getStockBadge = (level) => {
    switch (level) {
      case "Low":
        return <Badge variant="destructive">Low Stock</Badge>;
      case "Medium":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Medium Stock
          </Badge>
        );
      case "Good":
        return (
          <Badge variant="outline" className="text-success border-success">
            Good Stock
          </Badge>
        );
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "low-stock" && getStockLevel(item) === "Low") ||
      (filterStatus === "available" && item.available > 0) ||
      (filterStatus === "maintenance" && item.maintenance > 0);

    return matchesSearch && matchesFilter;
  });

  const totalItems = inventory.reduce(
    (sum, item) => sum + item.totalQuantity,
    0
  );
  const totalAssigned = inventory.reduce((sum, item) => sum + item.assigned, 0);
  const totalAvailable = inventory.reduce(
    (sum, item) => sum + item.available,
    0
  );
  const lowStockItems = inventory.filter(
    (item) => getStockLevel(item) === "Low"
  ).length;

  const stats = [
    { title: "Total Items", value: totalItems, color: "bg-primary" },
    { title: "Assigned", value: totalAssigned, color: "bg-success" },
    { title: "Available", value: totalAvailable, color: "bg-accent" },
    { title: "Low Stock Items", value: lowStockItems, color: "bg-destructive" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">IT Inventory</h1>
            <p className="text-muted-foreground">
              Track all IT equipment and availability
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Generate Report</Button>
            <Button>Add Item</Button>
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
            <CardTitle>Filter Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by category, brand, model, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Items</option>
                <option value="low-stock">Low Stock</option>
                <option value="available">Available</option>
                <option value="maintenance">In Maintenance</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.brand}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.model}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.totalQuantity}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.assigned}
                    </TableCell>
                    <TableCell className="text-center font-medium text-success">
                      {item.available}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getStatusSummary(item)}
                    </TableCell>
                    <TableCell>{getStockBadge(getStockLevel(item))}</TableCell>
                    <TableCell className="text-sm">{item.location}</TableCell>
                    <TableCell className="font-medium">
                      ${item.unitCost}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="default">
                          Order
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
