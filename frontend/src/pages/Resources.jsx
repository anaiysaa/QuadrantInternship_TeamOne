import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ResourceDetailsDialog } from '@/components/dialogs/ResourceDetailsDialog';
import { useState, useEffect } from 'react';

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/resources")
      .then((res) => res.json())
      .then((data) => setResources(data))
      .catch((err) => console.error("Failed to load resources", err));
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    setShowResourceDialog(true);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const getCategoryCount = (category) => {
    return resources.filter(resource => resource.category === category).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resources</h1>
            <p className="text-muted-foreground">Access manuals, guides, and documentation</p>
          </div>

        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search by title, category, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              {selectedCategory && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                >
                  Clear Filter: {selectedCategory}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Hardware', 'Software', 'Security', 'Network'].map(category => (
            <Card 
              key={category}
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCategory === category ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleCategoryFilter(category)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">
                  {category === 'Hardware' && '💻'}
                  {category === 'Software' && '📱'}
                  {category === 'Security' && '🔒'}
                  {category === 'Network' && '🌐'}
                </div>
                <h3 className="font-semibold">{category}</h3>
                <p className="text-sm text-muted-foreground">
                  {category === 'Hardware' && 'Device manuals & guides'}
                  {category === 'Software' && 'Application guides'}
                  {category === 'Security' && 'Security policies'}
                  {category === 'Network' && 'Network setup guides'}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {getCategoryCount(category)} resources
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Available Resources ({filteredResources.length})
              {selectedCategory && ` - ${selectedCategory}`}
            </CardTitle>
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
                        {resource.tags && <Badge variant="outline">{resource.tags}</Badge>}
                      </div>
                      <Badge variant="outline" className={getTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Size: {resource.size}</span>
                      <span>Updated: {formatDate(resource.lastUpdated)}</span>
                      <span>Downloads: {resource.downloads}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewResource(resource)}
                    >
                      View
                    </Button>
                    <a
                      href={`http://localhost:8000/api/resources/download/${resource.file_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm">Download</Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ResourceDetailsDialog
          resource={selectedResource}
          open={showResourceDialog}
          onOpenChange={setShowResourceDialog}
        />

      </div>
    </DashboardLayout>
  );
}
