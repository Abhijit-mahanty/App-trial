import { FC } from "react";
import { Link } from "wouter";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, CalendarDays, CheckSquare, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Dashboard: FC = () => {
  const { data: summary, isLoading, isError } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Loading your caseload overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2"><CardTitle className="h-4 w-24 bg-muted rounded"></CardTitle></CardHeader>
              <CardContent><div className="h-8 w-12 bg-muted rounded"></div></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">A summary of your active cases, deadlines, and tasks.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.activeCases}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {summary.totalCases} total cases</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-destructive shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority Deadlines</CardTitle>
            <CalendarDays className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{summary.highPriorityDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.upcomingDeadlines} total upcoming</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Cases</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{summary.pendingCases}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.openTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.inProgressTasks} in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest updates across your caseload</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-6">
                {summary.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      {idx !== summary.recentActivity.length - 1 && (
                        <div className="w-px h-full bg-border mt-2 group-hover:bg-primary/30 transition-colors"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.type}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs font-normal">
                        {activity.caseName}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/cases" className="block p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium">
              Browse All Cases
            </Link>
            <Link href="/calendar" className="block p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium">
              View Calendar
            </Link>
            <Link href="/documents" className="block p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium">
              Search Documents
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
