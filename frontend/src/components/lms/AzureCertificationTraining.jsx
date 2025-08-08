import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  Lock,
  Timer,
  AlertTriangle
} from 'lucide-react';

const AzureCertificationTraining = ({ onBack }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({ suggestions: '', issues: '' });
  const [completedCourses, setCompletedCourses] = useState(new Set());
  const [showCourseOverview, setShowCourseOverview] = useState(false);
  
  // Security features state
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(120); // 2 minutes per question
  const [overallTimer, setOverallTimer] = useState(2400); // 40 minutes total
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [securityViolations, setSecurityViolations] = useState([]);
  const [sessionData, setSessionData] = useState({
    ip: null,
    userAgent: null,
    startTime: null,
    deviceInfo: null
  });
  const [auditLog, setAuditLog] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [adminApproval, setAdminApproval] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [maxTabSwitches] = useState(2); // Maximum allowed tab switches
  
  const questionTimerRef = useRef(null);
  const overallTimerRef = useRef(null);
  const fullscreenRef = useRef(null);
  
  const { toast } = useToast();

  // Azure certification courses data
  const courses = [
    {
      id: 'az-104',
      title: 'Microsoft Certified: Azure Administrator Associate (AZ-104)',
      icon: Cloud,
      duration: '8-10 hours',
      description: 'Master Azure administration skills including managing subscriptions, implementing storage solutions, and configuring virtual networks.',
      color: 'bg-blue-500',
      category: 'Azure Administration',
      overview: {
        summary: 'The Azure Administrator Associate certification validates your expertise in implementing, managing, and monitoring Microsoft Azure environments. This comprehensive course covers all essential topics needed to pass the AZ-104 exam.',
        objectives: [
          'Manage Azure identities and governance',
          'Implement and manage storage solutions',
          'Deploy and manage Azure compute resources',
          'Configure and manage virtual networking',
          'Monitor and back up Azure resources'
        ],
        relevance: 'This certification is essential for IT professionals managing Azure cloud infrastructure and demonstrates proficiency in Azure administration tasks.'
      }
    },
    {
      id: 'az-400',
      title: 'AZ-400: Designing and Implementing Microsoft DevOps Solutions',
      icon: GitBranch,
      duration: '10-12 hours',
      description: 'Learn to design and implement DevOps practices using Azure DevOps, including CI/CD pipelines, infrastructure as code, and monitoring strategies.',
      color: 'bg-purple-500',
      category: 'DevOps Engineering',
      overview: {
        summary: 'The AZ-400 certification validates your ability to design and implement DevOps practices for version control, compliance, infrastructure, configuration management, and monitoring using Azure technologies.',
        objectives: [
          'Develop an instrumentation strategy',
          'Develop a Site Reliability Engineering (SRE) strategy',
          'Develop a security and compliance plan',
          'Manage source control and facilitate communication',
          'Design and implement build and release pipelines'
        ],
        relevance: 'This certification is crucial for DevOps engineers and developers working with Azure DevOps tools and implementing continuous integration and delivery practices.'
      }
    }
  ];

  // Expanded question pools for random selection (30-40 questions per course)
  const az104QuestionPool = [
    {
      question: "Which Azure service provides centralized identity and access management?",
      options: ["Azure Active Directory", "Azure Key Vault", "Azure Policy", "Azure Monitor"],
      correct: 0,
      explanation: "Azure Active Directory (Azure AD) is Microsoft's cloud-based identity and access management service that provides centralized authentication and authorization."
    },
    {
      question: "What is the maximum number of storage accounts you can create per Azure subscription by default?",
      options: ["100", "200", "250", "500"],
      correct: 2,
      explanation: "By default, you can create up to 250 storage accounts per region per subscription. This limit can be increased by contacting Azure support."
    },
    {
      question: "Which Azure storage replication option provides the highest durability?",
      options: ["LRS (Locally Redundant Storage)", "ZRS (Zone Redundant Storage)", "GRS (Geo-Redundant Storage)", "RA-GRS (Read-Access Geo-Redundant Storage)"],
      correct: 3,
      explanation: "RA-GRS provides the highest durability by replicating data to a secondary region and allowing read access to the secondary location."
    },
    {
      question: "What is the purpose of Azure Resource Manager (ARM) templates?",
      options: ["Monitor resource performance", "Define infrastructure as code", "Manage user access", "Configure network security"],
      correct: 1,
      explanation: "ARM templates are JSON files that define the infrastructure and configuration for Azure resources, enabling infrastructure as code practices."
    },
    {
      question: "Which Azure compute service automatically scales based on demand?",
      options: ["Azure Virtual Machines", "Azure Container Instances", "Azure App Service", "Azure Batch"],
      correct: 2,
      explanation: "Azure App Service can automatically scale based on various metrics like CPU usage, memory usage, or custom metrics."
    },
    {
      question: "What is the maximum size for a single Azure Disk?",
      options: ["1 TB", "4 TB", "8 TB", "32 TB"],
      correct: 3,
      explanation: "Azure managed disks can be up to 32 TB in size for premium SSD and standard SSD/HDD disks."
    },
    {
      question: "Which Azure service is used for DNS management?",
      options: ["Azure DNS", "Azure Traffic Manager", "Azure Load Balancer", "Azure Application Gateway"],
      correct: 0,
      explanation: "Azure DNS is a hosting service for DNS domains that provides name resolution using Microsoft Azure infrastructure."
    },
    {
      question: "What is the purpose of Azure Virtual Network (VNet) peering?",
      options: ["Load balancing", "Connecting virtual networks", "DNS resolution", "Network security"],
      correct: 1,
      explanation: "VNet peering connects two virtual networks, enabling resources in either network to communicate with each other."
    },
    {
      question: "Which Azure monitoring service provides application performance monitoring?",
      options: ["Azure Monitor", "Azure Application Insights", "Azure Log Analytics", "Azure Service Health"],
      correct: 1,
      explanation: "Azure Application Insights is a feature of Azure Monitor that provides application performance monitoring for web applications."
    },
    {
      question: "What is the default backup retention period for Azure VM backups?",
      options: ["7 days", "30 days", "90 days", "180 days"],
      correct: 1,
      explanation: "The default retention period for Azure VM backups is 30 days, though this can be configured based on your requirements."
    },
    {
      question: "Which Azure service provides distributed denial-of-service (DDoS) protection?",
      options: ["Azure Firewall", "Azure DDoS Protection", "Azure Security Center", "Azure Sentinel"],
      correct: 1,
      explanation: "Azure DDoS Protection provides enhanced DDoS mitigation capabilities to protect applications against DDoS attacks."
    },
    {
      question: "What is the maximum number of virtual machines you can have in an availability set?",
      options: ["99", "100", "199", "200"],
      correct: 2,
      explanation: "An availability set can contain up to 199 virtual machines to ensure high availability and fault tolerance."
    },
    {
      question: "Which Azure storage tier offers the lowest cost for long-term archival?",
      options: ["Hot", "Cool", "Archive", "Premium"],
      correct: 2,
      explanation: "Archive tier offers the lowest storage cost but with higher access costs and longer access times, making it ideal for long-term archival."
    },
    {
      question: "What is the purpose of Azure Policy?",
      options: ["Monitor performance", "Enforce compliance", "Manage identities", "Configure networking"],
      correct: 1,
      explanation: "Azure Policy helps enforce organizational standards and assess compliance at scale by evaluating Azure resources."
    },
    {
      question: "Which Azure service provides container orchestration?",
      options: ["Azure Container Instances", "Azure Kubernetes Service", "Azure Service Fabric", "Azure Batch"],
      correct: 1,
      explanation: "Azure Kubernetes Service (AKS) provides managed Kubernetes container orchestration service."
    },
    {
      question: "What is the maximum number of NICs that can be attached to a virtual machine?",
      options: ["Depends on VM size", "4", "8", "16"],
      correct: 0,
      explanation: "The maximum number of NICs depends on the VM size. Smaller VMs support fewer NICs, while larger VMs can support more."
    },
    {
      question: "Which Azure service provides serverless computing?",
      options: ["Azure App Service", "Azure Functions", "Azure Logic Apps", "All of the above"],
      correct: 3,
      explanation: "Azure Functions, Logic Apps, and certain App Service plans all provide serverless computing capabilities."
    },
    {
      question: "What is the purpose of Azure Bastion?",
      options: ["Load balancing", "Secure RDP/SSH access", "DNS resolution", "Content delivery"],
      correct: 1,
      explanation: "Azure Bastion provides secure and seamless RDP/SSH connectivity to virtual machines directly through the Azure portal."
    },
    {
      question: "Which Azure service is used for hybrid cloud connectivity?",
      options: ["ExpressRoute", "VPN Gateway", "Azure Arc", "All of the above"],
      correct: 3,
      explanation: "ExpressRoute provides private connectivity, VPN Gateway provides secure site-to-site connections, and Azure Arc extends Azure management to hybrid environments."
    },
    {
      question: "What is the purpose of Azure Cost Management and Billing?",
      options: ["Performance monitoring", "Cost optimization", "Security management", "Resource deployment"],
      correct: 1,
      explanation: "Azure Cost Management and Billing helps monitor, allocate, and optimize cloud costs across your Azure resources."
    },
    // Additional 10 questions to reach 30 total
    {
      question: "What is the maximum number of Azure subscriptions that can be associated with a single Azure AD tenant?",
      options: ["Unlimited", "100", "1000", "10000"],
      correct: 0,
      explanation: "There is no limit to the number of Azure subscriptions that can be associated with a single Azure AD tenant."
    },
    {
      question: "Which Azure service provides network-level protection against DDoS attacks?",
      options: ["Azure Firewall", "Azure Front Door", "Azure DDoS Protection Basic", "Network Security Groups"],
      correct: 2,
      explanation: "Azure DDoS Protection Basic is automatically enabled for all Azure resources and provides network-level protection."
    },
    {
      question: "What is the purpose of Azure Blueprints?",
      options: ["Monitor resources", "Deploy governance artifacts", "Manage costs", "Configure networks"],
      correct: 1,
      explanation: "Azure Blueprints enable cloud architects to define a repeatable set of Azure resources that implements organizational standards."
    },
    {
      question: "Which Azure service provides content delivery network (CDN) capabilities?",
      options: ["Azure Front Door", "Azure CDN", "Azure Traffic Manager", "Both A and B"],
      correct: 3,
      explanation: "Both Azure Front Door and Azure CDN provide content delivery network capabilities with different features."
    },
    {
      question: "What is the maximum duration for an Azure VM backup retention?",
      options: ["1 year", "10 years", "99 years", "Unlimited"],
      correct: 2,
      explanation: "Azure VM backup retention can be configured for up to 99 years for yearly backups."
    },
    {
      question: "Which Azure service provides automated patching for virtual machines?",
      options: ["Azure Update Management", "Azure Automation", "Azure Security Center", "All of the above"],
      correct: 3,
      explanation: "All these services provide different aspects of automated patching and update management for VMs."
    },
    {
      question: "What is the purpose of Azure Private Link?",
      options: ["VPN connectivity", "Private network access to Azure services", "DNS resolution", "Load balancing"],
      correct: 1,
      explanation: "Azure Private Link provides private network access to Azure services over a private endpoint."
    },
    {
      question: "Which Azure storage account type supports both Standard and Premium performance tiers?",
      options: ["General Purpose v1", "General Purpose v2", "Blob Storage", "Block Blob Storage"],
      correct: 1,
      explanation: "General Purpose v2 storage accounts support both Standard and Premium performance tiers."
    },
    {
      question: "What is the maximum number of rules that can be configured in a Network Security Group?",
      options: ["100", "200", "1000", "4096"],
      correct: 2,
      explanation: "A Network Security Group can have up to 1000 security rules configured."
    },
    {
      question: "Which Azure service provides database-as-a-service for MySQL?",
      options: ["Azure SQL Database", "Azure Database for MySQL", "Azure Cosmos DB", "Azure Synapse"],
      correct: 1,
      explanation: "Azure Database for MySQL provides fully managed MySQL database-as-a-service."
    }
  ];

  const az400QuestionPool = [
    {
      question: "What is the primary purpose of implementing Application Insights in a DevOps strategy?",
      options: ["Code deployment", "Performance monitoring and diagnostics", "Source control", "Infrastructure provisioning"],
      correct: 1,
      explanation: "Application Insights provides application performance monitoring, diagnostics, and analytics to help understand application behavior and performance."
    },
    {
      question: "Which Azure DevOps service is used for continuous integration and continuous deployment?",
      options: ["Azure Boards", "Azure Repos", "Azure Pipelines", "Azure Artifacts"],
      correct: 2,
      explanation: "Azure Pipelines provides CI/CD capabilities to automatically build, test, and deploy code to any target environment."
    },
    {
      question: "What is the purpose of Infrastructure as Code (IaC)?",
      options: ["Manual server configuration", "Automated infrastructure provisioning", "Application monitoring", "User access management"],
      correct: 1,
      explanation: "Infrastructure as Code allows you to manage and provision infrastructure through code rather than manual processes, enabling consistency and repeatability."
    },
    {
      question: "Which branching strategy is recommended for teams practicing continuous deployment?",
      options: ["Git Flow", "GitHub Flow", "Feature branching", "Release branching"],
      correct: 1,
      explanation: "GitHub Flow is recommended for continuous deployment as it's simple, focuses on master branch, and supports frequent deployments."
    },
    {
      question: "What is the primary benefit of implementing automated testing in CI/CD pipelines?",
      options: ["Faster development", "Early bug detection", "Reduced costs", "Better documentation"],
      correct: 1,
      explanation: "Automated testing in CI/CD pipelines helps detect bugs early in the development process, reducing the cost and effort of fixing issues."
    },
    {
      question: "Which Azure service provides container registry capabilities for DevOps workflows?",
      options: ["Azure Container Instances", "Azure Container Registry", "Azure Kubernetes Service", "Azure Service Fabric"],
      correct: 1,
      explanation: "Azure Container Registry provides a managed Docker registry service for storing and managing container images."
    },
    {
      question: "What is the purpose of feature flags in a DevOps environment?",
      options: ["Code versioning", "Conditional feature activation", "Performance monitoring", "Security scanning"],
      correct: 1,
      explanation: "Feature flags allow you to enable or disable features at runtime without deploying new code, supporting safe deployments and A/B testing."
    },
    {
      question: "Which tool is commonly used for configuration management in DevOps?",
      options: ["Ansible", "Terraform", "Docker", "Kubernetes"],
      correct: 0,
      explanation: "Ansible is a popular configuration management tool that automates software provisioning, configuration management, and application deployment."
    },
    {
      question: "What is the concept of 'shift-left' in DevOps security?",
      options: ["Moving production left", "Early security integration", "Left-side deployment", "Code review process"],
      correct: 1,
      explanation: "Shift-left refers to integrating security practices early in the development lifecycle rather than waiting until later stages."
    },
    {
      question: "Which metric is most important for measuring Site Reliability Engineering (SRE) success?",
      options: ["Code quality", "Service Level Objectives (SLOs)", "Deployment frequency", "Team velocity"],
      correct: 1,
      explanation: "Service Level Objectives (SLOs) are quantitative measures of service reliability and are fundamental to SRE practices."
    },
    {
      question: "What is the purpose of Blue-Green deployment strategy?",
      options: ["A/B testing", "Zero-downtime deployments", "Cost optimization", "Security enhancement"],
      correct: 1,
      explanation: "Blue-Green deployment maintains two identical production environments, allowing for zero-downtime deployments and quick rollbacks."
    },
    {
      question: "Which Azure DevOps extension helps with dependency scanning?",
      options: ["SonarQube", "WhiteSource", "Checkmarx", "All of the above"],
      correct: 3,
      explanation: "All these tools can be integrated with Azure DevOps to provide dependency scanning and security vulnerability detection."
    },
    {
      question: "What is the primary purpose of implementing monitoring and alerting in DevOps?",
      options: ["Cost tracking", "Proactive issue detection", "User management", "Code quality"],
      correct: 1,
      explanation: "Monitoring and alerting help detect issues proactively, enabling faster response times and better system reliability."
    },
    {
      question: "Which practice is essential for implementing effective disaster recovery in DevOps?",
      options: ["Manual backups", "Automated backup and recovery procedures", "Documentation only", "Local storage"],
      correct: 1,
      explanation: "Automated backup and recovery procedures ensure consistent, reliable disaster recovery capabilities and reduce human error."
    },
    {
      question: "What is the benefit of implementing continuous security scanning in CI/CD pipelines?",
      options: ["Faster deployments", "Early vulnerability detection", "Reduced infrastructure costs", "Better user experience"],
      correct: 1,
      explanation: "Continuous security scanning helps identify vulnerabilities early in the development process, reducing security risks in production."
    },
    {
      question: "Which Azure service helps implement policy as code?",
      options: ["Azure Policy", "Azure Blueprints", "Azure Resource Manager", "All of the above"],
      correct: 3,
      explanation: "Azure Policy, Blueprints, and ARM templates all support policy as code implementations in different ways."
    },
    {
      question: "What is the purpose of implementing canary deployments?",
      options: ["Cost reduction", "Risk mitigation during rollouts", "Performance improvement", "Security enhancement"],
      correct: 1,
      explanation: "Canary deployments reduce risk by gradually rolling out changes to a small subset of users before full deployment."
    },
    {
      question: "Which tool is commonly used for infrastructure provisioning in Azure DevOps?",
      options: ["Terraform", "ARM Templates", "Bicep", "All of the above"],
      correct: 3,
      explanation: "Terraform, ARM Templates, and Bicep are all used for infrastructure provisioning and can be integrated with Azure DevOps."
    },
    {
      question: "What is the primary goal of implementing ChatOps in a DevOps environment?",
      options: ["Team communication", "Automated operations through chat", "Documentation", "Code review"],
      correct: 1,
      explanation: "ChatOps integrates tools and automation into team chat platforms, enabling operations to be performed through conversation."
    },
    {
      question: "Which practice helps ensure code quality in DevOps pipelines?",
      options: ["Code reviews", "Static code analysis", "Unit testing", "All of the above"],
      correct: 3,
      explanation: "Code reviews, static analysis, and unit testing all contribute to maintaining high code quality in DevOps pipelines."
    },
    // Additional 10 questions to reach 30 total
    {
      question: "What is the primary purpose of implementing service mesh in microservices architecture?",
      options: ["Load balancing", "Service-to-service communication management", "Database management", "User authentication"],
      correct: 1,
      explanation: "Service mesh provides a dedicated infrastructure layer for managing service-to-service communication in microservices."
    },
    {
      question: "Which Azure service provides managed Kubernetes orchestration?",
      options: ["Azure Container Instances", "Azure Kubernetes Service", "Azure Service Fabric", "Azure Batch"],
      correct: 1,
      explanation: "Azure Kubernetes Service (AKS) provides managed Kubernetes orchestration for containerized applications."
    },
    {
      question: "What is the purpose of implementing chaos engineering in DevOps?",
      options: ["Create system failures", "Test system resilience", "Monitor performance", "Deploy applications"],
      correct: 1,
      explanation: "Chaos engineering involves intentionally introducing failures to test and improve system resilience."
    },
    {
      question: "Which metric indicates the frequency of successful deployments?",
      options: ["Mean Time to Recovery", "Lead Time for Changes", "Deployment Frequency", "Change Failure Rate"],
      correct: 2,
      explanation: "Deployment Frequency measures how often an organization successfully releases to production."
    },
    {
      question: "What is the primary benefit of implementing GitOps?",
      options: ["Faster development", "Declarative deployment management", "Better monitoring", "Cost reduction"],
      correct: 1,
      explanation: "GitOps uses Git as the single source of truth for declarative infrastructure and application deployment."
    },
    {
      question: "Which Azure service provides secrets management for DevOps workflows?",
      options: ["Azure Key Vault", "Azure Active Directory", "Azure Policy", "Azure Monitor"],
      correct: 0,
      explanation: "Azure Key Vault provides secure storage and management of secrets, keys, and certificates."
    },
    {
      question: "What is the purpose of implementing progressive delivery?",
      options: ["Faster deployments", "Controlled feature rollouts", "Cost optimization", "Security enhancement"],
      correct: 1,
      explanation: "Progressive delivery enables controlled rollouts of features to subsets of users to reduce risk."
    },
    {
      question: "Which practice helps maintain consistency across environments?",
      options: ["Environment parity", "Manual configuration", "Documentation", "Code reviews"],
      correct: 0,
      explanation: "Environment parity ensures that development, staging, and production environments are as similar as possible."
    },
    {
      question: "What is the primary purpose of implementing distributed tracing?",
      options: ["Error logging", "Performance monitoring across services", "Security scanning", "Cost tracking"],
      correct: 1,
      explanation: "Distributed tracing tracks requests across multiple microservices to understand performance bottlenecks."
    },
    {
      question: "Which Azure service provides build and release pipeline capabilities?",
      options: ["Azure Boards", "Azure Repos", "Azure Pipelines", "Azure Test Plans"],
      correct: 2,
      explanation: "Azure Pipelines provides comprehensive CI/CD capabilities for build and release management."
    }
  ];

  const questionPools = {
    'az-104': az104QuestionPool,
    'az-400': az400QuestionPool
  };

  // Security functions
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  };

  const logAuditEvent = (event, details = {}) => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      questionNumber: currentQuestion + 1,
      course: selectedCourse?.id
    };
    
    setAuditLog(prev => [...prev, auditEntry]);
    console.log('Audit Log:', auditEntry);
  };

  const handleSecurityViolation = (violationType, details) => {
    const violation = {
      type: violationType,
      timestamp: new Date().toISOString(),
      details,
      questionNumber: currentQuestion + 1
    };
    
    setSecurityViolations(prev => [...prev, violation]);
    logAuditEvent('SECURITY_VIOLATION', violation);
    
    if (violationType === 'TAB_SWITCH' && tabSwitchCount >= maxTabSwitches) {
      autoSubmitQuiz('Maximum tab switches exceeded');
    } else if (violationType === 'FULLSCREEN_EXIT') {
      autoSubmitQuiz('Fullscreen mode exited');
    }
    
    toast({
      title: "Security Warning",
      description: `${violationType.replace('_', ' ')} detected. Quiz activity is being monitored.`,
      variant: "destructive"
    });
  };

  const autoSubmitQuiz = (reason) => {
    logAuditEvent('AUTO_SUBMIT', { reason });
    clearTimers();
    setQuizComplete(true);
    
    const score = calculateFinalScore();
    setQuizResults({
      score,
      correct: Math.floor((score / 100) * randomizedQuestions.length),
      total: randomizedQuestions.length,
      passed: score >= 80,
      autoSubmitted: true,
      submitReason: reason
    });
    
    toast({
      title: "Quiz Auto-Submitted",
      description: reason,
      variant: "destructive"
    });
  };

  const calculateFinalScore = () => {
    let correct = 0;
    randomizedQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer && userAnswer.original === question.correct) {
        correct++;
      }
    });
    return (correct / randomizedQuestions.length) * 100;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectRandomQuestions = (courseId) => {
    const pool = questionPools[courseId];
    const shuffled = shuffleArray(pool);
    return shuffled.slice(0, 20); // Select 20 random questions
  };

  const getShuffledOptions = (question, questionIndex) => {
    const cacheKey = `${selectedCourse.id}-${questionIndex}-${sessionData.startTime}`;
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

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
      logAuditEvent('FULLSCREEN_ENTERED');
    } catch (error) {
      console.warn('Fullscreen not supported or denied');
      toast({
        title: "Fullscreen Required",
        description: "Please enable fullscreen mode for quiz security",
        variant: "destructive"
      });
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const clearTimers = () => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    if (overallTimerRef.current) {
      clearInterval(overallTimerRef.current);
    }
  };

  // Security event handlers
  const handleVisibilityChange = () => {
    if (quizStarted && !quizComplete) {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        handleSecurityViolation('TAB_SWITCH', { 
          count: tabSwitchCount + 1,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
    
    if (quizStarted && !quizComplete && !isCurrentlyFullscreen) {
      handleSecurityViolation('FULLSCREEN_EXIT', {
        timestamp: new Date().toISOString()
      });
    }
    
    setIsFullscreen(isCurrentlyFullscreen);
  };

  const handleKeyDown = (e) => {
    if (quizStarted && !quizComplete) {
      // Disable common cheating shortcuts
      const forbiddenKeys = [
        'F12', // Developer tools
        'F5', // Refresh
        'PrintScreen',
        'ContextMenu'
      ];
      
      const forbiddenCombos = [
        { key: 'c', ctrl: true }, // Ctrl+C
        { key: 'v', ctrl: true }, // Ctrl+V
        { key: 'a', ctrl: true }, // Ctrl+A
        { key: 'f', ctrl: true }, // Ctrl+F
        { key: 'r', ctrl: true }, // Ctrl+R
        { key: 'Tab', alt: true }, // Alt+Tab
        { key: 'F4', alt: true }, // Alt+F4
        { key: 'I', ctrl: true, shift: true }, // Ctrl+Shift+I
        { key: 'J', ctrl: true, shift: true }, // Ctrl+Shift+J
        { key: 'C', ctrl: true, shift: true }, // Ctrl+Shift+C
      ];
      
      if (forbiddenKeys.includes(e.key) || 
          forbiddenCombos.some(combo => 
            e.key === combo.key && 
            e.ctrlKey === !!combo.ctrl && 
            e.shiftKey === !!combo.shift && 
            e.altKey === !!combo.alt
          )) {
        e.preventDefault();
        handleSecurityViolation('FORBIDDEN_KEY', { key: e.key, modifiers: {
          ctrl: e.ctrlKey,
          shift: e.shiftKey,
          alt: e.altKey
        }});
      }
    }
  };

  const handleContextMenu = (e) => {
    if (quizStarted && !quizComplete) {
      e.preventDefault();
      handleSecurityViolation('RIGHT_CLICK', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleCopy = (e) => {
    if (quizStarted && !quizComplete) {
      e.preventDefault();
      handleSecurityViolation('COPY_ATTEMPT', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handlePaste = (e) => {
    if (quizStarted && !quizComplete) {
      e.preventDefault();
      handleSecurityViolation('PASTE_ATTEMPT', {
        timestamp: new Date().toISOString()
      });
    }
  };

  // Effects for security monitoring
  useEffect(() => {
    if (quizStarted) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      
      // Get session data
      setSessionData({
        ip: 'IP logging would require backend integration',
        userAgent: navigator.userAgent,
        startTime: new Date().toISOString(),
        deviceInfo: getDeviceInfo()
      });
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [quizStarted, quizComplete, currentQuestion, tabSwitchCount]);

  // Timer effects
  useEffect(() => {
    if (quizStarted && !quizComplete) {
      // Question timer
      questionTimerRef.current = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 1) {
            handleQuestionTimeout();
            return 120; // Reset for next question
          }
          return prev - 1;
        });
      }, 1000);
      
      // Overall timer
      overallTimerRef.current = setInterval(() => {
        setOverallTimer(prev => {
          if (prev <= 1) {
            autoSubmitQuiz('Time limit exceeded');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearTimers();
      };
    }
  }, [quizStarted, quizComplete]);

  const handleQuestionTimeout = () => {
    logAuditEvent('QUESTION_TIMEOUT', { questionNumber: currentQuestion + 1 });
    
    // Auto-advance to next question
    if (currentQuestion < randomizedQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setQuestionTimer(120); // Reset timer for next question
    } else {
      autoSubmitQuiz('Quiz time expired');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseOverview(true);
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizComplete(false);
    setQuizResults(null);
    setShowSurvey(false);
    setQuizStarted(false);
    setSecurityViolations([]);
    setAuditLog([]);
    setTabSwitchCount(0);
    setAdminApproval(false);
  };

  const startQuiz = async () => {
    // Initialize security measures
    setQuizStarted(true);
    setShowCourseOverview(false);
    setQuestionTimer(120);
    setOverallTimer(2400);
    
    // Select and randomize questions
    const selectedQuestions = selectRandomQuestions(selectedCourse.id);
    const randomized = shuffleArray(selectedQuestions);
    setRandomizedQuestions(randomized);
    
    // Clear any existing cache
    if (window.shuffledOptionsCache) {
      window.shuffledOptionsCache = {};
    }
    
    // Enter fullscreen
    await enterFullscreen();
    
    logAuditEvent('QUIZ_STARTED', {
      course: selectedCourse.id,
      questionsSelected: randomized.length,
      sessionStart: new Date().toISOString()
    });
    
    toast({
      title: "Secure Quiz Mode",
      description: "Quiz started in secure mode. Tab switching and copy/paste are disabled.",
    });
  };

  const handleAnswerSelect = (optionIndex, originalIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: { selected: optionIndex, original: originalIndex }
    }));
    
    logAuditEvent('ANSWER_SELECTED', {
      questionNumber: currentQuestion + 1,
      selectedOption: optionIndex,
      timestamp: new Date().toISOString()
    });
  };

  const nextQuestion = () => {
    logAuditEvent('QUESTION_NAVIGATION', {
      from: currentQuestion + 1,
      to: currentQuestion + 2,
      direction: 'forward'
    });
    
    if (currentQuestion < randomizedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionTimer(120); // Reset timer for new question
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    clearTimers();
    exitFullscreen();
    setQuizStarted(false);
    
    const score = calculateFinalScore();
    const passed = score >= 80;

    setQuizResults({
      score,
      correct: Math.floor((score / 100) * randomizedQuestions.length),
      total: randomizedQuestions.length,
      passed,
      autoSubmitted: false
    });
    setQuizComplete(true);

    logAuditEvent('QUIZ_COMPLETED', {
      score,
      passed,
      totalViolations: securityViolations.length,
      completionTime: new Date().toISOString()
    });

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
    setShowCourseOverview(true);
    setQuizStarted(false);
    setSecurityViolations([]);
    setAuditLog([]);
    setTabSwitchCount(0);
    setRandomizedQuestions([]);
  };

  const completeCourse = () => {
    setCompletedCourses(prev => new Set([...prev, selectedCourse.id]));
    setShowSurvey(true);
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
                <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
                <ul className="space-y-2">
                  {selectedCourse.overview.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Certification Relevance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedCourse.overview.relevance}
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">Secure Quiz Environment</h4>
                    <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                      <li>• Quiz will enter fullscreen mode automatically</li>
                      <li>• 40-minute time limit with 2 minutes per question</li>
                      <li>• Copy/paste and right-click are disabled</li>
                      <li>• Maximum 2 tab switches allowed</li>
                      <li>• No backtracking to previous questions</li>
                      <li>• Questions are randomized from a larger pool</li>
                      <li>• All activity is monitored and logged</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Quiz Information</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This course includes 20 randomized questions from a larger pool. You need to score 80% or higher to pass. 
                      Results will be available only after admin approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={startQuiz} className="flex-1">
                <Lock className="w-4 h-4 mr-2" />
                Start Secure Quiz
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
              Your feedback helps us improve our certification training programs.
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

  // Quiz Results Component (Secure - No immediate answers)
  if (selectedCourse && quizComplete) {
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
              <div className={`text-6xl font-bold ${quizResults.passed ? 'text-green-500' : 'text-red-500'}`}>
                {quizResults.score.toFixed(0)}%
              </div>
              <div className="space-y-1">
                <p className="text-lg">
                  You answered {quizResults.correct} out of {quizResults.total} questions correctly
                </p>
                <p className="text-sm text-muted-foreground">
                  {quizResults.passed ? 'Congratulations! You passed the certification quiz.' : 'You need 80% to pass. Please try again.'}
                </p>
                {quizResults.autoSubmitted && (
                  <p className="text-sm text-red-600 font-medium">
                    Quiz was auto-submitted: {quizResults.submitReason}
                  </p>
                )}
              </div>
            </div>

            {/* Security Summary */}
            {securityViolations.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-red-800 dark:text-red-200">Security Violations Detected</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {securityViolations.length} security violation(s) were detected during your quiz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No immediate answer review for security */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Answer Review Pending</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    For security reasons, detailed answer explanations will be available only after admin approval. 
                    You will be notified when the review is complete.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              {quizResults.passed && !quizResults.autoSubmitted ? (
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

  // Secure Quiz Interface
  if (selectedCourse && !showCourseOverview && quizStarted) {
    if (randomizedQuestions.length === 0) {
      return (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Preparing secure quiz environment...</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentQ = randomizedQuestions[currentQuestion];
    const shuffledOptions = getShuffledOptions(currentQ, currentQuestion);
    const userAnswer = userAnswers[currentQuestion];

    return (
      <div className="max-w-2xl mx-auto space-y-6" 
           onContextMenu={handleContextMenu}
           onCopy={handleCopy}
           onPaste={handlePaste}>
        
        {/* Security Status Bar */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Timer className="w-4 h-4 text-red-600" />
                <span className="font-mono text-red-700">Question: {formatTime(questionTimer)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="font-mono text-red-700">Total: {formatTime(overallTimer)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isFullscreen ? "default" : "destructive"} className="text-xs">
                {isFullscreen ? "🔒 Secure" : "⚠️ Not Secure"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Violations: {securityViolations.length}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {randomizedQuestions.length}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Tab switches: {tabSwitchCount}/{maxTabSwitches}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <selectedCourse.icon className="w-5 h-5" />
              <span>{selectedCourse.title}</span>
            </CardTitle>
            <Progress value={((currentQuestion + 1) / randomizedQuestions.length) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium leading-relaxed select-none">
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
                      className="flex-1 cursor-pointer leading-relaxed select-none"
                    >
                      {item.option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-4">
              {/* No back navigation for security */}
              <div></div>
              <Button 
                onClick={nextQuestion}
                disabled={!userAnswer}
              >
                {currentQuestion === randomizedQuestions.length - 1 ? 'Submit Quiz' : 'Next'}
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
          <p className="text-muted-foreground">Microsoft Azure certification courses with secure interactive quizzes</p>
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
              <span className="font-medium">{completedCourses.size} of {courses.length} completed</span>
            </div>
            <Progress value={(completedCourses.size / courses.length) * 100} className="h-2" />
            {completedCourses.size === courses.length && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-green-600 font-medium">All certifications completed!</span>
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
            <Card key={course.id} className={`transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-lg ${course.color} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
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
                
                {/* Security features badge */}
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Secure proctored quiz environment</span>
                </div>
                
                <Button 
                  onClick={() => startCourse(course)} 
                  className="w-full"
                  variant={isCompleted ? "outline" : "default"}
                >
                  {isCompleted ? 'Review Course' : 'Start Course'}
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