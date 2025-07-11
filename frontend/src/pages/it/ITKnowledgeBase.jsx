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

export default function ITKnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const knowledgeArticles = [
    {
      id: "KB-001",
      title: "Windows 11 User Manual",
      category: "Operating Systems",
      subcategory: "Windows",
      type: "User Manual",
      description: "Complete guide for Windows 11 features and functionality",
      lastUpdated: "2024-02-10",
      views: 1250,
      rating: 4.8,
      author: "IT Team",
      tags: ["windows", "manual", "os"],
      content: "This comprehensive manual covers all aspects of Windows 11...",
    },
    {
      id: "KB-002",
      title: "MacOS Monterey Troubleshooting",
      category: "Operating Systems",
      subcategory: "MacOS",
      type: "Troubleshooting",
      description: "Common issues and solutions for MacOS Monterey",
      lastUpdated: "2024-02-08",
      views: 890,
      rating: 4.6,
      author: "Sarah Tech",
      tags: ["macos", "troubleshooting", "monterey"],
      content: "Step-by-step troubleshooting guide for MacOS Monterey...",
    },
    {
      id: "KB-003",
      title: "Microsoft Office 365 Setup Guide",
      category: "Software",
      subcategory: "Productivity",
      type: "User Manual",
      description: "Installation and configuration of Office 365 suite",
      lastUpdated: "2024-02-12",
      views: 2100,
      rating: 4.9,
      author: "Mike Wilson",
      tags: ["office365", "setup", "productivity"],
      content: "Complete setup instructions for Microsoft Office 365...",
    },
    {
      id: "KB-004",
      title: "Adobe Creative Suite License Management",
      category: "Software",
      subcategory: "Creative",
      type: "User Manual",
      description: "Managing Adobe licenses and user accounts",
      lastUpdated: "2024-02-05",
      views: 675,
      rating: 4.5,
      author: "Lisa Brown",
      tags: ["adobe", "license", "creative"],
      content: "Guide for managing Adobe Creative Suite licenses...",
    },
    {
      id: "KB-005",
      title: "Network Connectivity Issues",
      category: "Network",
      subcategory: "Troubleshooting",
      type: "Troubleshooting",
      description: "Diagnosing and fixing network connection problems",
      lastUpdated: "2024-02-11",
      views: 1580,
      rating: 4.7,
      author: "Network Team",
      tags: ["network", "connectivity", "troubleshooting"],
      content: "Comprehensive network troubleshooting procedures...",
    },
    {
      id: "KB-006",
      title: "Email Server Configuration",
      category: "Network",
      subcategory: "Email",
      type: "Technical Manual",
      description: "Setting up and maintaining email server infrastructure",
      lastUpdated: "2024-02-09",
      views: 445,
      rating: 4.4,
      author: "Server Admin",
      tags: ["email", "server", "configuration"],
      content: "Technical guide for email server setup and maintenance...",
    },
    {
      id: "KB-007",
      title: "Hardware Installation Procedures",
      category: "Hardware",
      subcategory: "Installation",
      type: "Technical Manual",
      description: "Standard procedures for installing computer hardware",
      lastUpdated: "2024-02-07",
      views: 720,
      rating: 4.6,
      author: "Hardware Team",
      tags: ["hardware", "installation", "procedures"],
      content: "Step-by-step hardware installation guidelines...",
    },
    {
      id: "KB-008",
      title: "Printer Setup and Troubleshooting",
      category: "Hardware",
      subcategory: "Printers",
      type: "User Manual",
      description: "Complete guide for printer setup and common issues",
      lastUpdated: "2024-02-06",
      views: 950,
      rating: 4.3,
      author: "Support Team",
      tags: ["printer", "setup", "troubleshooting"],
      content: "Comprehensive printer setup and troubleshooting guide...",
    },
    {
      id: "KB-009",
      title: "Cybersecurity Best Practices",
      category: "Security",
      subcategory: "General",
      type: "Policy Manual",
      description: "Essential security practices for all employees",
      lastUpdated: "2024-02-12",
      views: 1890,
      rating: 4.8,
      author: "Security Team",
      tags: ["security", "best-practices", "policy"],
      content: "Important cybersecurity guidelines and best practices...",
    },
    {
      id: "KB-010",
      title: "Password Management Guidelines",
      category: "Security",
      subcategory: "Authentication",
      type: "Policy Manual",
      description: "Company policies for password creation and management",
      lastUpdated: "2024-02-04",
      views: 1340,
      rating: 4.5,
      author: "Security Team",
      tags: ["password", "security", "policy"],
      content: "Guidelines for secure password management...",
    },
    {
      id: "KB-011",
      title: "Data Backup Procedures",
      category: "Data Management",
      subcategory: "Backup",
      type: "Technical Manual",
      description: "Standard procedures for data backup and recovery",
      lastUpdated: "2024-02-03",
      views: 580,
      rating: 4.7,
      author: "Data Team",
      tags: ["backup", "data", "recovery"],
      content: "Comprehensive data backup and recovery procedures...",
    },
    {
      id: "KB-012",
      title: "Cloud Storage Best Practices",
      category: "Data Management",
      subcategory: "Cloud",
      type: "User Manual",
      description: "Guidelines for using cloud storage services safely",
      lastUpdated: "2024-02-01",
      views: 1120,
      rating: 4.4,
      author: "Cloud Team",
      tags: ["cloud", "storage", "best-practices"],
      content: "Best practices for secure cloud storage usage...",
    },
  ];

  const categories = [
    ...new Set(knowledgeArticles.map((article) => article.category)),
  ];

  const getTypeBadge = (type) => {
    switch (type) {
      case "User Manual":
        return (
          <Badge variant="outline" className="text-primary border-primary">
            User Manual
          </Badge>
        );
      case "Troubleshooting":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Troubleshooting
          </Badge>
        );
      case "Technical Manual":
        return (
          <Badge variant="outline" className="text-accent border-accent">
            Technical Manual
          </Badge>
        );
      case "Policy Manual":
        return (
          <Badge variant="outline" className="text-success border-success">
            Policy Manual
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const filteredArticles = knowledgeArticles.filter(
    (article) =>
      (filterCategory === "all" || article.category === filterCategory) &&
      (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  const stats = [
    {
      title: "Total Articles",
      value: knowledgeArticles.length,
      color: "bg-primary",
    },
    { title: "Categories", value: categories.length, color: "bg-success" },
    {
      title: "Total Views",
      value: knowledgeArticles
        .reduce((sum, article) => sum + article.views, 0)
        .toLocaleString(),
      color: "bg-accent",
    },
    {
      title: "Avg Rating",
      value: (
        knowledgeArticles.reduce((sum, article) => sum + article.rating, 0) /
        knowledgeArticles.length
      ).toFixed(1),
      color: "bg-warning",
    },
  ];

  const popularArticles = knowledgeArticles
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">
              User manuals and troubleshooting guides
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export Articles</Button>
            <Button>Add Article</Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Knowledge Base Articles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Search Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search articles, descriptions, or tags..."
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
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Articles Table */}
            <Card>
              <CardHeader>
                <CardTitle>Articles ({filteredArticles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{article.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {article.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {article.category}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {article.subcategory}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(article.type)}</TableCell>
                        <TableCell className="text-center">
                          {article.views.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-sm">⭐ {article.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(article.lastUpdated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedArticle(article)}
                            >
                              View
                            </Button>
                            <Button size="sm" variant="default">
                              Edit
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularArticles.map((article, index) => (
                    <div key={article.id} className="p-3 bg-accent rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{article.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {article.category}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs">👁️ {article.views}</span>
                            <span className="text-xs">⭐ {article.rating}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const count = knowledgeArticles.filter(
                      (a) => a.category === category
                    ).length;
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => setFilterCategory(category)}
                      >
                        <span className="text-sm">{category}</span>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    📝 Create New Article
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📊 View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🏷️ Manage Tags
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    👥 User Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Article Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedArticle.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedArticle.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedArticle(null)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>By {selectedArticle.author}</span>
                  <span>•</span>
                  <span>
                    Updated{" "}
                    {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>⭐ {selectedArticle.rating}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>{selectedArticle.content}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
