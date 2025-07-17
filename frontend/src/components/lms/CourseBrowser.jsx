
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Star, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CourseBrowser({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { toast } = useToast();

  const allCourses = [
    {
      id: 1,
      title: 'Python Programming for Beginners',
      category: 'Programming',
      difficulty: 'Beginner',
      duration: '20 hours',
      instructor: 'Alex Rodriguez',
      rating: 4.8,
      enrolled: 234,
      price: 'Free',
      description: 'Start your programming journey with Python fundamentals.',
      image: '🐍'
    },
    {
      id: 2,
      title: 'Digital Marketing Strategies',
      category: 'Marketing',
      difficulty: 'Intermediate',
      duration: '15 hours',
      instructor: 'Lisa Thompson',
      rating: 4.6,
      enrolled: 189,
      price: 'Free',
      description: 'Learn modern digital marketing techniques and tools.',
      image: '📈'
    },
    {
      id: 3,
      title: 'Leadership Development',
      category: 'Leadership',
      difficulty: 'Advanced',
      duration: '10 hours',
      instructor: 'David Wilson',
      rating: 4.9,
      enrolled: 156,
      price: 'Free',
      description: 'Develop essential leadership skills for career advancement.',
      image: '👑'
    },
    {
      id: 4,
      title: 'Advanced Excel Training',
      category: 'Software',
      difficulty: 'Advanced',
      duration: '8 hours',
      instructor: 'Sarah Johnson',
      rating: 4.7,
      enrolled: 298,
      price: 'Free',
      description: 'Master advanced Excel functions, pivot tables, and data analysis.',
      image: '📊'
    },
    {
      id: 5,
      title: 'Web Development Fundamentals',
      category: 'Programming',
      difficulty: 'Beginner',
      duration: '25 hours',
      instructor: 'John Smith',
      rating: 4.5,
      enrolled: 412,
      price: 'Free',
      description: 'Learn HTML, CSS, and JavaScript basics.',
      image: '🌐'
    },
    {
      id: 6,
      title: 'Data Analysis with R',
      category: 'Data Science',
      difficulty: 'Intermediate',
      duration: '18 hours',
      instructor: 'Maria Garcia',
      rating: 4.6,
      enrolled: 167,
      price: 'Free',
      description: 'Analyze data and create visualizations using R.',
      image: '📊'
    },
    {
      id: 7,
      title: 'UX/UI Design Principles',
      category: 'Design',
      difficulty: 'Beginner',
      duration: '12 hours',
      instructor: 'Emma Davis',
      rating: 4.8,
      enrolled: 203,
      price: 'Free',
      description: 'Learn user experience and interface design fundamentals.',
      image: '🎨'
    },
    {
      id: 8,
      title: 'Cloud Computing with AWS',
      category: 'Technology',
      difficulty: 'Advanced',
      duration: '22 hours',
      instructor: 'Kevin Lee',
      rating: 4.7,
      enrolled: 145,
      price: 'Free',
      description: 'Master Amazon Web Services and cloud deployment.',
      image: '☁️'
    }
  ];

  const categories = ['all', 'Programming', 'Marketing', 'Leadership', 'Software', 'Data Science', 'Design', 'Technology'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const handleEnrollNow = (course) => {
    toast({
      title: "Enrollment Successful",
      description: `You have been enrolled in ${course.title}!`,
    });
    console.log('Enroll in course:', course);
    // In a real app, this would update the backend and user's enrolled courses
  };

  const handlePreview = (course) => {
    toast({
      title: "Course Preview",
      description: `Opening preview for ${course.title}...`,
    });
    console.log('Preview course:', course);
    // In a real app, this would open a preview modal or page
  };

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success text-success-foreground';
      case 'Intermediate': return 'bg-warning text-warning-foreground';
      case 'Advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Programming': return 'bg-primary';
      case 'Marketing': return 'bg-accent';
      case 'Leadership': return 'bg-secondary';
      case 'Software': return 'bg-success';
      case 'Data Science': return 'bg-warning';
      case 'Design': return 'bg-destructive';
      case 'Technology': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Browse All Courses</h1>
            <p className="text-muted-foreground">Discover and enroll in new courses</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {allCourses.length} courses
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">{course.image}</div>
                <Badge className={getDifficultyColor(course.difficulty)} variant="outline">
                  {course.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getCategoryColor(course.category)}`}></div>
                <span className="text-sm text-muted-foreground">{course.category}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{course.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{course.enrolled}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{course.duration}</span>
                  </div>
                  <span className="font-medium text-success">{course.price}</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Instructor: {course.instructor}
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button className="flex-1" size="sm" onClick={() => handleEnrollNow(course)}>
                  Enroll Now
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePreview(course)}>
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find relevant courses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
