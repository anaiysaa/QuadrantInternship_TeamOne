import { useState, useEffect } from 'react';
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
  const [articles, setArticles] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetch('http://localhost:8000/api/resources')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => console.error('Failed to load articles', err));
  }, []);

  const filteredArticles = articles.filter(article =>
    (filterCategory === 'all' || article.category === filterCategory) &&
    (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [...new Set(articles.map(article => article.category).filter(Boolean))];
  const totalArticles = articles.length;
  const totalViews = 0; // Update once view tracking is in place
  const totalVotes = 0; // Update once helpful votes are tracked
  const popularArticles = 0; // Placeholder for future logic

  const stats = [
    { title: 'Total Articles', value: totalArticles, color: 'bg-primary' },
    { title: 'Total Views', value: totalViews.toLocaleString(), color: 'bg-success' },
    { title: 'Helpful Votes', value: totalVotes, color: 'bg-accent' },
    { title: 'Popular Articles', value: popularArticles, color: 'bg-warning' },
  ];

  const handleViewArticle = (article) => {
    setSelectedArticle(article);
    setViewDialogOpen(true);
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setEditDialogOpen(true);
  };

  const handleSaveArticle = (updatedArticle) => {
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
          {filteredArticles.map((article, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline">{article.category || 'General'}</Badge>
                  <span className="text-xs text-muted-foreground">#{article.id}</span>
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{article.summary}</p>
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
