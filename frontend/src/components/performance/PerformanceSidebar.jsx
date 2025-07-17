
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Target, TrendingUp, Award, Calendar } from 'lucide-react';

export function PerformanceSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  const performanceData = {
    overallScore: 87,
    yearProgress: 75, // 3 quarters completed
    quarters: [
      { 
        quarter: 'Q1', 
        score: 85, 
        status: 'completed',
        goals: { completed: 8, total: 10 },
        highlights: ['Project Alpha delivered on time', 'Leadership workshop completed']
      },
      { 
        quarter: 'Q2', 
        score: 92, 
        status: 'completed',
        goals: { completed: 9, total: 10 },
        highlights: ['Team mentoring initiative', 'Process improvement implemented']
      },
      { 
        quarter: 'Q3', 
        score: 84, 
        status: 'completed',
        goals: { completed: 7, total: 9 },
        highlights: ['Client presentation success', 'New certification achieved']
      },
      { 
        quarter: 'Q4', 
        score: 0, 
        status: 'in-progress',
        goals: { completed: 3, total: 8 },
        highlights: ['Performance review scheduled', 'Annual goals planning']
      }
    ],
    expectations: [
      { area: 'Technical Skills', current: 88, target: 90, status: 'on-track' },
      { area: 'Communication', current: 85, target: 85, status: 'met' },
      { area: 'Leadership', current: 78, target: 85, status: 'needs-improvement' },
      { area: 'Innovation', current: 92, target: 80, status: 'exceeded' }
    ],
    goals: [
      { 
        title: 'Complete Advanced Certification', 
        progress: 75, 
        deadline: '2024-12-15',
        category: 'Professional Development'
      },
      { 
        title: 'Lead Cross-Functional Project', 
        progress: 60, 
        deadline: '2024-11-30',
        category: 'Leadership'
      },
      { 
        title: 'Mentor 2 Junior Employees', 
        progress: 100, 
        deadline: '2024-10-31',
        category: 'Team Development'
      },
      { 
        title: 'Improve Process Efficiency by 15%', 
        progress: 40, 
        deadline: '2024-12-31',
        category: 'Process Improvement'
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded': return 'bg-success text-success-foreground';
      case 'met': case 'on-track': return 'bg-primary text-primary-foreground';
      case 'needs-improvement': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getQuarterIcon = (quarter) => {
    const quarterNum = parseInt(quarter.replace('Q', ''));
    return quarterNum <= currentQuarter ? '✓' : '○';
  };

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Performance Hub</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Overall Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Overall Performance {currentYear}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{performanceData.overallScore}%</div>
                  <p className="text-xs text-muted-foreground">Current Score</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Year Progress</span>
                    <span>{performanceData.yearProgress}%</span>
                  </div>
                  <Progress value={performanceData.yearProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Quarterly Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.quarters.map((quarter) => (
                    <div key={quarter.quarter} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getQuarterIcon(quarter.quarter)}</span>
                          <span className="font-medium">{quarter.quarter} {currentYear}</span>
                        </div>
                        <Badge className={getStatusColor(quarter.status)} size="sm">
                          {quarter.status === 'in-progress' ? 'Active' : quarter.score + '%'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Goals: {quarter.goals.completed}/{quarter.goals.total} completed
                      </div>
                      <Progress 
                        value={(quarter.goals.completed / quarter.goals.total) * 100} 
                        className="h-1 mb-2" 
                      />
                      <div className="text-xs space-y-1">
                        {quarter.highlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="text-muted-foreground">• {highlight}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expectations Tracking */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance Expectations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.expectations.map((expectation, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{expectation.area}</span>
                        <Badge className={getStatusColor(expectation.status)} size="sm">
                          {expectation.current}%
                        </Badge>
                      </div>
                      <div className="relative">
                        <Progress value={expectation.current} className="h-2" />
                        <div 
                          className="absolute top-0 w-0.5 h-2 bg-destructive"
                          style={{ left: `${expectation.target}%` }}
                          title={`Target: ${expectation.target}%`}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {expectation.current}%</span>
                        <span>Target: {expectation.target}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Active Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.goals.map((goal, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium">{goal.title}</h4>
                        <Badge variant="outline" size="sm">{goal.progress}%</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {goal.category} • Due: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                      <Progress value={goal.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Set New Goal
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
