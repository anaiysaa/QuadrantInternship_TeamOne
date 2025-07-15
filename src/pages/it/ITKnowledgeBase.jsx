import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddArticleDialog } from '@/components/dialogs/AddArticleDialog';
import { ArticleViewDialog } from '@/components/dialogs/ArticleViewDialog';
import { EditArticleDialog } from '@/components/dialogs/EditArticleDialog';
import { ExportKnowledgeBaseDialog } from '@/components/dialogs/ExportKnowledgeBaseDialog';
import { useToast } from '@/hooks/use-toast';

export default function ITKnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { toast } = useToast();

  const articles = [
    {
      id: 'KB-001',
      title: 'How to Reset Your Password',
      category: 'Security',
      author: 'IT Support',
      lastUpdated: '2024-02-10',
      views: 245,
      helpfulVotes: 42,
      tags: ['password', 'security', 'login'],
      summary: 'Step-by-step guide to reset your account password using the self-service portal.'
    },
    {
      id: 'KB-002',
      title: 'VPN Setup Guide',
      category: 'Network',
      author: 'Network Admin',
      lastUpdated: '2024-02-08',
      views: 189,
      helpfulVotes: 38,
      tags: ['vpn', 'remote', 'network'],
      summary: 'Complete guide to setting up VPN connection for remote work access.'
    },
    {
      id: 'KB-003',
      title: 'Printer Connection Issues',
      category: 'Hardware',
      author: 'IT Support',
      lastUpdated: '2024-02-05',
      views: 156,
      helpfulVotes: 29,
      tags: ['printer', 'connection', 'troubleshooting'],
      summary: 'Common printer connection problems and their solutions.'
    },
    {
      id: 'KB-004',
      title: 'Software Installation Requests',
      category: 'Software',
      author: 'IT Admin',
      lastUpdated: '2024-02-01',
      views: 98,
      helpfulVotes: 22,
      tags: ['software', 'installation', 'requests'],
      summary: 'Process for requesting new software installations and approvals.'
    },
    {
      id: 'KB-005',
      title: 'Email Setup on Mobile Devices',
      category: 'Setup',
      author: 'IT Support',
      lastUpdated: '2024-01-28',
      views: 234,
      helpfulVotes: 45,
      tags: ['email', 'mobile', 'setup'],
      summary: 'Configure corporate email on iOS and Android devices.'
    },
    {
      id: 'KB-006',
      title: 'Wi-Fi Connection Troubleshooting',
      category: 'Network',
      author: 'Network Admin',
      lastUpdated: '2024-01-25',
      views: 167,
      helpfulVotes: 31,
      tags: ['wifi', 'network', 'troubleshooting'],
      summary: 'Diagnose and fix common Wi-Fi connectivity issues.'
    }
  ];

  const filteredArticles = articles.filter(article =>
    (filterCategory === 'all' || article.category === filterCategory) &&
    (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const categories = [...new Set(articles.map(article => article.category))];
  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
  const totalVotes = articles.reduce((sum, article) => sum + article.helpfulVotes, 0);
  const popularArticles = articles.filter(article => article.views > 200).length;

  const stats = [
    { title: 'Total Articles', value: totalArticles, color: 'bg-primary' },
    { title: 'Total Views', value: totalViews.toLocaleString(), color: 'bg-success' },
    { title: 'Helpful Votes', value: totalVotes, color: 'bg-accent' },
    { title: 'Popular Articles', value: popularArticles, color: 'bg-warning' },
  ];

  const handleViewArticle = (article) => {
    console.log('Viewing article:', article);
    setSelectedArticle(article);
    setViewDialogOpen(true);
  };

  const handleEditArticle = (article) => {
    console.log('Editing article:', article);
    setSelectedArticle(article);
    setEditDialogOpen(true);
  };

  const handleSaveArticle = (updatedArticle) => {
    console.log('Saving article:', updatedArticle);
    // In a real app, this would update the articles array or make an API call
    toast({
      title: "Article Saved",
      description: `"${updatedArticle.title}" has been updated successfully.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">IT support articles and documentation</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setExportDialogOpen(true)}>Export KB</Button>
            <AddArticleDialog>
              <Button>Add Article</Button>
            </AddArticleDialog>
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

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search articles by title or tags..."
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline">{article.category}</Badge>
                  <span className="text-xs text-muted-foreground">{article.id}</span>
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{article.summary}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>By {article.author}</span>
                  <span>{new Date(article.lastUpdated).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{article.views} views</span>
                  <span>{article.helpfulVotes} helpful votes</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewArticle(article)}>
                    View
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handleEditArticle(article)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialogs */}
        <ArticleViewDialog
          article={selectedArticle}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
        
        <EditArticleDialog
          article={selectedArticle}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveArticle}
        />

        <ExportKnowledgeBaseDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}
