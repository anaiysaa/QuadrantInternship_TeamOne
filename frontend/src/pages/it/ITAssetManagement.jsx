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
import { AddAssetDialog } from '@/components/dialogs/AddAssetDialog';
import { EditAssetDialog } from '@/components/dialogs/EditAssetDialog';
import { TransferAssetDialog } from '@/components/dialogs/TransferAssetDialog';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:8000';

export default function ITAssetManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/it-assets`);
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error",
        description: "Failed to load assets from server",
        variant: "destructive"
      });
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'Maintenance':
        return <Badge variant="outline" className="text-warning border-warning">Maintenance</Badge>;
      case 'Retired':
        return <Badge variant="secondary">Retired</Badge>;
      case 'Lost':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'Excellent':
        return <Badge variant="outline" className="text-success border-success">Excellent</Badge>;
      case 'Good':
        return <Badge variant="outline" className="text-primary border-primary">Good</Badge>;
      case 'Fair':
        return <Badge variant="outline" className="text-warning border-warning">Fair</Badge>;
      case 'Poor':
        return <Badge variant="outline" className="text-destructive border-destructive">Poor</Badge>;
      default:
        return <Badge variant="secondary">{condition}</Badge>;
    }
  };

  const filteredAssets = assets.filter(asset =>
    (filterCategory === 'all' || asset.assetType === filterCategory) &&
    (asset.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
     asset.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
     asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
     asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
     asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const assetCategories = [...new Set(assets.map(asset => asset.assetType))];
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'Active').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Maintenance').length;
  const employeesWithAssets = [...new Set(assets.map(a => a.employee))].length;

  const stats = [
    { title: 'Total Assets', value: totalAssets, color: 'bg-primary' },
    { title: 'Active Assets', value: activeAssets, color: 'bg-success' },
    { title: 'In Maintenance', value: maintenanceAssets, color: 'bg-warning' },
    { title: 'Employees', value: employeesWithAssets, color: 'bg-accent' },
  ];

  // Handle API calls
  const handleAddAsset = async (assetData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/it-assets`, assetData);
      toast({
        title: "Asset Added",
        description: "New asset has been added successfully.",
      });
      fetchAssets(); // Refresh data
    } catch (error) {
      console.error('Error adding asset:', error);
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive"
      });
    }
  };

  const handleEditAsset = async (assetId, assetData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/it-assets/${assetId}`, assetData);
      toast({
        title: "Asset Updated",
        description: "Asset information has been updated successfully.",
      });
      fetchAssets(); // Refresh data
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive"
      });
    }
  };

  const handleTransferAsset = async (transferData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/it-assets/transfer`, transferData);
      toast({
        title: "Asset Transferred",
        description: `Asset ${transferData.assetId} has been transferred successfully.`,
      });
      fetchAssets(); // Refresh data
    } catch (error) {
      console.error('Error transferring asset:', error);
      toast({
        title: "Error",
        description: "Failed to transfer asset",
        variant: "destructive"
      });
    }
  };

  const handleExportAssets = () => {
    if (filteredAssets.length === 0) {
      toast({
        title: "No Data",
        description: "No assets to export",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = ['Asset ID', 'Employee', 'Department', 'Asset Type', 'Brand', 'Model', 'Serial Number', 'Status', 'Condition', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        asset.id || '',
        asset.employee || '',
        asset.department || '',
        asset.assetType || '',
        asset.brand || '',
        asset.model || '',
        asset.serialNumber || '',
        asset.status || '',
        asset.condition || '',
        asset.location || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `it-assets-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Asset report has been downloaded.",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assets...</p>
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
            <h1 className="text-2xl font-bold">Asset Management</h1>
            <p className="text-muted-foreground">Track devices and equipment assigned to employees</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportAssets}>Export Assets</Button>
            <AddAssetDialog onAdd={handleAddAsset}>
              <Button>Add Asset</Button>
            </AddAssetDialog>
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
                {assetCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
                    <TableCell className="font-mono text-sm">{asset.id}</TableCell>
                    <TableCell className="font-medium">{asset.employee}</TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.assetType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.brand}</p>
                        <p className="text-sm text-muted-foreground">{asset.model}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                    <TableCell className="text-sm">{asset.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <EditAssetDialog asset={asset} onEdit={(assetData) => handleEditAsset(asset.id, assetData)}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </EditAssetDialog>
                        <TransferAssetDialog asset={asset} onTransfer={handleTransferAsset}>
                          <Button size="sm" variant="default">Transfer</Button>
                        </TransferAssetDialog>
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