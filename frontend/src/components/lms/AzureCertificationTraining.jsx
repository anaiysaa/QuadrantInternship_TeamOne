import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Cloud,
  Settings,
  CheckCircle,
  Clock,
  Award,
  ArrowLeft,
  ArrowRight,
  Download,
  AlertCircle,
  Star,
  Monitor,
  Database,
  Shield,
  Zap,
  GitBranch,
  Server,
} from "lucide-react";

const AzureCertificationTraining = ({ onBack }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({ suggestions: "", issues: "" });
  const [completedCourses, setCompletedCourses] = useState(new Set());
  const [showCourseOverview, setShowCourseOverview] = useState(false);
  const { toast } = useToast();

  // Azure certification courses data
  const courses = [
    {
      id: "az-104",
      title: "Microsoft Certified: Azure Administrator Associate (AZ-104)",
      icon: Cloud,
      duration: "8-10 hours",
      description:
        "Master Azure administration skills including managing subscriptions, implementing storage solutions, and configuring virtual networks.",
      color: "bg-blue-500",
      category: "Azure Administration",
      overview: {
        summary:
          "The Azure Administrator Associate certification validates your expertise in implementing, managing, and monitoring Microsoft Azure environments. This comprehensive course covers all essential topics needed to pass the AZ-104 exam.",
        objectives: [
          "Manage Azure identities and governance",
          "Implement and manage storage solutions",
          "Deploy and manage Azure compute resources",
          "Configure and manage virtual networking",
          "Monitor and back up Azure resources",
        ],
        relevance:
          "This certification is essential for IT professionals managing Azure cloud infrastructure and demonstrates proficiency in Azure administration tasks.",
      },
    },
    {
      id: "az-400",
      title: "AZ-400: Designing and Implementing Microsoft DevOps Solutions",
      icon: GitBranch,
      duration: "10-12 hours",
      description:
        "Learn to design and implement DevOps practices using Azure DevOps, including CI/CD pipelines, infrastructure as code, and monitoring strategies.",
      color: "bg-purple-500",
      category: "DevOps Engineering",
      overview: {
        summary:
          "The AZ-400 certification validates your ability to design and implement DevOps practices for version control, compliance, infrastructure, configuration management, and monitoring using Azure technologies.",
        objectives: [
          "Develop an instrumentation strategy",
          "Develop a Site Reliability Engineering (SRE) strategy",
          "Develop a security and compliance plan",
          "Manage source control and facilitate communication",
          "Design and implement build and release pipelines",
        ],
        relevance:
          "This certification is crucial for DevOps engineers and developers working with Azure DevOps tools and implementing continuous integration and delivery practices.",
      },
    },
  ];

  // Comprehensive quiz questions for AZ-104
  const az104Questions = [
    {
      question:
        "Which Azure service provides centralized identity and access management?",
      options: [
        "Azure Active Directory",
        "Azure Key Vault",
        "Azure Policy",
        "Azure Monitor",
      ],
      correct: 0,
      explanation:
        "Azure Active Directory (Azure AD) is Microsoft's cloud-based identity and access management service that provides centralized authentication and authorization.",
    },
    {
      question:
        "What is the maximum number of storage accounts you can create per Azure subscription by default?",
      options: ["100", "200", "250", "500"],
      correct: 2,
      explanation:
        "By default, you can create up to 250 storage accounts per region per subscription. This limit can be increased by contacting Azure support.",
    },
    {
      question:
        "Which Azure storage replication option provides the highest durability?",
      options: [
        "LRS (Locally Redundant Storage)",
        "ZRS (Zone Redundant Storage)",
        "GRS (Geo-Redundant Storage)",
        "RA-GRS (Read-Access Geo-Redundant Storage)",
      ],
      correct: 3,
      explanation:
        "RA-GRS provides the highest durability by replicating data to a secondary region and allowing read access to the secondary location.",
    },
    {
      question:
        "What is the purpose of Azure Resource Manager (ARM) templates?",
      options: [
        "Monitor resource performance",
        "Define infrastructure as code",
        "Manage user access",
        "Configure network security",
      ],
      correct: 1,
      explanation:
        "ARM templates are JSON files that define the infrastructure and configuration for Azure resources, enabling infrastructure as code practices.",
    },
    {
      question:
        "Which Azure compute service automatically scales based on demand?",
      options: [
        "Azure Virtual Machines",
        "Azure Container Instances",
        "Azure App Service",
        "Azure Batch",
      ],
      correct: 2,
      explanation:
        "Azure App Service can automatically scale based on various metrics like CPU usage, memory usage, or custom metrics.",
    },
    {
      question: "What is the maximum size for a single Azure Disk?",
      options: ["1 TB", "4 TB", "8 TB", "32 TB"],
      correct: 3,
      explanation:
        "Azure managed disks can be up to 32 TB in size for premium SSD and standard SSD/HDD disks.",
    },
    {
      question: "Which Azure service is used for DNS management?",
      options: [
        "Azure DNS",
        "Azure Traffic Manager",
        "Azure Load Balancer",
        "Azure Application Gateway",
      ],
      correct: 0,
      explanation:
        "Azure DNS is a hosting service for DNS domains that provides name resolution using Microsoft Azure infrastructure.",
    },
    {
      question: "What is the purpose of Azure Virtual Network (VNet) peering?",
      options: [
        "Load balancing",
        "Connecting virtual networks",
        "DNS resolution",
        "Network security",
      ],
      correct: 1,
      explanation:
        "VNet peering connects two virtual networks, enabling resources in either network to communicate with each other.",
    },
    {
      question:
        "Which Azure monitoring service provides application performance monitoring?",
      options: [
        "Azure Monitor",
        "Azure Application Insights",
        "Azure Log Analytics",
        "Azure Service Health",
      ],
      correct: 1,
      explanation:
        "Azure Application Insights is a feature of Azure Monitor that provides application performance monitoring for web applications.",
    },
    {
      question:
        "What is the default backup retention period for Azure VM backups?",
      options: ["7 days", "30 days", "90 days", "180 days"],
      correct: 1,
      explanation:
        "The default retention period for Azure VM backups is 30 days, though this can be configured based on your requirements.",
    },
    {
      question:
        "Which Azure service provides distributed denial-of-service (DDoS) protection?",
      options: [
        "Azure Firewall",
        "Azure DDoS Protection",
        "Azure Security Center",
        "Azure Sentinel",
      ],
      correct: 1,
      explanation:
        "Azure DDoS Protection provides enhanced DDoS mitigation capabilities to protect applications against DDoS attacks.",
    },
    {
      question:
        "What is the maximum number of virtual machines you can have in an availability set?",
      options: ["99", "100", "199", "200"],
      correct: 2,
      explanation:
        "An availability set can contain up to 199 virtual machines to ensure high availability and fault tolerance.",
    },
    {
      question:
        "Which Azure storage tier offers the lowest cost for long-term archival?",
      options: ["Hot", "Cool", "Archive", "Premium"],
      correct: 2,
      explanation:
        "Archive tier offers the lowest storage cost but with higher access costs and longer access times, making it ideal for long-term archival.",
    },
    {
      question: "What is the purpose of Azure Policy?",
      options: [
        "Monitor performance",
        "Enforce compliance",
        "Manage identities",
        "Configure networking",
      ],
      correct: 1,
      explanation:
        "Azure Policy helps enforce organizational standards and assess compliance at scale by evaluating Azure resources.",
    },
    {
      question: "Which Azure service provides container orchestration?",
      options: [
        "Azure Container Instances",
        "Azure Kubernetes Service",
        "Azure Service Fabric",
        "Azure Batch",
      ],
      correct: 1,
      explanation:
        "Azure Kubernetes Service (AKS) provides managed Kubernetes container orchestration service.",
    },
    {
      question:
        "What is the maximum number of NICs that can be attached to a virtual machine?",
      options: ["Depends on VM size", "4", "8", "16"],
      correct: 0,
      explanation:
        "The maximum number of NICs depends on the VM size. Smaller VMs support fewer NICs, while larger VMs can support more.",
    },
    {
      question: "Which Azure service provides serverless computing?",
      options: [
        "Azure App Service",
        "Azure Functions",
        "Azure Logic Apps",
        "All of the above",
      ],
      correct: 3,
      explanation:
        "Azure Functions, Logic Apps, and certain App Service plans all provide serverless computing capabilities.",
    },
    {
      question: "What is the purpose of Azure Bastion?",
      options: [
        "Load balancing",
        "Secure RDP/SSH access",
        "DNS resolution",
        "Content delivery",
      ],
      correct: 1,
      explanation:
        "Azure Bastion provides secure and seamless RDP/SSH connectivity to virtual machines directly through the Azure portal.",
    },
    {
      question: "Which Azure service is used for hybrid cloud connectivity?",
      options: ["ExpressRoute", "VPN Gateway", "Azure Arc", "All of the above"],
      correct: 3,
      explanation:
        "ExpressRoute provides private connectivity, VPN Gateway provides secure site-to-site connections, and Azure Arc extends Azure management to hybrid environments.",
    },
    {
      question: "What is the purpose of Azure Cost Management and Billing?",
      options: [
        "Performance monitoring",
        "Cost optimization",
        "Security management",
        "Resource deployment",
      ],
      correct: 1,
      explanation:
        "Azure Cost Management and Billing helps monitor, allocate, and optimize cloud costs across your Azure resources.",
    },
  ];

  // Comprehensive quiz questions for AZ-400
  const az400Questions = [
    {
      question:
        "What is the primary purpose of implementing Application Insights in a DevOps strategy?",
      options: [
        "Code deployment",
        "Performance monitoring and diagnostics",
        "Source control",
        "Infrastructure provisioning",
      ],
      correct: 1,
      explanation:
        "Application Insights provides application performance monitoring, diagnostics, and analytics to help understand application behavior and performance.",
    },
    {
      question:
        "Which Azure DevOps service is used for continuous integration and continuous deployment?",
      options: [
        "Azure Boards",
        "Azure Repos",
        "Azure Pipelines",
        "Azure Artifacts",
      ],
      correct: 2,
      explanation:
        "Azure Pipelines provides CI/CD capabilities to automatically build, test, and deploy code to any target environment.",
    },
    {
      question: "What is the purpose of Infrastructure as Code (IaC)?",
      options: [
        "Manual server configuration",
        "Automated infrastructure provisioning",
        "Application monitoring",
        "User access management",
      ],
      correct: 1,
      explanation:
        "Infrastructure as Code allows you to manage and provision infrastructure through code rather than manual processes, enabling consistency and repeatability.",
    },
    {
      question:
        "Which branching strategy is recommended for teams practicing continuous deployment?",
      options: [
        "Git Flow",
        "GitHub Flow",
        "Feature branching",
        "Release branching",
      ],
      correct: 1,
      explanation:
        "GitHub Flow is recommended for continuous deployment as it's simple, focuses on master branch, and supports frequent deployments.",
    },
    {
      question:
        "What is the primary benefit of implementing automated testing in CI/CD pipelines?",
      options: [
        "Faster development",
        "Early bug detection",
        "Reduced costs",
        "Better documentation",
      ],
      correct: 1,
      explanation:
        "Automated testing in CI/CD pipelines helps detect bugs early in the development process, reducing the cost and effort of fixing issues.",
    },
    {
      question:
        "Which Azure service provides container registry capabilities for DevOps workflows?",
      options: [
        "Azure Container Instances",
        "Azure Container Registry",
        "Azure Kubernetes Service",
        "Azure Service Fabric",
      ],
      correct: 1,
      explanation:
        "Azure Container Registry provides a managed Docker registry service for storing and managing container images.",
    },
    {
      question: "What is the purpose of feature flags in a DevOps environment?",
      options: [
        "Code versioning",
        "Conditional feature activation",
        "Performance monitoring",
        "Security scanning",
      ],
      correct: 1,
      explanation:
        "Feature flags allow you to enable or disable features at runtime without deploying new code, supporting safe deployments and A/B testing.",
    },
    {
      question:
        "Which tool is commonly used for configuration management in DevOps?",
      options: ["Ansible", "Terraform", "Docker", "Kubernetes"],
      correct: 0,
      explanation:
        "Ansible is a popular configuration management tool that automates software provisioning, configuration management, and application deployment.",
    },
    {
      question: "What is the concept of 'shift-left' in DevOps security?",
      options: [
        "Moving production left",
        "Early security integration",
        "Left-side deployment",
        "Code review process",
      ],
      correct: 1,
      explanation:
        "Shift-left refers to integrating security practices early in the development lifecycle rather than waiting until later stages.",
    },
    {
      question:
        "Which metric is most important for measuring Site Reliability Engineering (SRE) success?",
      options: [
        "Code quality",
        "Service Level Objectives (SLOs)",
        "Deployment frequency",
        "Team velocity",
      ],
      correct: 1,
      explanation:
        "Service Level Objectives (SLOs) are quantitative measures of service reliability and are fundamental to SRE practices.",
    },
    {
      question: "What is the purpose of Blue-Green deployment strategy?",
      options: [
        "A/B testing",
        "Zero-downtime deployments",
        "Cost optimization",
        "Security enhancement",
      ],
      correct: 1,
      explanation:
        "Blue-Green deployment maintains two identical production environments, allowing for zero-downtime deployments and quick rollbacks.",
    },
    {
      question: "Which Azure DevOps extension helps with dependency scanning?",
      options: ["SonarQube", "WhiteSource", "Checkmarx", "All of the above"],
      correct: 3,
      explanation:
        "All these tools can be integrated with Azure DevOps to provide dependency scanning and security vulnerability detection.",
    },
    {
      question:
        "What is the primary purpose of implementing monitoring and alerting in DevOps?",
      options: [
        "Cost tracking",
        "Proactive issue detection",
        "User management",
        "Code quality",
      ],
      correct: 1,
      explanation:
        "Monitoring and alerting help detect issues proactively, enabling faster response times and better system reliability.",
    },
    {
      question:
        "Which practice is essential for implementing effective disaster recovery in DevOps?",
      options: [
        "Manual backups",
        "Automated backup and recovery procedures",
        "Documentation only",
        "Local storage",
      ],
      correct: 1,
      explanation:
        "Automated backup and recovery procedures ensure consistent, reliable disaster recovery capabilities and reduce human error.",
    },
    {
      question:
        "What is the benefit of implementing continuous security scanning in CI/CD pipelines?",
      options: [
        "Faster deployments",
        "Early vulnerability detection",
        "Reduced infrastructure costs",
        "Better user experience",
      ],
      correct: 1,
      explanation:
        "Continuous security scanning helps identify vulnerabilities early in the development process, reducing security risks in production.",
    },
    {
      question: "Which Azure service helps implement policy as code?",
      options: [
        "Azure Policy",
        "Azure Blueprints",
        "Azure Resource Manager",
        "All of the above",
      ],
      correct: 3,
      explanation:
        "Azure Policy, Blueprints, and ARM templates all support policy as code implementations in different ways.",
    },
    {
      question: "What is the purpose of implementing canary deployments?",
      options: [
        "Cost reduction",
        "Risk mitigation during rollouts",
        "Performance improvement",
        "Security enhancement",
      ],
      correct: 1,
      explanation:
        "Canary deployments reduce risk by gradually rolling out changes to a small subset of users before full deployment.",
    },
    {
      question:
        "Which tool is commonly used for infrastructure provisioning in Azure DevOps?",
      options: ["Terraform", "ARM Templates", "Bicep", "All of the above"],
      correct: 3,
      explanation:
        "Terraform, ARM Templates, and Bicep are all used for infrastructure provisioning and can be integrated with Azure DevOps.",
    },
    {
      question:
        "What is the primary goal of implementing ChatOps in a DevOps environment?",
      options: [
        "Team communication",
        "Automated operations through chat",
        "Documentation",
        "Code review",
      ],
      correct: 1,
      explanation:
        "ChatOps integrates tools and automation into team chat platforms, enabling operations to be performed through conversation.",
    },
    {
      question: "Which practice helps ensure code quality in DevOps pipelines?",
      options: [
        "Code reviews",
        "Static code analysis",
        "Unit testing",
        "All of the above",
      ],
      correct: 3,
      explanation:
        "Code reviews, static analysis, and unit testing all contribute to maintaining high code quality in DevOps pipelines.",
    },
  ];

  const quizQuestions = {
    "az-104": az104Questions,
    "az-400": az400Questions,
  };

  // Utility functions
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getShuffledOptions = (question, questionIndex) => {
    const cacheKey = `${selectedCourse.id}-${questionIndex}`;
    if (!window.shuffledOptionsCache) {
      window.shuffledOptionsCache = {};
    }

    if (!window.shuffledOptionsCache[cacheKey]) {
      const options = question.options.map((option, index) => ({
        option,
        originalIndex: index,
      }));
      const shuffled = shuffleArray(options);
      window.shuffledOptionsCache[cacheKey] = shuffled;
    }

    return window.shuffledOptionsCache[cacheKey];
  };

  const startCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseOverview(true);
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizComplete(false);
    setQuizResults(null);
    setShowSurvey(false);
  };

  const startQuiz = () => {
    setShowCourseOverview(false);
    // Clear cache for this course
    if (window.shuffledOptionsCache) {
      Object.keys(window.shuffledOptionsCache).forEach((key) => {
        if (key.startsWith(selectedCourse.id)) {
          delete window.shuffledOptionsCache[key];
        }
      });
    }
  };

  const handleAnswerSelect = (optionIndex, originalIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: { selected: optionIndex, original: originalIndex },
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
      passed,
    });
    setQuizComplete(true);

    if (passed) {
      toast({
        title: "Congratulations!",
        description: `You passed ${selectedCourse.title} with ${score.toFixed(
          0
        )}%`,
      });
    } else {
      toast({
        title: "Quiz Incomplete",
        description: `You need 80% to pass. You scored ${score.toFixed(
          0
        )}%. Please retake the quiz.`,
        variant: "destructive",
      });
    }
  };

  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizComplete(false);
    setQuizResults(null);
    setShowSurvey(false);
    setShowCourseOverview(true);
  };

  const completeCourse = () => {
    setCompletedCourses((prev) => new Set([...prev, selectedCourse.id]));
    setShowSurvey(true);
  };

  const submitSurvey = () => {
    console.log("Survey submitted:", surveyData);
    toast({
      title: "Survey Submitted",
      description: "Thank you for your feedback!",
    });
    setSelectedCourse(null);
    setSurveyData({ suggestions: "", issues: "" });
  };

  // Course Overview Component
  if (selectedCourse && showCourseOverview) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedCourse(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{selectedCourse.duration}</span>
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <selectedCourse.icon className="w-6 h-6" />
              <span>{selectedCourse.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Course Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedCourse.overview.summary}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {selectedCourse.overview.objectives.map(
                    (objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Certification Relevance
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedCourse.overview.relevance}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Quiz Information
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This course includes a comprehensive quiz with 20
                      questions. You need to score 80% or higher to pass. Each
                      question includes detailed explanations to help you learn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={startQuiz} className="flex-1">
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                Back to Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Survey Component
  if (selectedCourse && showSurvey) {
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
              Your feedback helps us improve our certification training
              programs.
            </p>

            <div className="space-y-2">
              <Label htmlFor="suggestions">Suggestions for improvement:</Label>
              <Textarea
                id="suggestions"
                placeholder="What would make this course better?"
                value={surveyData.suggestions}
                onChange={(e) =>
                  setSurveyData((prev) => ({
                    ...prev,
                    suggestions: e.target.value,
                  }))
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues">Any issues encountered:</Label>
              <Textarea
                id="issues"
                placeholder="Did you experience any technical or content issues?"
                value={surveyData.issues}
                onChange={(e) =>
                  setSurveyData((prev) => ({ ...prev, issues: e.target.value }))
                }
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

  // Quiz Results Component
  if (selectedCourse && quizComplete) {
    const questions = quizQuestions[selectedCourse.id];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div
                className={`text-6xl font-bold ${
                  quizResults.passed ? "text-green-500" : "text-red-500"
                }`}
              >
                {quizResults.score.toFixed(0)}%
              </div>
              <div className="space-y-1">
                <p className="text-lg">
                  You answered {quizResults.correct} out of {quizResults.total}{" "}
                  questions correctly
                </p>
                <p className="text-sm text-muted-foreground">
                  {quizResults.passed
                    ? "Congratulations! You passed the certification quiz."
                    : "You need 80% to pass. Please try again."}
                </p>
              </div>
            </div>

            {/* Detailed Answer Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Answer Review</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((question, index) => {
                  const userAnswer = userAnswers[index];
                  const isCorrect =
                    userAnswer && userAnswer.original === question.correct;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isCorrect
                          ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                          : "border-red-200 bg-red-50 dark:bg-red-950/20"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {question.question}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Correct answer:{" "}
                              {question.options[question.correct]}
                            </p>
                            {userAnswer &&
                              userAnswer.original !== question.correct && (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                  Your answer:{" "}
                                  {question.options[userAnswer.original]}
                                </p>
                              )}
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

  // Quiz Interface
  if (selectedCourse && !showCourseOverview) {
    const questions = quizQuestions[selectedCourse.id];
    const currentQ = questions[currentQuestion];
    const shuffledOptions = getShuffledOptions(currentQ, currentQuestion);
    const userAnswer = userAnswers[currentQuestion];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowCourseOverview(true)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <selectedCourse.icon className="w-5 h-5" />
              <span>{selectedCourse.title}</span>
            </CardTitle>
            <Progress
              value={((currentQuestion + 1) / questions.length) * 100}
              className="h-2"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium leading-relaxed">
                {currentQ.question}
              </h3>

              <RadioGroup
                value={userAnswer?.selected?.toString() || ""}
                onValueChange={(value) => {
                  const selectedOption = shuffledOptions[parseInt(value)];
                  handleAnswerSelect(
                    parseInt(value),
                    selectedOption.originalIndex
                  );
                }}
                className="space-y-3"
              >
                {shuffledOptions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className="mt-1"
                    />
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
              <Button onClick={nextQuestion} disabled={!userAnswer}>
                {currentQuestion === questions.length - 1
                  ? "Submit Quiz"
                  : "Next"}
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
          <h1 className="text-2xl font-bold">Azure Certification Training</h1>
          <p className="text-muted-foreground">
            Microsoft Azure certification courses with interactive quizzes
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to LMS
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Certification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">
                {completedCourses.size} of {courses.length} completed
              </span>
            </div>
            <Progress
              value={(completedCourses.size / courses.length) * 100}
              className="h-2"
            />
            {completedCourses.size === courses.length && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-green-600 font-medium">
                  All certifications completed!
                </span>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificates
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => {
          const isCompleted = completedCourses.has(course.id);
          const IconComponent = course.icon;

          return (
            <Card
              key={course.id}
              className={`transition-all hover:shadow-md ${
                isCompleted
                  ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-3 rounded-lg ${course.color} text-white`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg leading-tight">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {course.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="flex flex-col items-center space-y-1">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <Badge variant="outline" className="text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Certified
                      </Badge>
                    </div>
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
                  {isCompleted ? "Review Course" : "Start Course"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AzureCertificationTraining;
