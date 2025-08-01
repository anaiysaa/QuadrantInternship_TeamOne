// components/lms/OnboardingTraining.js
// Fully corrected, copy-paste ready

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Award, 
  Mail, 
  ArrowLeft, 
  ArrowRight,
  Download,
  Users,
  Shield,
  Building,
  Scale,
  AlertCircle,
  Star
} from 'lucide-react';

const OnboardingTraining = ({ onBack }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({ suggestions: '', issues: '' });
  const [completedCourses, setCompletedCourses] = useState(new Set());
  const [allCoursesCompleted, setAllCoursesCompleted] = useState(false);
  const { toast } = useToast();

  // Training courses data
  const courses = [
    {
      id: 'dei',
      title: 'Diversity, Equity, and Inclusion (DEI) Training',
      icon: Users,
      duration: '45 minutes',
      description: 'Learn about creating an inclusive workplace environment that values diversity and promotes equity for all employees.',
      color: 'bg-blue-500',
      category: 'Workplace Culture'
    },
    {
      id: 'compliance',
      title: 'Compliance and Legal Training',
      icon: Scale,
      duration: '60 minutes',
      description: 'Understanding company policies, legal requirements, and regulatory compliance in the workplace.',
      color: 'bg-green-500',
      category: 'Legal & Compliance'
    },
    {
      id: 'security',
      title: 'IT Security and Cybersecurity Awareness',
      icon: Shield,
      duration: '50 minutes',
      description: 'Essential cybersecurity practices to protect company data and systems from threats.',
      color: 'bg-red-500',
      category: 'Information Security'
    },
    {
      id: 'culture',
      title: 'Company Orientation and Culture',
      icon: Building,
      duration: '40 minutes',
      description: 'Introduction to company values, mission, culture, and organizational structure.',
      color: 'bg-purple-500',
      category: 'Company Culture'
    }
  ];

  // Quiz questions for each course
  const quizQuestions = {
    dei: [
      {
        question: "What is the primary goal of DEI initiatives in the workplace?",
        options: [
          "To meet legal requirements only",
          "To create an inclusive environment where all employees can thrive",
          "To hire more diverse candidates",
          "To reduce workplace conflicts"
        ],
        correct: 1,
        explanation: "DEI initiatives aim to create an inclusive environment where all employees feel valued, respected, and able to contribute their best work."
      },
      {
        question: "Which of the following is an example of unconscious bias?",
        options: [
          "Deliberately excluding someone from a meeting",
          "Making assumptions about someone's abilities based on their appearance",
          "Openly discriminating against a colleague",
          "Following company diversity policies"
        ],
        correct: 1,
        explanation: "Unconscious bias refers to the implicit attitudes or stereotypes that affect our understanding and decision-making without our conscious awareness."
      },
      {
        question: "What should you do if you witness discriminatory behavior?",
        options: [
          "Ignore it if it doesn't affect you directly",
          "Report it through appropriate channels",
          "Confront the person publicly",
          "Discuss it with other colleagues first"
        ],
        correct: 1,
        explanation: "Discriminatory behavior should be reported through proper channels to ensure it's addressed appropriately and professionally."
      },
      {
        question: "Which term best describes treating everyone fairly regardless of their differences?",
        options: [
          "Equality",
          "Diversity",
          "Equity",
          "Inclusion"
        ],
        correct: 2,
        explanation: "Equity means providing fair treatment, opportunities, and advancement while striving to identify and eliminate barriers that prevent full participation."
      },
      {
        question: "What is the benefit of having diverse teams?",
        options: [
          "It looks good for company marketing",
          "Improved problem-solving and innovation",
          "It's required by law",
          "Reduced training costs"
        ],
        correct: 1,
        explanation: "Diverse teams bring different perspectives, experiences, and ideas that lead to better problem-solving, creativity, and innovation."
      }
    ],
    compliance: [
      {
        question: "What should you do if you're unsure about a company policy?",
        options: [
          "Ask your supervisor or HR department",
          "Make your best guess",
          "Follow what others are doing",
          "Ignore it until someone corrects you"
        ],
        correct: 0,
        explanation: "When unsure about policies, always seek clarification from your supervisor or HR department to ensure compliance."
      },
      {
        question: "Which of the following is considered confidential information?",
        options: [
          "Your lunch plans",
          "Customer data and financial records",
          "Office supply inventory",
          "Meeting room schedules"
        ],
        correct: 1,
        explanation: "Customer data, financial records, and other sensitive business information must be kept confidential and protected."
      },
      {
        question: "What is the purpose of anti-harassment policies?",
        options: [
          "To limit employee interactions",
          "To create a safe and respectful workplace",
          "To avoid legal paperwork",
          "To reduce company liability only"
        ],
        correct: 1,
        explanation: "Anti-harassment policies are designed to create and maintain a safe, respectful workplace for all employees."
      },
      {
        question: "When can you share company proprietary information?",
        options: [
          "During casual conversations with friends",
          "Only when authorized and necessary for business purposes",
          "At industry conferences",
          "On social media platforms"
        ],
        correct: 1,
        explanation: "Proprietary information should only be shared when specifically authorized and necessary for legitimate business purposes."
      },
      {
        question: "What should you do if you receive a gift from a vendor?",
        options: [
          "Accept it gratefully",
          "Check company policy on gifts and conflicts of interest",
          "Share it with your team",
          "Return it immediately"
        ],
        correct: 1,
        explanation: "Always check company policies regarding gifts from vendors, as these may create conflicts of interest or ethical concerns."
      }
    ],
    security: [
      {
        question: "What makes a strong password?",
        options: [
          "Your birthday and name",
          "A combination of letters, numbers, and special characters",
          "A simple word that's easy to remember",
          "The same password you use everywhere"
        ],
        correct: 1,
        explanation: "Strong passwords should include a mix of uppercase and lowercase letters, numbers, and special characters, and be unique for each account."
      },
      {
        question: "What should you do if you receive a suspicious email?",
        options: [
          "Click on links to investigate",
          "Forward it to all your colleagues",
          "Report it to IT security and delete it",
          "Reply asking for more information"
        ],
        correct: 2,
        explanation: "Suspicious emails should be reported to IT security immediately and not interacted with to prevent potential security breaches."
      },
      {
        question: "When should you lock your computer screen?",
        options: [
          "Only at the end of the workday",
          "Every time you step away from your desk",
          "Only when working with sensitive data",
          "When your supervisor asks you to"
        ],
        correct: 1,
        explanation: "You should lock your screen every time you step away from your computer to prevent unauthorized access to company systems and data."
      },
      {
        question: "What is phishing?",
        options: [
          "A type of computer virus",
          "Fraudulent attempts to obtain sensitive information",
          "A software update process",
          "A network security protocol"
        ],
        correct: 1,
        explanation: "Phishing is a fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity in electronic communications."
      },
      {
        question: "How should you handle sensitive company data?",
        options: [
          "Share it freely with anyone who asks",
          "Store it on personal devices for easy access",
          "Follow company data protection policies strictly",
          "Print copies for backup purposes"
        ],
        correct: 2,
        explanation: "Sensitive company data should always be handled according to established data protection policies to maintain security and compliance."
      }
    ],
    culture: [
      {
        question: "What is our company's primary mission?",
        options: [
          "To maximize profits only",
          "To provide exceptional service while fostering innovation and growth",
          "To be the largest company in the industry",
          "To minimize operational costs"
        ],
        correct: 1,
        explanation: "Our mission focuses on delivering exceptional service to clients while creating an environment that fosters innovation and sustainable growth."
      },
      {
        question: "Which of the following best represents our company values?",
        options: [
          "Competition above collaboration",
          "Integrity, innovation, and teamwork",
          "Profit over people",
          "Individual success over team goals"
        ],
        correct: 1,
        explanation: "Our core values emphasize integrity in all dealings, innovation in problem-solving, and teamwork in achieving our goals."
      },
      {
        question: "How should you approach work-life balance at our company?",
        options: [
          "Work should always come first",
          "Personal life should never interfere with work",
          "Maintain a healthy balance that supports both productivity and well-being",
          "Work and personal life should be completely separate"
        ],
        correct: 2,
        explanation: "We support a healthy work-life balance that enables employees to be productive while maintaining their personal well-being."
      },
      {
        question: "What is the best way to handle conflicts with colleagues?",
        options: [
          "Avoid the person causing conflict",
          "Address issues directly and respectfully, seeking mediation if needed",
          "Complain to other colleagues about the issue",
          "Wait for the problem to resolve itself"
        ],
        correct: 1,
        explanation: "Conflicts should be addressed directly and respectfully, with mediation sought when necessary to maintain a positive work environment."
      },
      {
        question: "How does our company support professional development?",
        options: [
          "Employees are expected to develop skills on their own time",
          "Through training programs, mentorship, and learning opportunities",
          "Only senior employees receive development support",
          "Professional development is not a company priority"
        ],
        correct: 1,
        explanation: "We actively support professional development through various training programs, mentorship opportunities, and continuous learning initiatives."
      }
    ]
  };

  // Contact information
  const contacts = [
    { department: 'Learning & Development', email: 'learning@company.com', icon: BookOpen },
    { department: 'Human Resources', email: 'hr@company.com', icon: Users },
    { department: 'IT Support', email: 'techsupport@company.com', icon: Shield }
  ];

  // Shuffle array function for randomizing answers
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get shuffled options for a question
  const getShuffledOptions = (question, questionIndex) => {
    if (!selectedCourse) return [];
    const cacheKey = `${selectedCourse.id}-${questionIndex}`;
    if (!window.shuffledOptionsCache) {
      window.shuffledOptionsCache = {};
    }
    if (!window.shuffledOptionsCache[cacheKey]) {
      const options = question.options.map((option, index) => ({ option, originalIndex: index }));
      const shuffled = shuffleArray(options);
      window.shuffledOptionsCache[cacheKey] = shuffled;
    }
    return window.shuffledOptionsCache[cacheKey];
  };

  const startCourse = (course) => {
    setSelectedCourse(course);
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizComplete(false);
    setQuizResults(null);
    setShowSurvey(false);
    // Clear cache for this course
    if (window.shuffledOptionsCache) {
      Object.keys(window.shuffledOptionsCache).forEach(key => {
        if (key.startsWith(course.id)) {
          delete window.shuffledOptionsCache[key];
        }
      });
    }
  };

  const handleAnswerSelect = (optionIndex, originalIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: { selected: optionIndex, original: originalIndex }
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions[selectedCourse.id].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeQuiz = () => {
    const questions = quizQuestions[selectedCourse.id];
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer && userAnswer.original === question.correct) {
        correct++;
      }
    });
    const score = (correct / questions.length) * 100;
    const passed = score >= 80;
    setQuizResults({
      score,
      correct,
      total: questions.length,
      passed
    });
    setQuizComplete(true);

    if (passed) {
      toast({
        title: "Congratulations!",
        description: `You passed ${selectedCourse.title} with ${score.toFixed(0)}%`,
      });
    } else {
      toast({
        title: "Quiz Incomplete",
        description: `You need 80% to pass. You scored ${score.toFixed(0)}%. Please retake the quiz.`,
        variant: "destructive"
      });
    }
  };

  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizComplete(false);
    setQuizResults(null);
    setShowSurvey(false);
    // Clear cache for this course
    if (window.shuffledOptionsCache) {
      Object.keys(window.shuffledOptionsCache).forEach(key => {
        if (key.startsWith(selectedCourse.id)) {
          delete window.shuffledOptionsCache[key];
        }
      });
    }
  };

  const completeCourse = () => {
    setCompletedCourses(prev => new Set([...prev, selectedCourse.id]));
    setShowSurvey(true);
    // Mock: Log completion data (in real app, this would go to backend)
    const completionData = {
      userId: 'current-user-id',
      courseId: selectedCourse.id,
      score: quizResults.score,
      passed: quizResults.passed,
      timestamp: new Date().toISOString()
    };
    console.log('Course completion logged:', completionData);
  };

  const submitSurvey = () => {
    console.log('Survey submitted:', surveyData);
    toast({
      title: "Survey Submitted",
      description: "Thank you for your feedback!",
    });
    setSelectedCourse(null);
    setSurveyData({ suggestions: '', issues: '' });
  };

  useEffect(() => {
    setAllCoursesCompleted(completedCourses.size === courses.length);
  }, [completedCourses]);

  const generateCertificate = () => {
    toast({
      title: "Certificate Generated",
      description: "Your completion certificate has been generated and will be downloaded shortly.",
    });
    // Mock certificate generation
    console.log('Certificate generated for all courses');
  };

  if (selectedCourse) {
    if (showSurvey) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Course Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your feedback helps us improve our training programs.
              </p>
              <div className="space-y-2">
                <Label htmlFor="suggestions">Suggestions for improvement:</Label>
                <Textarea
                  id="suggestions"
                  placeholder="What would make this course better?"
                  value={surveyData.suggestions}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, suggestions: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issues">Any issues encountered:</Label>
                <Textarea
                  id="issues"
                  placeholder="Did you experience any technical or content issues?"
                  value={surveyData.issues}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, issues: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={submitSurvey} className="flex-1">
                  Submit Feedback
                </Button>
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (quizComplete) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {quizResults.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span>Quiz Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className={`text-6xl font-bold ${quizResults.passed ? 'text-green-500' : 'text-red-500'}`}>
                  {quizResults.score.toFixed(0)}%
                </div>
                <div className="space-y-1">
                  <p className="text-lg">
                    You answered {quizResults.correct} out of {quizResults.total} questions correctly
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quizResults.passed ? 'Congratulations! You passed the quiz.' : 'You need 80% to pass. Please try again.'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                {quizResults.passed ? (
                  <Button onClick={completeCourse} className="flex-1">
                    Complete Course
                  </Button>
                ) : (
                  <Button onClick={retakeQuiz} className="flex-1">
                    Retake Quiz
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                  Back to Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    // Quiz interface
    const questions = quizQuestions[selectedCourse.id];
    const currentQ = questions[currentQuestion];
    const shuffledOptions = getShuffledOptions(currentQ, currentQuestion);
    const userAnswer = userAnswers[currentQuestion];
    const IconComponent = selectedCourse.icon;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedCourse(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconComponent className="w-5 h-5" />
              <span>{selectedCourse.title}</span>
            </CardTitle>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium leading-relaxed">
                {currentQ.question}
              </h3>
              <RadioGroup
                value={userAnswer?.selected?.toString() || ''}
                onValueChange={(value) => {
                  const selectedOption = shuffledOptions[parseInt(value)];
                  handleAnswerSelect(parseInt(value), selectedOption.originalIndex);
                }}
                className="space-y-3"
              >
                {shuffledOptions.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer leading-relaxed"
                    >
                      {item.option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={nextQuestion}
                disabled={!userAnswer}
              >
                {currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main course listing
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onboarding Training</h1>
          <p className="text-muted-foreground">Complete all required training courses to finish your onboarding</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to LMS
        </Button>
      </div>
      {/* Zero Tolerance Policy Notice */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Company Policy Notice</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Our company maintains a zero-tolerance policy for harassment, discrimination, and workplace misconduct. 
                These training courses outline our commitment to maintaining a safe, inclusive, and professional work environment for all employees.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Training Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{completedCourses.size} of {courses.length} completed</span>
            </div>
            <Progress value={(completedCourses.size / courses.length) * 100} className="h-2" />
            {allCoursesCompleted && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-green-600 font-medium">All courses completed!</span>
                <Button onClick={generateCertificate} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const isCompleted = completedCourses.has(course.id);
          const IconComponent = course.icon;
          return (
            <Card key={course.id} className={`transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${course.color} text-white`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      </div>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
                <Button 
                  onClick={() => startCourse(course)} 
                  className="w-full"
                  variant={isCompleted ? "outline" : "default"}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {isCompleted ? 'Retake Course' : 'Start Course'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contacts.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <IconComponent className="w-5 h-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{contact.department}</p>
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="text-sm text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTraining;
