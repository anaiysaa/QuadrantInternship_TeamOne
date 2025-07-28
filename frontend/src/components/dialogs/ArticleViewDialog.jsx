
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ArticleViewDialog({ article, open, onOpenChange }) {
  const [isHelpful, setIsHelpful] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  if (!article) return null;

  const handleHelpfulVote = (helpful) => {
    setIsHelpful(helpful);
    toast({
      title: helpful ? "Marked as Helpful" : "Marked as Not Helpful",
      description: "Thank you for your feedback!",
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark Removed" : "Bookmark Added",
      description: isBookmarked ? "Article removed from bookmarks" : "Article saved to bookmarks",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Article link copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{article.category}</Badge>
                <span className="text-xs text-muted-foreground">{article.id}</span>
              </div>
              <DialogTitle className="text-xl">{article.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Article Metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-4">
            <div className="flex items-center gap-4">
              <span>By {article.author}</span>
              <span>Updated {new Date(article.lastUpdated).toLocaleDateString()}</span>
              <span>{article.views} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "text-yellow-600" : ""}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>
          </div>

          {/* Article Tags */}
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(article.tags) ? article.tags : String(article.tags).split(',')).map((tag, index) => (
  <Badge key={index} variant="secondary" className="text-xs">
    {tag.trim()}
  </Badge>
))}

          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            <p className="text-muted-foreground mb-4">{article.summary}</p>
            
            {/* Mock detailed content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overview</h3>
              <p>This article provides detailed instructions and troubleshooting steps for {article.title.toLowerCase()}. Follow the steps below to resolve common issues and implement best practices.</p>
              
              <h3 className="text-lg font-semibold">Step-by-Step Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>First, identify the problem and gather necessary information</li>
                <li>Check system requirements and compatibility</li>
                <li>Follow the configuration steps outlined below</li>
                <li>Test the implementation and verify functionality</li>
                <li>Document any changes for future reference</li>
              </ol>

              <h3 className="text-lg font-semibold">Common Issues</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Connection timeouts - Check network connectivity</li>
                <li>Authentication failures - Verify credentials</li>
                <li>Configuration errors - Review settings</li>
              </ul>

              <h3 className="text-lg font-semibold">Additional Resources</h3>
              <p>For more information, consult the official documentation or contact IT support.</p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Was this article helpful?</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isHelpful === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHelpfulVote(true)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Yes ({article.helpfulVotes})
                  </Button>
                  <Button
                    variant={isHelpful === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleHelpfulVote(false)}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
