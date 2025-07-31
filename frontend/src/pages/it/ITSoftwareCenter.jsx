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
import { AddLicenseDialog } from '@/components/dialogs/AddLicenseDialog';
import { ManageLicenseDialog } from '@/components/dialogs/ManageLicenseDialog';
import { RenewLicenseDialog } from '@/components/dialogs/RenewLicenseDialog';
import { LicenseReportDialog } from '@/components/dialogs/LicenseReportDialog';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_BASE_URL = 'http://localhost:8000';

export default function ITSoftwareCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [softwareLicenses, setSoftwareLicenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch software licenses from API
  const fetchSoftwareLicenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/software-licenses`);
      setSoftwareLicenses(response.data);
    } catch (error) {
      console.error('Error fetching software licenses:', error);
      toast({
        title: "Error",
        description: "Failed to load software licenses from server",
        variant: "destructive"
      });
      setSoftwareLicenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category analytics from API
  const fetchCategoryData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/software-licenses/categories`);
      setCategoryData(response.data);
    } catch (error) {
      console.error('Error fetching category data:', error);
      // Fallback to calculating from license data
      calculateCategoryData();
    }
  };

  // Fallback calculation if API fails
  const calculateCategoryData = () => {
    const categories = [...new Set(softwareLicenses.map(s => s.category))];
    const data = categories.map(category => {
      const categoryLicenses = softwareLicenses.filter(s => s.category === category);
      const totalInCategory = categoryLicenses.reduce((sum, s) => sum + s.totalLicenses, 0);
      const usedInCategory = categoryLicenses.reduce((sum, s) => sum + s.usedLicenses, 0);
      const costInCategory = categoryLicenses.reduce((sum, s) => sum + s.totalCost, 0);
      const utilizationRate = totalInCategory > 0 ? ((usedInCategory / totalInCategory) * 100) : 0;
      
      return {
        category,
        totalLicenses: totalInCategory,
        usedLicenses: usedInCategory,
        availableLicenses: totalInCategory - usedInCategory,
        utilizationRate: utilizationRate,
        monthlyCost: costInCategory
      };
    });
    setCategoryData(data);
  };

  useEffect(() => {
    fetchSoftwareLicenses();
  }, []);

  useEffect(() => {
    if (softwareLicenses.length > 0) {
      fetchCategoryData();
    }
  }, [softwareLicenses]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'Expiring Soon':
        return <Badge variant="outline" className="text-warning border-warning">Expiring Soon</Badge>;
      case 'Expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUsageBadge = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return <Badge variant="destructive">High Usage</Badge>;
    if (percentage >= 70) return <Badge variant="outline" className="text-warning border-warning">Medium Usage</Badge>;
    return <Badge variant="outline" className="text-success border-success">Low Usage</Badge>;
  };

  const filteredSoftware = softwareLicenses.filter(software =>
    (filterStatus === 'all' || software.status === filterStatus) &&
    (software.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     software.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
     software.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalLicenses = softwareLicenses.reduce((sum, software) => sum + software.totalLicenses, 0);
  const totalUsed = softwareLicenses.reduce((sum, software) => sum + software.usedLicenses, 0);
  const totalCost = softwareLicenses.reduce((sum, software) => sum + software.totalCost, 0);
  const expiringSoon = softwareLicenses.filter(s => s.status === 'Expiring Soon').length;

  const stats = [
    { title: 'Total Licenses', value: totalLicenses, color: 'bg-primary' },
    { title: 'Used Licenses', value: totalUsed, color: 'bg-success' },
    { title: 'Monthly Cost', value: `$${totalCost.toLocaleString()}`, color: 'bg-accent' },
    { title: 'Expiring Soon', value: expiringSoon, color: 'bg-destructive' },
  ];

  // Handle API calls
  const handleAddLicense = async (licenseData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/software-licenses`, licenseData);
      toast({
        title: "License Added",
        description: "New software license has been added successfully.",
      });
      fetchSoftwareLicenses(); // Refresh data
    } catch (error) {
      console.error('Error adding license:', error);
      toast({
        title: "Error",
        description: "Failed to add software license",
        variant: "destructive"
      });
    }
  };

  const handleManageLicense = async (licenseId, licenseData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/software-licenses/${licenseId}`, licenseData);
      toast({
        title: "License Updated",
        description: "Software license has been updated successfully.",
      });
      fetchSoftwareLicenses(); // Refresh data
    } catch (error) {
      console.error('Error updating license:', error);
      toast({
        title: "Error",
        description: "Failed to update software license",
        variant: "destructive"
      });
    }
  };

  const handleRenewLicense = async (renewData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/software-licenses/renew`, renewData);
      toast({
        title: "License Renewed",
        description: "Software license has been renewed successfully.",
      });
      fetchSoftwareLicenses(); // Refresh data
    } catch (error) {
      console.error('Error renewing license:', error);
      toast({
        title: "Error",
        description: "Failed to renew software license",
        variant: "destructive"
      });
    }
  };

  const handleExportReport = () => {
    if (filteredSoftware.length === 0) {
      toast({
        title: "No Data",
        description: "No software licenses to export",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = ['License ID', 'Software', 'Vendor', 'Category', 'License Type', 'Total Licenses', 'Used', 'Available', 'Expiry Date', 'Monthly Cost', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredSoftware.map(software => [
        software.id || '',
        software.name || '',
        software.vendor || '',
        software.category || '',
        software.licenseType || '',
        software.totalLicenses || 0,
        software.usedLicenses || 0,
        software.availableLicenses || 0,
        software.expiryDate || '',
        software.totalCost || 0,
        software.status || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `software-licenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Software license report has been downloaded.",
    });
  };

  const getUtilizationColor = (rate) => {
    if (rate >= 90) return 'hsl(var(--destructive))';
    if (rate >= 70) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Total Licenses: <span className="font-medium">{data.totalLicenses}</span></p>
            <p>Used: <span className="font-medium">{data.usedLicenses}</span></p>
            <p>Available: <span className="font-medium">{data.availableLicenses}</span></p>
            <p>Utilization: <span className="font-medium">{data.utilizationRate.toFixed(1)}%</span></p>
            <p>Monthly Cost: <span className="font-medium">${data.monthlyCost}</span></p>
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
            <p className="text-muted-foreground">Loading software licenses...</p>
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
            <h1 className="text-2xl font-bold">Software Center</h1>
            <p className="text-muted-foreground">Manage software licenses and subscriptions</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportReport}>License Report</Button>
            <AddLicenseDialog onAdd={handleAddLicense}>
              <Button>Add License</Button>
            </AddLicenseDialog>
          </div>
        </div>

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
                        <p className="text-sm text-muted-foreground">{software.vendor}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{software.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{software.licenseType}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{software.usedLicenses} / {software.totalLicenses}</p>
                        {getUsageBadge(software.usedLicenses, software.totalLicenses)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{software.availableLicenses}</TableCell>
                    <TableCell className="text-sm">
                      {software.expiryDate ? new Date(software.expiryDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">${software.totalCost}</TableCell>
                    <TableCell>{getStatusBadge(software.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ManageLicenseDialog 
                          software={software}
                          onManage={(licenseData) => handleManageLicense(software.id, licenseData)}
                        >
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </ManageLicenseDialog>
                        <RenewLicenseDialog 
                          software={software}
                          onRenew={handleRenewLicense}
                        >
                          <Button size="sm" variant="default">
                            Renew
                          </Button>
                        </RenewLicenseDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License Utilization by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-4">Utilization Rate by Category</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="utilizationRate" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getUtilizationColor(entry.utilizationRate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4">License Distribution by Category</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: 'Licenses', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="usedLicenses" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="availableLicenses" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    <span className="text-xs text-muted-foreground">Used</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-muted"></div>
                    <span className="text-xs text-muted-foreground">Available</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {categoryData.map(data => (
                <div key={data.category} className="p-4 bg-accent/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{data.category}</h4>
                    <Badge variant="outline" className={`text-xs ${
                      data.utilizationRate >= 90 ? 'border-destructive text-destructive' :
                      data.utilizationRate >= 70 ? 'border-warning text-warning' :
                      'border-success text-success'
                    }`}>
                      {data.utilizationRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Licenses:</span>
                      <span className="font-medium">{data.usedLicenses}/{data.totalLicenses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Cost:</span>
                      <span className="font-medium">${data.monthlyCost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}