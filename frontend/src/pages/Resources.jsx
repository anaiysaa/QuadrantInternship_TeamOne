
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');

  const resources = [
    {
      id: 1,
      title: 'Laptop User Manual',
      category: 'Hardware',
      type: 'Manual',
      size: '2.5 MB',
      lastUpdated: '2024-01-15',
      downloads: 125,
      description: 'Complete guide for company-issued laptops including setup, troubleshooting, and maintenance.'
    },
    {
      id: 2,
      title: 'Microsoft Office 365 Guide',
      category: 'Software',
      type: 'Manual',
      size: '3.8 MB',
      lastUpdated: '2024-02-01',
      downloads: 89,
      description: 'Comprehensive guide for using Office 365 applications including Word, Excel, PowerPoint, and Teams.'
    },
    {
      id: 3,
      title: 'VPN Setup Instructions',
      category: 'Network',
      type: 'Guide',
      size: '1.2 MB',
      lastUpdated: '2024-01-20',
      downloads: 67,
      description: 'Step-by-step instructions for setting up VPN connection for remote work.'
    },
    {
      id: 4,
      title: 'Printer Troubleshooting',
      category: 'Hardware',
      type: 'Troubleshooting',
      size: '1.8 MB',
      lastUpdated: '2024-01-10',
      downloads: 45,
      description: 'Common printer issues and solutions for office printers.'
    },
    {
      id: 5,
      title: 'Security Best Practices',
      category: 'Security',
      type: 'Policy',
      size: '2.1 MB',
      lastUpdated: '2024-02-05',
      downloads: 156,
      description: 'Essential security guidelines for protecting company data and systems.'
    },
    {
      id: 6,
      title: 'Slack Communication Guide',
      category: 'Software',
      type: 'Manual',
      size: '1.5 MB',
      lastUpdated: '2024-01-25',
      downloads: 78,
      description: 'Best practices for using Slack for team communication and collaboration.'
    },
    {
      id: 7,
      title: 'Mobile Device Management',
      category: 'Mobile',
      type: 'Policy',
      size: '2.3 MB',
      lastUpdated: '2024-01-30',
      downloads: 34,
      description: 'Guidelines for managing company mobile devices and BYOD policies.'
    },
    {
      id: 8,
      title: 'Adobe Creative Suite Manual',
      category: 'Software',
      type: 'Manual',
      size: '5.2 MB',
      lastUpdated: '2024-02-10',
      downloads: 23,
      description: 'Complete manual for Adobe Creative Suite including Photoshop, Illustrator, and InDesign.'
    }
  ];

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Hardware': return 'bg-primary';
      case 'Software': return 'bg-success';
      case 'Network': return 'bg-warning';
      case 'Security': return 'bg-destructive';
      case 'Mobile': return 'bg-accent';
      default: return 'bg-secondary';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Manual': return 'bg-blue-100 text-blue-800';
      case 'Guide': return 'bg-green-100 text-green-800';
      case 'Troubleshooting': return 'bg-yellow-100 text-yellow-800';
      case 'Policy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resources</h1>
            <p className="text-muted-foreground">Access manuals, guides, and documentation</p>
          </div>
          <Button variant="outline">Request New Resource</Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by title, category, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">💻</div>
              <h3 className="font-semibold">Hardware</h3>
              <p className="text-sm text-muted-foreground">Device manuals & guides</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold">Software</h3>
              <p className="text-sm text-muted-foreground">Application guides</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">Security policies</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-semibold">Network</h3>
              <p className="text-sm text-muted-foreground">Network setup guides</p>
            </CardContent>
          </Card>
        </div>

        {/* Resources List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Resources ({filteredResources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(resource.category)}`}></div>
                        <span className="text-sm">{resource.category}</span>
                      </div>
                      <Badge variant="outline" className={getTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Size: {resource.size}</span>
                      <span>Updated: {resource.lastUpdated}</span>
                      <span>Downloads: {resource.downloads}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button size="sm">Download</Button>
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
