import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Star, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Preview modal for course details
function PreviewModal({ course, open, onClose }) {
  if (!open || !course) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-lg max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          className="absolute top-2 right-2"
          size="icon"
          variant="outline"
          onClick={onClose}
        >
          ×
        </Button>
        <div className="flex items-center space-x-4 mb-2">
          <div className="text-4xl">{ "📖"}</div>
          <div>
            <h2 className="text-xl font-bold">{course.title}</h2>
            <div className="flex items-center space-x-2">
              <Badge>{course.difficulty}</Badge>
              <Badge>{course.category}</Badge>
            </div>
          </div>
        </div>
        <div className="mb-3 text-muted-foreground">{course.description}</div>
        <div className="flex items-center space-x-6 mb-2 text-sm">
          <span>
            Instructor:{" "}
            <span className="font-semibold">{course.instructor}</span>
          </span>
          <span>Duration: {course.duration}</span>
          <span>Rating: {course.rating} ⭐</span>
        </div>
        {course.link && (
          <div className="mt-2">
            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Go to Course
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function CourseBrowser({
  onBack,
  onEnroll,
  enrolledCourseIds = [],
  userId,
}) {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [previewCourse, setPreviewCourse] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [locallyEnrolled, setLocallyEnrolled] = useState([]);

  const { toast } = useToast();

  // Fetch all courses from backend
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/courses")
      .then((res) => setAllCourses(res.data))
      .catch(() => setAllCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // Build unique categories/difficulties from data
  const categories = [
    "all",
    ...Array.from(new Set(allCourses.map((c) => c.category).filter(Boolean))),
  ];
  const difficulties = [
    "all",
    ...Array.from(new Set(allCourses.map((c) => c.difficulty).filter(Boolean))),
  ];

  // Filter out enrolled courses, search/filter, and hide just-enrolled
  const filteredCourses = allCourses.filter((course) => {
    if (enrolledCourseIds && enrolledCourseIds.includes(course.id))
      return false;
    if (locallyEnrolled.includes(course.id)) return false;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.instructor &&
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Enroll user in course
  const handleEnrollNow = async (course) => {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to enroll.",
        variant: "destructive",
      });
      return;
    }
    try {
      await axios.post(`/api/user-courses/${userId}/enroll`, {
        course_id: course.id,
      });
      toast({
        title: "Enrollment Successful",
        description: `You have been enrolled in ${course.title}!`,
      });
      setLocallyEnrolled((prev) => [...prev, course.id]);
      if (onEnroll) {
        // Wait for refresh to finish!
        await onEnroll(course);
      }
      // Only after parent data is fresh, close CourseBrowser
      if (typeof onBack === "function") onBack();
    } catch (err) {
      toast({
        title: "Enrollment Failed",
        description:
          err?.response?.data?.error || "Could not enroll in course.",
        variant: "destructive",
      });
    }
  };

  // Show preview modal (fetches backend details)
  const handlePreview = (course) => {
    setPreviewLoading(true);
    axios
      .get(`/api/courses/${course.id}`)
      .then((res) => setPreviewCourse(res.data))
      .catch(() =>
        setPreviewCourse({
          ...course,
          description: "Could not load full details.",
        })
      )
      .finally(() => setPreviewLoading(false));
  };

  // UI helpers
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-success text-success-foreground";
      case "Intermediate":
        return "bg-warning text-warning-foreground";
      case "Advanced":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Programming":
        return "bg-primary";
      case "Marketing":
        return "bg-accent";
      case "Leadership":
        return "bg-secondary";
      case "Software":
        return "bg-success";
      case "Data Science":
        return "bg-warning";
      case "Design":
        return "bg-destructive";
      case "Technology":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <PreviewModal
        course={previewCourse}
        open={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Browse All Courses</h1>
            <p className="text-muted-foreground">
              Discover and enroll in new courses
            </p>
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
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === "all" ? "All Levels" : difficulty}
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
          {loading
            ? "Loading..."
            : `Showing ${filteredCourses.length} of ${allCourses.length} courses`}
        </p>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading courses...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">{"📖"}</div>
                  <Badge
                    className={getDifficultyColor(course.difficulty)}
                    variant="outline"
                  >
                    {course.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getCategoryColor(
                      course.category
                    )}`}
                  ></div>
                  <span className="text-sm text-muted-foreground">
                    {course.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {course.enrolled}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {course.duration}
                      </span>
                    </div>
                    <span className="font-medium text-success">
                      {course.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Instructor: {course.instructor}
                  </p>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleEnrollNow(course)}
                  >
                    Enroll Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(course)}
                  >
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredCourses.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find relevant
              courses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
