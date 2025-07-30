import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddInventoryDialog } from '@/components/dialogs/AddInventoryDialog';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function ITInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/it-inventory`);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory from server",
        variant: "destructive"
      });
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return <Badge variant="default" className="bg-success text-success-foreground">In Stock</Badge>;
      case 'Low Stock':
        return <Badge variant="outline" className="text-warning border-warning">Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'Ordered':
        return <Badge variant="outline" className="text-accent border-accent">Ordered</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredInventory = inventory.filter(item =>
    (filterCategory === 'all' || item.category === filterCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [...new Set(inventory.map(item => item.category))];
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
  const outOfStockItems = inventory.filter(item => item.quantity === 0).length;

  const stats = [
    { title: 'Total Items', value: totalItems, color: 'bg-primary' },
    { title: 'Total Value', value: `$${totalValue.toLocaleString()}`, color: 'bg-success' },
    { title: 'Low Stock', value: lowStockItems, color: 'bg-warning' },
    { title: 'Out of Stock', value: outOfStockItems, color: 'bg-destructive' },
  ];

  // Handle API calls
  const handleAddItem = async (itemData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/it-inventory`, itemData);
      toast({
        title: "Item Added",
        description: "New inventory item has been added successfully.",
      });
      fetchInventory(); // Refresh data
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive"
      });
    }
  };

  const handleEditItem = async (itemId, itemData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/it-inventory/${itemId}`, itemData);
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully.",
      });
      fetchInventory(); // Refresh data
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive"
      });
    }
  };

  const handleOrderItem = async (item) => {
    try {
      await axios.post(`${API_BASE_URL}/api/it-inventory/order`, {
        itemId: item.id,
        quantity: 1
      });
      toast({
        title: "Order Placed",
        description: `Order has been placed for ${item.name}`,
      });
      fetchInventory(); // Refresh data
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
    }
  };

  const handleExportInventory = () => {
    if (filteredInventory.length === 0) {
      toast({
        title: "No Data",
        description: "No inventory items to export",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = ['Item ID', 'Name', 'Category', 'Brand', 'Model', 'Quantity', 'Available', 'Unit Price', 'Total Value', 'Status', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredInventory.map(item => [
        item.id || '',
        item.name || '',
        item.category || '',
        item.brand || '',
        item.model || '',
        item.quantity || 0,
        item.available || 0,
        item.unitPrice || 0,
        item.totalValue || 0,
        item.status || '',
        item.location || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `it-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Inventory report has been downloaded.",
    });
  };

  const categoryData = categories.map(category => {
    const categoryItems = inventory.filter(item => item.category === category);
    const totalQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAvailable = categoryItems.reduce((sum, item) => sum + item.available, 0);
    const totalAllocated = categoryItems.reduce((sum, item) => sum + item.allocated, 0);
    const totalValue = categoryItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockCount = categoryItems.filter(item => item.quantity <= item.reorderLevel).length;
    const utilizationRate = totalQuantity > 0 ? ((totalAllocated / totalQuantity) * 100) : 0;
    
    return {
      category,
      totalQuantity,
      available: totalAvailable,
      allocated: totalAllocated,
      totalValue,
      lowStockCount,
      utilizationRate
    };
  });

  const stockStatusData = [
    { name: 'In Stock', value: inventory.filter(item => item.status === 'In Stock').length, color: 'hsl(var(--success))' },
    { name: 'Low Stock', value: inventory.filter(item => item.status === 'Low Stock').length, color: 'hsl(var(--warning))' },
    { name: 'Out of Stock', value: inventory.filter(item => item.status === 'Out of Stock').length, color: 'hsl(var(--destructive))' },
    { name: 'Ordered', value: inventory.filter(item => item.status === 'Ordered').length, color: 'hsl(var(--accent))' }
  ].filter(item => item.value > 0);

  const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

  const getUtilizationColor = (rate) => {
    if (rate >= 80) return 'hsl(var(--destructive))';
    if (rate >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Total Quantity: <span className="font-medium">{data.totalQuantity}</span></p>
            <p>Available: <span className="font-medium">{data.available}</span></p>
            <p>Allocated: <span className="font-medium">{data.allocated}</span></p>
            <p>Utilization: <span className="font-medium">{data.utilizationRate.toFixed(1)}%</span></p>
            <p>Total Value: <span className="font-medium">${data.totalValue.toLocaleString()}</span></p>
            <p>Low Stock Items: <span className="font-medium">{data.lowStockCount}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">IT Inventory</h1>
            <p className="text-muted-foreground">Manage hardware and equipment inventory</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2"
            >
              {showAnalytics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
            </Button>
            <Button variant="outline" onClick={handleExportInventory}>Export Report</Button>
            <AddInventoryDialog onAdd={handleAddItem}>
              <Button>Add Item</Button>
            </AddInventoryDialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                </div>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inventory by Category Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Inventory Distribution by Category</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="category" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="available" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="allocated" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded bg-primary"></div>
                        <span className="text-xs text-muted-foreground">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded bg-muted"></div>
                        <span className="text-xs text-muted-foreground">Allocated</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status Distribution */}
                  <div>
                    <h4 className="text-sm font-medium mb-4">Stock Status Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stockStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stockStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center flex-wrap gap-4 mt-4">
                      {stockStatusData.map((item, index) => (
                        <div key={item.name} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {categoryData.map(data => (
                    <div key={data.category} className="p-4 bg-accent/30 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{data.category}</h4>
                        <Badge variant="outline" className={`text-xs ${
                          data.utilizationRate >= 80 ? 'border-destructive text-destructive' :
                          data.utilizationRate >= 60 ? 'border-warning text-warning' :
                          'border-success text-success'
                        }`}>
                          {data.utilizationRate.toFixed(1)}% Utilized
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Items:</span>
                          <span className="font-medium">{data.totalQuantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium">{data.available}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Value:</span>
                          <span className="font-medium">${data.totalValue.toLocaleString()}</span>
                        </div>
                        {data.lowStockCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Low Stock:</span>
                            <span className="font-medium text-warning">{data.lowStockCount} items</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by name, brand, or model..."
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
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.brand}</p>
                        <p className="text-sm text-muted-foreground">{item.model}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-center font-medium">{item.available}</TableCell>
                    <TableCell className="font-medium">${item.unitPrice}</TableCell>
                    <TableCell className="font-medium">${item.totalValue.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditItem(item.id, item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleOrderItem(item)}>
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
