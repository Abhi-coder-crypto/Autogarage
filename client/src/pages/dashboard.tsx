import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const JOB_STAGES = [
  'New Lead',
  'Inspection Done',
  'Work In Progress',
  'Ready for Delivery',
  'Completed'
];

const STAGE_COLORS: Record<string, string> = {
  'New Lead': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Inspection Done': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Work In Progress': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Ready for Delivery': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
};

const STAGE_DOT: Record<string, string> = {
  'New Lead': 'bg-blue-500',
  'Inspection Done': 'bg-yellow-500',
  'Work In Progress': 'bg-orange-500',
  'Ready for Delivery': 'bg-green-500',
  'Completed': 'bg-emerald-500'
};

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard.stats,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.jobs.list(),
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: api.inventory.lowStock,
  });

  const jobsByStage = JOB_STAGES.reduce((acc, stage) => {
    acc[stage] = jobs.filter((j: any) => j.stage === stage);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">AutoGarage CRM</p>
        </div>
        <Link href="/jobs?new=true">
          <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium" data-testid="button-new-job-header">
            + New Job
          </button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border" data-testid="card-total-jobs">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Total Jobs</p>
            <p className="text-4xl font-display font-bold mt-2 text-foreground">{stats?.totalJobs || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border" data-testid="card-active-jobs">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Active</p>
            <p className="text-4xl font-display font-bold mt-2 text-orange-500">{stats?.activeJobs || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border" data-testid="card-completed">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Completed</p>
            <p className="text-4xl font-display font-bold mt-2 text-green-500">{stats?.completedJobs || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border" data-testid="card-revenue">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Revenue</p>
            <p className="text-3xl font-display font-bold mt-2 text-foreground">
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="bg-red-950/30 border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-400 text-base font-medium">
              <AlertCircle className="w-4 h-4" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((item: any) => (
                <Badge key={item._id} variant="outline" className="border-red-500/40 text-red-400 bg-red-500/10">
                  {item.name}: {item.quantity} {item.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Job Pipeline</h2>
          <Link href="/jobs">
            <span className="text-sm text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1" data-testid="link-view-all-jobs">
              View all <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {JOB_STAGES.map((stage) => (
            <Card key={stage} className="bg-card border-border" data-testid={`funnel-${stage.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", STAGE_DOT[stage])} />
                  <CardTitle className="text-sm font-medium text-foreground flex-1">{stage}</CardTitle>
                  <span className="text-lg font-bold text-foreground">
                    {jobsByStage[stage]?.length || 0}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 max-h-48 overflow-y-auto">
                {jobsByStage[stage]?.slice(0, 4).map((job: any) => (
                  <Link key={job._id} href={`/jobs/${job._id}`}>
                    <div 
                      className="p-2.5 bg-background/50 rounded-lg hover:bg-background transition-colors cursor-pointer border border-border/50"
                      data-testid={`job-card-${job._id}`}
                    >
                      <p className="font-medium text-sm text-foreground truncate">{job.vehicleName}</p>
                      <p className="text-xs text-muted-foreground">{job.plateNumber}</p>
                    </div>
                  </Link>
                ))}
                {(!jobsByStage[stage] || jobsByStage[stage].length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">—</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground font-medium">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {jobs.slice(0, 6).map((job: any) => (
                <Link key={job._id} href={`/jobs/${job._id}`}>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer"
                    data-testid={`recent-job-${job._id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{job.vehicleName}</p>
                      <p className="text-sm text-muted-foreground truncate">{job.customerName} • {job.plateNumber}</p>
                    </div>
                    <Badge className={cn("border shrink-0 ml-2", STAGE_COLORS[job.stage])}>
                      {job.stage}
                    </Badge>
                  </div>
                </Link>
              ))}
              {jobs.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No jobs yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/jobs?new=true">
              <div className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/30" data-testid="action-new-job">
                <p className="font-medium text-primary">+ Create New Job</p>
                <p className="text-xs text-muted-foreground mt-1">Start a new service</p>
              </div>
            </Link>
            <Link href="/customers?new=true">
              <div className="p-4 rounded-lg hover:bg-background/80 transition-colors cursor-pointer border border-border" data-testid="action-new-customer">
                <p className="font-medium text-foreground">+ Add Customer</p>
                <p className="text-xs text-muted-foreground mt-1">Register new customer</p>
              </div>
            </Link>
            <Link href="/appointments?new=true">
              <div className="p-4 rounded-lg hover:bg-background/80 transition-colors cursor-pointer border border-border" data-testid="action-new-appointment">
                <p className="font-medium text-foreground">+ Book Appointment</p>
                <p className="text-xs text-muted-foreground mt-1">Schedule a slot</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
