
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Activity, Clock, Globe } from 'lucide-react';

export function SystemAnalytics() {
  const analyticsData = {
    totalLogins: 1247,
    activeUsers: 98,
    portalUsage: {
      employee: 65,
      hr: 20,
      it: 15
    },
    dailyLogins: [45, 52, 48, 61, 55, 67, 59],
    topFeatures: [
      { name: 'Dashboard', usage: 89 },
      { name: 'Profile', usage: 76 },
      { name: 'Timesheet', usage: 68 },
      { name: 'Leave Requests', usage: 45 },
      { name: 'Support Tickets', usage: 32 }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          System Analytics
        </CardTitle>
        <CardDescription>
          Monitor platform usage, engagement metrics, and user behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% this month
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Logins</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.totalLogins}</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8% this week
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Session</span>
            </div>
            <div className="text-2xl font-bold">24m</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +3m this week
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Portal Views</span>
            </div>
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15% today
            </div>
          </div>
        </div>

        {/* Portal Usage Distribution */}
        <div className="space-y-3">
          <h3 className="font-semibold">Portal Usage Distribution</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Employee Portal</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${analyticsData.portalUsage.employee}%` }} />
                </div>
                <span className="text-sm font-medium">{analyticsData.portalUsage.employee}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">HR Portal</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analyticsData.portalUsage.hr}%` }} />
                </div>
                <span className="text-sm font-medium">{analyticsData.portalUsage.hr}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">IT Portal</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.portalUsage.it}%` }} />
                </div>
                <span className="text-sm font-medium">{analyticsData.portalUsage.it}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Features */}
        <div className="space-y-3">
          <h3 className="font-semibold">Most Used Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analyticsData.topFeatures.map((feature, index) => (
              <div key={feature.name} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{feature.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{feature.usage}% usage</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Login Chart Placeholder */}
        <div className="space-y-3">
          <h3 className="font-semibold">Daily Login Activity</h3>
          <div className="h-32 border rounded-lg flex items-end justify-center gap-2 p-4">
            {analyticsData.dailyLogins.map((logins, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div 
                  className="bg-blue-600 rounded-t w-8" 
                  style={{ height: `${(logins / Math.max(...analyticsData.dailyLogins)) * 80}px` }}
                />
                <span className="text-xs text-muted-foreground">{logins}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
