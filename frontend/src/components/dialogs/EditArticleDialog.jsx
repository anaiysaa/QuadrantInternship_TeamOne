
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EditArticleDialog({ article, open, onOpenChange, onSave }) {
const [formData, setFormData] = useState({
  title: article?.title || '',
  category: article?.category || '',
  summary: article?.summary || '',
  file: null,
  fileName: article?.fileName || '', // used to show current file name
  tags: Array.isArray(article?.tags) ? article.tags : String(article?.tags || '').split(',').map(t => t.trim()),
});

  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  if (!article) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

 const handleSave = async () => {
  // Compose the updated article object
  const updatedArticle = {
    ...article,
    title: formData.title,
    category: formData.category,
    summary: formData.summary,
    tags: formData.tags,
    lastUpdated: new Date().toISOString().split('T')[0],
    fileName: formData.fileName, // keep old file name if no new file is chosen
  };

  try {
    // If a new file is selected, handle upload
    if (formData.file) {
      const uploadData = new FormData();
      uploadData.append("file", formData.file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        throw new Error("File upload failed");
      }

      const fileRes = await res.json();
      updatedArticle.fileName = fileRes.fileName || formData.file.name;
    }

    // Save the updated article
    onSave?.(updatedArticle);

    toast({
      title: "Article Updated",
      description: `"${updatedArticle.title}" has been successfully updated.`,
    });

    onOpenChange(false);
  } catch (err) {
    toast({
      title: "Save Failed",
      description: err.message || "Something went wrong.",
      variant: "destructive",
    });
  }
};



  const categories = ['Security', 'Network', 'Hardware', 'Software', 'Setup'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Article - {article.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Article title"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Brief summary of the article"
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
  <Label htmlFor="file">Upload File</Label>
  <Input
    id="file"
    type="file"
    accept=".pdf,.doc,.docx"
    onChange={(e) =>
      setFormData(prev => ({
        ...prev,
        file: e.target.files[0],
        fileName: e.target.files[0]?.name || prev.fileName
      }))
    }
  />
  {formData.fileName && (
    <p className="text-sm text-muted-foreground">Current file: {formData.fileName}</p>
  )}
</div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTag(tag)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag}>Add Tag</Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
            <span>Author: {article.author}</span>
            <span>Views: {article.views}</span>
            <span>Helpful votes: {article.helpfulVotes}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
